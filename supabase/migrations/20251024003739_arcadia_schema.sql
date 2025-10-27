-- Migration generated manually to bootstrap Nexus SE schema on Supabase
-- Includes tables, indexes and RLS policies equivalent to supabase/schema.sql + policies.sql

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('admin','docente','alumno')) default 'alumno',
  grado text,
  area text,
  avatar_url text,
  accent_color text default '#d4af37',
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text,
  price_cents int default 0,
  status text check (status in ('draft','published','archived')) default 'draft',
  author_id uuid references auth.users(id),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  position int default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  type text check (type in ('video','texto','pdf')) default 'video',
  title text not null,
  content_url text,
  duration_seconds int,
  position int default 0,
  free_preview boolean default false
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  status text check (status in ('active','completed','cancelled')) default 'active',
  progress numeric default 0,
  created_at timestamptz default now(),
  unique (user_id, course_id)
);

create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  type text check (type in ('opcion_multiple','verdadero_falso','numerico','completar','ensayo')) not null,
  prompt text not null,
  options jsonb,
  correct_answer jsonb,
  explanation text,
  difficulty text check (difficulty in ('facil','medio','dificil')) default 'medio',
  tags text[] default '{}',
  topic text,
  skill text,
  created_at timestamptz default now()
);

create table if not exists public.simulators (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  description text,
  duration_minutes int default 60,
  question_count int default 40,
  randomize boolean default true,
  price_cents int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.simulator_questions (
  id uuid primary key default gen_random_uuid(),
  simulator_id uuid references public.simulators(id) on delete cascade,
  question_id uuid references public.question_bank(id) on delete cascade,
  position int default 0,
  weight numeric default 1
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  duration_minutes int default 60,
  question_count int default 20,
  randomize boolean default true,
  status text check (status in ('draft','published')) default 'draft',
  blueprint jsonb,
  created_at timestamptz default now()
);

create table if not exists public.exam_items (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  question_id uuid references public.question_bank(id) on delete cascade,
  weight numeric default 1
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz default now(),
  finished_at timestamptz,
  time_spent_seconds int default 0,
  score numeric default 0,
  max_score numeric default 0,
  percentage numeric,
  status text check (status in ('in_progress','submitted','graded')) default 'in_progress',
  question_order uuid[] default '{}',
  simulator_id uuid references public.simulators(id) on delete cascade
);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.attempts(id) on delete cascade,
  question_id uuid references public.question_bank(id) on delete cascade,
  answer jsonb,
  is_correct boolean,
  points numeric default 0,
  max_points numeric default 1
);

create table if not exists public.attempt_sections (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.attempts(id) on delete cascade,
  label text not null,
  total_questions int default 0,
  correct_questions int default 0,
  percentage numeric default 0
);

create table if not exists public.user_simulator_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  simulator_id uuid references public.simulators(id) on delete cascade,
  status text check (status in ('pending','active','expired','cancelled')) default 'active',
  expires_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.profiles
  add column if not exists simulators_taken int default 0,
  add column if not exists best_simulator_score numeric default 0,
  add column if not exists average_simulator_score numeric default 0;

create index if not exists modules_course_id_idx on public.modules(course_id);
create index if not exists lessons_module_id_idx on public.lessons(module_id);
create index if not exists enrollments_user_id_idx on public.enrollments(user_id);
create index if not exists question_bank_course_id_idx on public.question_bank(course_id);
create index if not exists exams_course_id_idx on public.exams(course_id);
create index if not exists attempts_exam_id_idx on public.attempts(exam_id);
create index if not exists attempts_user_id_idx on public.attempts(user_id);
create index if not exists simulator_questions_simulator_id_idx on public.simulator_questions(simulator_id);
create index if not exists simulator_questions_question_id_idx on public.simulator_questions(question_id);
create index if not exists attempts_simulator_id_idx on public.attempts(simulator_id);
create index if not exists attempt_sections_attempt_id_idx on public.attempt_sections(attempt_id);
create index if not exists user_simulator_access_user_idx on public.user_simulator_access(user_id);
create index if not exists user_simulator_access_simulator_idx on public.user_simulator_access(simulator_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.question_bank enable row level security;
alter table public.exams enable row level security;
alter table public.exam_items enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select
  using (auth.uid() = id or (auth.jwt()->>'role') = 'admin');

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "select published courses" on public.courses;
create policy "select published courses" on public.courses for select
  using (status = 'published' or (auth.jwt()->>'role') in ('admin','docente'));

drop policy if exists "author can modify" on public.courses;
create policy "author can modify" on public.courses for all
  using ((auth.jwt()->>'role') in ('admin','docente') and author_id = auth.uid());

drop policy if exists "read modules lessons" on public.modules;
create policy "read modules lessons" on public.modules for select
  using (
    exists(
      select 1 from public.courses c
      where c.id = modules.course_id
        and (c.status = 'published' or (auth.jwt()->>'role') in ('admin','docente'))
    )
  );

drop policy if exists "crud modules by author" on public.modules;
create policy "crud modules by author" on public.modules for all
  using (
    exists(
      select 1 from public.courses c
      where c.id = modules.course_id and c.author_id = auth.uid()
    ) or (auth.jwt()->>'role') = 'admin'
  );

drop policy if exists "read lessons" on public.lessons;
create policy "read lessons" on public.lessons for select
  using (
    exists(
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id
        and (c.status = 'published' or (auth.jwt()->>'role') in ('admin','docente'))
    )
  );

drop policy if exists "crud lessons by author" on public.lessons;
create policy "crud lessons by author" on public.lessons for all
  using (
    exists(
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.author_id = auth.uid()
    ) or (auth.jwt()->>'role') = 'admin'
  );

drop policy if exists "read own enrollments" on public.enrollments;
create policy "read own enrollments" on public.enrollments for select
  using (auth.uid() = user_id or (auth.jwt()->>'role') = 'admin');

drop policy if exists "insert own enrollment" on public.enrollments;
create policy "insert own enrollment" on public.enrollments for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own enrollment" on public.enrollments;
create policy "update own enrollment" on public.enrollments for update
  using (auth.uid() = user_id);

drop policy if exists "read bank if enrolled or staff" on public.question_bank;
create policy "read bank if enrolled or staff" on public.question_bank for select
  using (
    (auth.jwt()->>'role') in ('admin','docente') or
    exists(
      select 1 from public.enrollments e
      join public.courses c on c.id = question_bank.course_id
      where e.user_id = auth.uid() and e.course_id = c.id
    )
  );

drop policy if exists "crud bank by author" on public.question_bank;
create policy "crud bank by author" on public.question_bank for all
  using (
    (auth.jwt()->>'role') = 'admin' or
    exists(
      select 1 from public.courses c
      where c.id = question_bank.course_id and c.author_id = auth.uid()
    )
  );

drop policy if exists "read exams if enrolled or staff" on public.exams;
create policy "read exams if enrolled or staff" on public.exams for select
  using (
    (auth.jwt()->>'role') in ('admin','docente') or
    exists(
      select 1 from public.enrollments e
      join public.courses c on c.id = exams.course_id
      where e.user_id = auth.uid() and e.course_id = c.id
    )
  );

drop policy if exists "crud exams by author" on public.exams;
create policy "crud exams by author" on public.exams for all
  using (
    (auth.jwt()->>'role') = 'admin' or
    exists(
      select 1 from public.courses c
      where c.id = exams.course_id and c.author_id = auth.uid()
    )
  );

drop policy if exists "attempts owner/staff" on public.attempts;
create policy "attempts owner/staff" on public.attempts for select
  using (user_id = auth.uid() or (auth.jwt()->>'role') in ('admin','docente'));

drop policy if exists "insert attempt by self" on public.attempts;
create policy "insert attempt by self" on public.attempts for insert
  with check (user_id = auth.uid());

drop policy if exists "answers owner/staff" on public.attempt_answers;
create policy "answers owner/staff" on public.attempt_answers for select
  using (
    exists(
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id
        and (a.user_id = auth.uid() or (auth.jwt()->>'role') in ('admin','docente'))
    )
  );

drop policy if exists "insert answers by owner" on public.attempt_answers;
create policy "insert answers by owner" on public.attempt_answers for insert
  with check (
    exists(
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id and a.user_id = auth.uid()
    )
  );
