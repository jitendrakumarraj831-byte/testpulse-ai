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

-- The "Users can update their own profile" policy above only has a USING
-- clause, no WITH CHECK — and per Postgres RLS semantics, an UPDATE policy
-- without an explicit WITH CHECK reuses USING (auth.uid() = id) for the new
-- row too. That only re-validates the id column, so on its own it leaves a
-- privilege-escalation hole: any authenticated student could run
-- `update public.profiles set role = 'admin' where id = auth.uid()` (or
-- flip their own `status` back to 'active' after being suspended) and the
-- policy would allow it, contradicting the "no public path to becoming an
-- admin" guarantee this schema otherwise relies on. RLS policies can't
-- express "this column may only change if X", so we close the gap with a
-- BEFORE UPDATE trigger instead: it lets admins change role/status freely
-- (needed for the StudentDirectory suspend/activate + role tools) but
-- rejects any attempt to change either column from a non-admin actor,
-- regardless of which UPDATE policy let the statement through.
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role or new.status is distinct from old.status then
    if not exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    ) then
      raise exception 'Only admins can change role or status.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_columns on public.profiles;
create trigger protect_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

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

-- ============================================================
-- Reading Room / Digital Library (Module 2.2)
-- ============================================================
-- `category` is the content type shown as filter tabs in the library UI
-- (books, chapter notes, or curated premium catalogs); `access_level` is
-- an orthogonal flag — a book or a notes packet can independently be
-- free or premium.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null check (category in ('book', 'notes', 'catalog')),
  file_url text not null,
  access_level text not null default 'free' check (access_level in ('free', 'premium')),
  created_at timestamptz not null default now()
);

create index if not exists resources_category_idx on public.resources (category);

alter table public.resources enable row level security;

-- Deliberately NO public/authenticated select policy on the base table.
-- Every resource's title/description/category is meant to be freely
-- browsable (it's a catalog), but `file_url` for a premium resource is
-- exactly the thing that must stay hidden from anyone who hasn't signed
-- in — and a plain row policy can only hide whole rows, not mask one
-- column conditionally per row. Browsing goes through the
-- `library_catalog()` function below instead, which is `security
-- definer` specifically so it CAN read every row's real `file_url` to
-- decide what to return — same justification as `exam_question_stats`
-- above. Admins get their own direct-table policies further down for
-- managing entries.
create policy "Admins can view all resource columns"
  on public.resources for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can insert resources"
  on public.resources for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update resources"
  on public.resources for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete resources"
  on public.resources for delete
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- Public/student library catalog: every resource's metadata is always
-- returned (so anon and signed-in visitors alike can browse and filter),
-- but a premium resource's `file_url` is only included when the caller is
-- signed in — there's no paid-tier/token system yet (that's Module 3.1's
-- "Premium Content Lock"), so "signed in" is the interim gate, same
-- posture the rest of this schema takes pre-3.1. A logged-out visitor
-- still sees the premium card (title, description, "Premium" badge) so
-- they know it exists, just without a usable link.
create or replace function public.library_catalog()
returns table (
  id uuid,
  title text,
  description text,
  category text,
  access_level text,
  file_url text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id,
    r.title,
    r.description,
    r.category,
    r.access_level,
    case
      when r.access_level = 'free' then r.file_url
      when auth.uid() is not null then r.file_url
      else null
    end as file_url,
    r.created_at
  from public.resources r
  order by r.created_at desc;
$$;

grant execute on function public.library_catalog() to anon, authenticated;

-- ============================================================
-- Student Academic Hub (schedule/timetable, homework, attendance)
-- ============================================================
-- `batch` on all three tables below is an optional free-text filter — it
-- mirrors `profiles.batch` (also free text, typed at signup), not a
-- foreign key. A null batch means "everyone"; a set batch is matched
-- client-side against the viewing student's own `profiles.batch`. This
-- isn't a security boundary (every authenticated user can read every row
-- regardless of batch — knowing another batch's timetable isn't
-- sensitive), just a relevance filter, so it doesn't need to be enforced
-- in RLS.

create table if not exists public.class_schedule (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  -- 'class' entries may carry a join_url — that's the whole "virtual
  -- classes" feature: a scheduled class with an external Zoom/Meet/etc.
  -- link, not in-app video conferencing.
  event_type text not null default 'class' check (event_type in ('class', 'exam', 'event')),
  batch text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  join_url text,
  notes text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint class_schedule_ends_after_starts check (ends_at > starts_at)
);

create index if not exists class_schedule_starts_at_idx on public.class_schedule (starts_at);

alter table public.class_schedule enable row level security;

create policy "Signed-in users can view the schedule"
  on public.class_schedule for select
  using (auth.uid() is not null);

create policy "Admins can insert schedule entries"
  on public.class_schedule for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update schedule entries"
  on public.class_schedule for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete schedule entries"
  on public.class_schedule for delete
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  subject text not null,
  batch text,
  due_at timestamptz not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists assignments_due_at_idx on public.assignments (due_at);

alter table public.assignments enable row level security;

create policy "Signed-in users can view assignments"
  on public.assignments for select
  using (auth.uid() is not null);

create policy "Admins can insert assignments"
  on public.assignments for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update assignments"
  on public.assignments for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete assignments"
  on public.assignments for delete
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- One row per student per assignment — `unique` makes a resubmission a
-- plain `upsert` on (assignment_id, student_id) instead of needing a
-- separate "delete my old submission first" step.
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  response_text text not null default '',
  response_url text,
  status text not null default 'submitted' check (status in ('submitted', 'graded')),
  grade text,
  feedback text,
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists assignment_submissions_student_id_idx
  on public.assignment_submissions (student_id);

alter table public.assignment_submissions enable row level security;

-- Students see and manage only their own submission; admins see every
-- submission (needed to grade them).
create policy "Students can view their own submissions"
  on public.assignment_submissions for select
  using (auth.uid() = student_id);

create policy "Admins can view all submissions"
  on public.assignment_submissions for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Students can submit their own work"
  on public.assignment_submissions for insert
  with check (auth.uid() = student_id);

create policy "Students can update their own submission"
  on public.assignment_submissions for update
  using (auth.uid() = student_id);

create policy "Admins can update any submission"
  on public.assignment_submissions for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- Same privilege-escalation gap as profiles' self-update policy (see the
-- comment above `protect_profile_privileged_columns`): "Students can
-- update their own submission" has no WITH CHECK beyond auth.uid() =
-- student_id, so without this trigger a student could set their own
-- grade/feedback/status directly. Lets admins grade freely while blocking
-- a student from touching those three columns on their own row.
create or replace function public.protect_submission_grading_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.grade is distinct from old.grade
    or new.feedback is distinct from old.feedback
    or new.status is distinct from old.status
  then
    if not exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    ) then
      raise exception 'Only admins can set grade, feedback, or status.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_submission_grading_columns on public.assignment_submissions;
create trigger protect_submission_grading_columns
  before update on public.assignment_submissions
  for each row execute function public.protect_submission_grading_columns();

-- One row per student per day — admin-recorded only (no student
-- insert/update policy at all: attendance a student could edit themselves
-- wouldn't mean anything).
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent', 'late')),
  batch text,
  marked_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create index if not exists attendance_records_date_idx on public.attendance_records (attendance_date);

alter table public.attendance_records enable row level security;

create policy "Students can view their own attendance"
  on public.attendance_records for select
  using (auth.uid() = student_id);

create policy "Admins can view all attendance"
  on public.attendance_records for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can record attendance"
  on public.attendance_records for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update attendance"
  on public.attendance_records for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete attendance"
  on public.attendance_records for delete
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- ============================================================
-- Fee Ledger & Receipts (Module 4.2)
-- ============================================================
-- Manual ledger only — an admin records a payment they already received
-- (cash, bank transfer, UPI, etc.) and this generates a receipt. There is
-- deliberately no payment gateway integration here and no way for money to
-- move through the app itself; that's a materially bigger, separate
-- decision (choosing and wiring a live gateway) that hasn't been made.
-- `student_id` is nullable so a payment can be recorded against a walk-in
-- payer who doesn't have (or doesn't yet have) an account.
create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null,
  student_id uuid references auth.users (id) on delete set null,
  payer_name text not null,
  amount numeric not null check (amount > 0),
  payment_method text not null default 'cash' check (payment_method in ('cash', 'bank_transfer', 'upi', 'cheque', 'other')),
  fee_period text not null default '',
  notes text not null default '',
  recorded_by uuid references auth.users (id) on delete set null,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (receipt_number)
);

create index if not exists fee_payments_paid_at_idx on public.fee_payments (paid_at);
create index if not exists fee_payments_student_id_idx on public.fee_payments (student_id);

alter table public.fee_payments enable row level security;

-- Financial records — admin-only in every direction, no student read
-- access (a student's own fee history isn't exposed by this module yet).
create policy "Admins can view fee payments"
  on public.fee_payments for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can record fee payments"
  on public.fee_payments for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update fee payments"
  on public.fee_payments for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete fee payments"
  on public.fee_payments for delete
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- ============================================================
-- Gamified Reward Vault (Module 2.4)
-- ============================================================
-- `source_key` is an idempotency key ('daily:2026-07-10',
-- 'streak-milestone:7', ...) enforced by the unique constraint below, so
-- calling award_learning_points() many times in a row (every dashboard
-- load, every test submission) never double-awards the same event.
create table if not exists public.reward_points_ledger (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  points integer not null check (points > 0),
  reason text not null,
  source_key text not null,
  created_at timestamptz not null default now(),
  unique (student_id, source_key)
);

create index if not exists reward_points_ledger_student_id_idx
  on public.reward_points_ledger (student_id);

alter table public.reward_points_ledger enable row level security;

create policy "Students can view their own reward points"
  on public.reward_points_ledger for select
  using (auth.uid() = student_id);

create policy "Admins can view all reward points"
  on public.reward_points_ledger for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- Deliberately no insert/update/delete policy for students or admins —
-- every row is written exclusively by award_learning_points() below (a
-- security definer function), so a client can never insert an arbitrary
-- point value for itself via a direct table write.

-- Recomputes this student's award state from their own real
-- student_responses history and inserts any ledger rows they've newly
-- earned: +10 points the first time they're awarded for a day they've
-- submitted at least one test, plus a one-time bonus (5 * the milestone)
-- the first time their *current* (still-live) streak reaches 3, 7, 14,
-- 30, 60, or 100 days. Safe and cheap to call on every dashboard load and
-- after every test submission — already-earned events are no-ops thanks
-- to the (student_id, source_key) unique constraint.
create or replace function public.award_learning_points()
returns table (points_awarded integer, new_awards integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_today date := current_date;
  v_has_activity_today boolean;
  v_attempt_days date[];
  v_streak integer := 0;
  v_day date;
  v_prev date;
  v_total_awarded integer := 0;
  v_award_count integer := 0;
  v_milestone integer;
begin
  if v_student_id is null then
    return query select 0, 0;
    return;
  end if;

  select exists (
    select 1 from public.student_responses
    where student_id = v_student_id and submitted_at::date = v_today
  ) into v_has_activity_today;

  if v_has_activity_today then
    insert into public.reward_points_ledger (student_id, points, reason, source_key)
    values (v_student_id, 10, 'Daily learning activity', 'daily:' || v_today::text)
    on conflict (student_id, source_key) do nothing;
    if found then
      v_total_awarded := v_total_awarded + 10;
      v_award_count := v_award_count + 1;
    end if;
  end if;

  select array_agg(distinct submitted_at::date order by submitted_at::date)
  into v_attempt_days
  from public.student_responses
  where student_id = v_student_id;

  if v_attempt_days is not null and array_length(v_attempt_days, 1) > 0 then
    v_prev := null;
    foreach v_day in array v_attempt_days loop
      if v_prev is null or v_day - v_prev > 1 then
        v_streak := 1;
      elsif v_day - v_prev = 1 then
        v_streak := v_streak + 1;
      end if;
      v_prev := v_day;
    end loop;

    -- Only a still-live streak (last attempt today or yesterday) counts
    -- for a milestone award — matches the client-side computeStreakSummary
    -- definition of "current streak" in src/lib/student/streak.ts.
    if v_today - v_prev > 1 then
      v_streak := 0;
    end if;

    foreach v_milestone in array array[3, 7, 14, 30, 60, 100] loop
      if v_streak >= v_milestone then
        insert into public.reward_points_ledger (student_id, points, reason, source_key)
        values (
          v_student_id,
          v_milestone * 5,
          v_milestone || '-day consistency streak',
          'streak-milestone:' || v_milestone::text
        )
        on conflict (student_id, source_key) do nothing;
        if found then
          v_total_awarded := v_total_awarded + v_milestone * 5;
          v_award_count := v_award_count + 1;
        end if;
      end if;
    end loop;
  end if;

  return query select v_total_awarded, v_award_count;
end;
$$;

grant execute on function public.award_learning_points() to authenticated;
