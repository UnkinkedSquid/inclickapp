-- Generado para Nexus. Ejecutar en el editor SQL de Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('admin','docente','alumno')) default 'alumno',
  grado text,
  area text,
  avatar_url text,
  interests text[] default '{}',
  preferred_level text check (preferred_level in ('beginner','intermediate','advanced')) default null,
  theme text check (theme in ('system','light','dark')) default 'system',
  onboarding_complete boolean default false,
  weekly_goal_minutes int,
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

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update
    set full_name = excluded.full_name;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
