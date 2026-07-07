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

-- Students may submit responses; responses are not publicly listable.
create policy "Anyone can submit a student response"
  on public.student_responses for insert
  with check (true);
