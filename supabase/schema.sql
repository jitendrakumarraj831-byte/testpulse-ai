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

-- ============================================================
-- Student/teacher accounts (Supabase Auth + role-gated profiles)
-- ============================================================
-- Run this block once to enable real accounts, /auth/register,
-- /auth/login, and the authenticated /admin/* gate. Nothing above this
-- section depends on it — the app keeps working with anonymous
-- name-based submissions either way.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  batch text,
  role text not null default 'student' check (role in ('student', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every signed-in user can see and edit their own profile row.
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can see and manage every profile. The subquery checks the
-- CALLER's own row (admin_check.id = auth.uid()), which the policy above
-- already makes visible to them — so this does not recurse into itself,
-- it's the standard Supabase role-check idiom.
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- Auto-creates a profile row (role always defaults to 'student' — there is
-- deliberately no public path to becoming an admin) the moment someone
-- completes Supabase Auth sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, batch)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'batch'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One-time manual step — run this yourself after your first real signup.
-- There is intentionally no self-service or API path to grant admin:
--   update public.profiles set role = 'admin' where email = 'you@example.com';

-- ============================================================
-- Link student_responses to the authenticated profile
-- ============================================================
-- Before this, a submission was matched back to a student only by the
-- free-text `student_name` field (see the streak/leaderboard lookups),
-- which pre-dates real accounts and doesn't survive a display-name change
-- or a typo. This ties new submissions to the signed-in auth user while
-- leaving `student_name` in place so older, pre-auth anonymous rows (and
-- anyone still taking a test while logged out) keep working exactly as
-- before — nothing here is a breaking change.
alter table public.student_responses
  add column if not exists student_id uuid references auth.users (id) on delete set null;

create index if not exists student_responses_student_id_idx
  on public.student_responses (student_id);

-- Re-grant the leaderboard-safe column set to include student_id (both for
-- direct table queries like the streak lookup, and because the view below
-- runs with security_invoker = true, so it needs the querying role to hold
-- this grant itself).
revoke select on public.student_responses from anon, authenticated;
grant select (id, exam_id, student_name, student_id, score, submitted_at)
  on public.student_responses to anon, authenticated;

create or replace view public.leaderboard_entries
with (security_invoker = true) as
select id, exam_id, student_name, student_id, score, submitted_at
from public.student_responses;

-- ============================================================
-- Institute-wide feature settings (Enterprise Admin Suite)
-- ============================================================
-- A single settings row every admin shares — "System Settings" toggles
-- like AI Proctoring apply platform-wide, not per-admin, so this is
-- intentionally a singleton (enforced by the fixed id) rather than a
-- per-user preferences table.
create table if not exists public.institute_settings (
  id boolean primary key default true check (id),
  ai_proctoring_enabled boolean not null default true,
  whatsapp_reports_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.institute_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.institute_settings enable row level security;

-- Readable by anyone — the anonymous exam workspace (TestWorkspace) needs
-- ai_proctoring_enabled to decide whether to run its anti-cheat engine,
-- and there's no per-student sensitivity in these two flags.
create policy "Institute settings are publicly readable"
  on public.institute_settings for select
  using (true);

-- Only admins may change them (same admin-check idiom as the profiles policies).
create policy "Admins can update institute settings"
  on public.institute_settings for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );
