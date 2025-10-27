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

create policy "read own profile" on public.profiles for select
  using (auth.uid() = id or (auth.jwt()->>'role') = 'admin');

create policy "insert own profile" on public.profiles for insert
  with check (auth.uid() = id);

create policy "update own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "select published courses" on public.courses for select
  using (status = 'published' or (auth.jwt()->>'role') in ('admin','docente'));

create policy "author can modify" on public.courses for all
  using ((auth.jwt()->>'role') in ('admin','docente') and author_id = auth.uid());

create policy "read modules lessons" on public.modules for select
  using (
    exists(
      select 1 from public.courses c
      where c.id = modules.course_id
        and (c.status = 'published' or (auth.jwt()->>'role') in ('admin','docente'))
    )
  );

create policy "crud modules by author" on public.modules for all
  using (
    exists(
      select 1 from public.courses c
      where c.id = modules.course_id and c.author_id = auth.uid()
    ) or (auth.jwt()->>'role') = 'admin'
  );

create policy "read lessons" on public.lessons for select
  using (
    exists(
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id
        and (c.status = 'published' or (auth.jwt()->>'role') in ('admin','docente'))
    )
  );

create policy "crud lessons by author" on public.lessons for all
  using (
    exists(
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.author_id = auth.uid()
    ) or (auth.jwt()->>'role') = 'admin'
  );

create policy "read own enrollments" on public.enrollments for select
  using (auth.uid() = user_id or (auth.jwt()->>'role') = 'admin');

create policy "insert own enrollment" on public.enrollments for insert
  with check (auth.uid() = user_id);

create policy "update own enrollment" on public.enrollments for update
  using (auth.uid() = user_id);

create policy "read bank if enrolled or staff" on public.question_bank for select
  using (
    (auth.jwt()->>'role') in ('admin','docente') or
    exists(
      select 1 from public.enrollments e
      join public.courses c on c.id = question_bank.course_id
      where e.user_id = auth.uid() and e.course_id = c.id
    )
  );

create policy "crud bank by author" on public.question_bank for all
  using (
    (auth.jwt()->>'role') = 'admin' or
    exists(
      select 1 from public.courses c
      where c.id = question_bank.course_id and c.author_id = auth.uid()
    )
  );

create policy "read exams if enrolled or staff" on public.exams for select
  using (
    (auth.jwt()->>'role') in ('admin','docente') or
    exists(
      select 1 from public.enrollments e
      join public.courses c on c.id = exams.course_id
      where e.user_id = auth.uid() and e.course_id = c.id
    )
  );

create policy "crud exams by author" on public.exams for all
  using (
    (auth.jwt()->>'role') = 'admin' or
    exists(
      select 1 from public.courses c
      where c.id = exams.course_id and c.author_id = auth.uid()
    )
  );

create policy "attempts owner/staff" on public.attempts for select
  using (user_id = auth.uid() or (auth.jwt()->>'role') in ('admin','docente'));

create policy "insert attempt by self" on public.attempts for insert
  with check (user_id = auth.uid());

create policy "answers owner/staff" on public.attempt_answers for select
  using (
    exists(
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id
        and (a.user_id = auth.uid() or (auth.jwt()->>'role') in ('admin','docente'))
    )
  );

create policy "insert answers by owner" on public.attempt_answers for insert
  with check (
    exists(
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id and a.user_id = auth.uid()
    )
  );
