-- TestPulse AI core schema — PART 2 of 2.
-- Run schema_part1.sql first in the same Supabase project, then run this file.
-- Continues directly from where schema_part1.sql leaves off (assignment_submissions
-- table onward: attendance, fee ledger/dues, reward vault, promotional offers/docs).

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
-- Started as a manual-only ledger (an admin records a payment they already
-- received in cash/bank transfer/etc.) and now also receives rows written
-- by the Razorpay integration below (Module 4.3) once a student pays a
-- `fee_dues` row online. `student_id` stays nullable so a payment can still
-- be recorded against a walk-in payer who doesn't have an account.
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

-- Module 4.3 additions: which due (if any) this payment settles, and the
-- gateway trail needed to reconcile it against Razorpay's own records.
-- `due_id` has no inline FK here because `fee_dues` is defined later in
-- this file — the constraint is added right after that table exists (see
-- "Fee Dues" section below). `gateway_payment_id` is unique-indexed
-- (partial, since manual rows leave it null) so the webhook handler and
-- the client-side verify call can both race to record the same captured
-- payment without creating a duplicate.
alter table public.fee_payments
  add column if not exists due_id uuid,
  add column if not exists gateway text not null default 'manual' check (gateway in ('manual', 'razorpay')),
  add column if not exists gateway_order_id text,
  add column if not exists gateway_payment_id text,
  add column if not exists gateway_signature text;

create unique index if not exists fee_payments_gateway_payment_id_idx
  on public.fee_payments (gateway_payment_id)
  where gateway_payment_id is not null;

alter table public.fee_payments enable row level security;

-- Financial records — admin can see/write everything; a student can read
-- (but never write) their own payment history, matching the read-only
-- student policies used elsewhere (attendance, assignments, ...).
create policy "Admins can view fee payments"
  on public.fee_payments for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Students can view their own fee payments"
  on public.fee_payments for select
  using (student_id = auth.uid());

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
-- Fee Dues & Online Payments via Razorpay (Module 4.3)
-- ============================================================
-- An admin raises a due (amount owed, for a period, optionally with a due
-- date) against a real student account. The student then pays it from
-- their dashboard through Razorpay Checkout — the API routes under
-- /api/payments/* create the Razorpay order and, once payment is verified
-- (both a client-side verify call and a server-to-server webhook write the
-- same row, whichever lands first — see fee_payments_gateway_payment_id_idx
-- above for the idempotency guard), insert a matching `fee_payments` row
-- with gateway = 'razorpay' and flip this due to 'paid'. All of that
-- writing happens through the service-role client (bypassing RLS) since a
-- student must never be able to mark their own due as paid directly.
create table if not exists public.fee_dues (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null check (amount > 0),
  fee_period text not null default '',
  due_date date,
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fee_dues_student_id_idx on public.fee_dues (student_id);
create index if not exists fee_dues_status_idx on public.fee_dues (status);

-- Postgres has no `ADD CONSTRAINT IF NOT EXISTS`, so this guard is what
-- keeps re-running this file against an already-migrated database safe.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fee_payments_due_id_fkey'
  ) then
    alter table public.fee_payments
      add constraint fee_payments_due_id_fkey
        foreign key (due_id) references public.fee_dues (id) on delete set null;
  end if;
end $$;

create index if not exists fee_payments_due_id_idx on public.fee_payments (due_id);

alter table public.fee_dues enable row level security;

create policy "Admins can view fee dues"
  on public.fee_dues for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Students can view their own fee dues"
  on public.fee_dues for select
  using (student_id = auth.uid());

create policy "Admins can create fee dues"
  on public.fee_dues for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update fee dues"
  on public.fee_dues for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete fee dues"
  on public.fee_dues for delete
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

-- ============================================================
-- Promotional Offers & Institutional Documents (Resource Control Center)
-- ============================================================
-- Deliberately separate tables from `resources` (the Reading Room /
-- Digital Library, Module 2.2) rather than new `category` values on it —
-- an offer banner and an institutional circular are not study content, and
-- folding them into library_catalog()/the /library browse grid would mean
-- every library query has to special-case non-study rows. Each of these
-- gets its own admin form and its own display surface instead.

-- An offer is publicly visible (no sign-in) only while `is_active` and
-- inside its optional date window — that's what powers the dismissible
-- banner on the public "/" homepage. Inactive/expired/future-dated rows
-- stay admin-only, same masking idea as library_catalog()'s premium gate.
create table if not exists public.promotional_offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  resource_url text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists promotional_offers_created_at_idx
  on public.promotional_offers (created_at desc);

alter table public.promotional_offers enable row level security;

create policy "Anyone can view currently active offers"
  on public.promotional_offers for select
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "Admins can view all offers"
  on public.promotional_offers for select
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can insert offers"
  on public.promotional_offers for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update offers"
  on public.promotional_offers for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete offers"
  on public.promotional_offers for delete
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- Institutional documents (circulars, policies, notices) are for enrolled
-- students/staff, not the public — any signed-in account can read them,
-- matching the same posture as class_schedule/assignments above.
create table if not exists public.institutional_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  resource_url text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists institutional_documents_created_at_idx
  on public.institutional_documents (created_at desc);

alter table public.institutional_documents enable row level security;

create policy "Signed-in users can view institutional documents"
  on public.institutional_documents for select
  using (auth.uid() is not null);

create policy "Admins can insert institutional documents"
  on public.institutional_documents for insert
  with check (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can update institutional documents"
  on public.institutional_documents for update
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

create policy "Admins can delete institutional documents"
  on public.institutional_documents for delete
  using (
    exists (
      select 1 from public.profiles admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );
