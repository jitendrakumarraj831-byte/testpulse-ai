-- TestPulse AI core schema: published exams and student attempt tracking.
-- Run against a Supabase/Postgres project (SQL Editor or `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  topic text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  questions jsonb not null,
  created_at timestamptz not null default now()
);

-- exam_id is a free-form identifier rather than a uuid FK into `exams`,
-- because today's student-facing catalog is a hardcoded mock catalog
-- (string slugs like "science-rotational-dynamics-101"), not rows in
-- `exams` — that table is only populated by the AI-generator publish
-- flow. A strict FK would reject every response against a mock exam.
create table if not exists public.student_responses (
  id uuid primary key default gen_random_uuid(),
  exam_id text not null,
  student_name text not null,
  answers jsonb not null,
  score numeric,
  submitted_at timestamptz not null default now()
);

create index if not exists student_responses_exam_id_idx
  on public.student_responses (exam_id);

alter table public.exams enable row level security;
alter table public.student_responses enable row level security;

-- Published exams are readable by anyone with the link (students taking a test).
create policy "Exams are publicly readable"
  on public.exams for select
  using (true);

-- The admin AI question generator publishes new exams from the browser
-- using the same anon/publishable key as everything else in this app (no
-- separate admin-auth system yet), so an insert policy is required or
-- RLS silently rejects every "Approve & Publish Test" click.
create policy "Anyone can publish an exam"
  on public.exams for insert
  with check (true);

-- Students may submit responses; responses are not publicly listable.
create policy "Anyone can submit a student response"
  on public.student_responses for insert
  with check (true);

-- Public leaderboard projection: exposes only the columns needed for
-- rankings, never the raw `answers` JSONB. security_invoker = true
-- means the view runs with the *querying* role's own privileges
-- (Supabase's security advisor flags the alternative, invoker = false,
-- as a "Security Definer View" critical finding) — so read access now
-- depends on the row policy + column grants below rather than the
-- view silently running as its owner.
create or replace view public.leaderboard_entries
with (security_invoker = true) as
select id, exam_id, student_name, score, submitted_at
from public.student_responses;

-- Row-level policy needed for the invoker-privilege view (and any
-- direct query) to see rows at all.
drop policy if exists "Leaderboard columns are publicly readable" on public.student_responses;
create policy "Leaderboard columns are publicly readable"
  on public.student_responses for select
  using (true);

-- RLS only restricts *rows*, not *columns* — a bare "grant select on
-- student_responses" here would hand out `answers` (every student's
-- actual selected options) to anyone with the public anon key. Revoke
-- any broader table-level SELECT first (Supabase's default project
-- privileges can otherwise pre-grant it), then grant SELECT scoped to
-- only the five leaderboard-safe columns. Querying `answers` directly,
-- or `select *`, must keep failing with a permission error for anon/
-- authenticated even though this table row-policy is now `using (true)`.
revoke select on public.student_responses from anon, authenticated;
grant select (id, exam_id, student_name, score, submitted_at)
  on public.student_responses to anon, authenticated;

grant select on public.leaderboard_entries to anon, authenticated;

-- Institution demo-request inquiries submitted from the homepage pricing
-- section ("Request Live Demo" / "Talk to Sales" CTAs).
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  institute_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  plan_interest text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.demo_requests enable row level security;

-- Anyone can submit an inquiry; inquiries are not publicly listable
-- (only readable via the service role / Supabase dashboard).
create policy "Anyone can submit a demo request"
  on public.demo_requests for insert
  with check (true);

-- Optional, additive: powers the admin "Exam Insights" hardest-question
-- stat. student_responses.answers is deliberately locked down from
-- anon/authenticated (see the revoke above) so no individual student's
-- answers ever reach the browser — this function is `security definer`
-- specifically so it CAN read `answers` server-side, but it only ever
-- returns aggregated counts/percentages per question, never a raw
-- per-student answer, so it doesn't reopen that privacy boundary.
-- Safe to run at any time; the admin UI works without it too (it falls
-- back to a coarser topic-level estimate if this function isn't present).
create or replace function public.exam_question_stats(target_exam_id uuid)
returns table (
  question_id integer,
  question_text text,
  attempt_count bigint,
  miss_count bigint,
  miss_rate_percent numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select
    (q->>'id')::integer as question_id,
    q->>'question' as question_text,
    count(sr.id) as attempt_count,
    count(sr.id) filter (
      where (sr.answers ->> (q->>'id')) is distinct from (q->>'correctAnswer')
    ) as miss_count,
    round(
      100.0 * count(sr.id) filter (
        where (sr.answers ->> (q->>'id')) is distinct from (q->>'correctAnswer')
      ) / nullif(count(sr.id), 0)
    ) as miss_rate_percent
  from public.exams e
  cross join lateral jsonb_array_elements(e.questions) as q
  left join public.student_responses sr
    on sr.exam_id = e.id::text
  where e.id = target_exam_id
  group by q
  order by miss_rate_percent desc nulls last;
$$;

grant execute on function public.exam_question_stats(uuid) to anon, authenticated;
