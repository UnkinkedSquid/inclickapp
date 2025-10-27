-- Reemplaza {{DOCENTE_ID}} y {{ALUMNO_ID}} con los UUID reales de auth.users

insert into public.courses (id, title, description, level, price_cents, status, author_id, tags)
values (
  gen_random_uuid(),
  'Ingreso a Universidad – Matemáticas',
  'Curso intensivo con módulos de álgebra, geometría y aritmética orientado al examen de ingreso.',
  'ingreso',
  149900,
  'published',
  '{{DOCENTE_ID}}',
  ARRAY['álgebra','geometría','aritmética']
)
on conflict do nothing;

insert into public.modules (course_id, title, position)
select id, titulo, orden
from (
  select c.id,
         unnest(ARRAY['Fundamentos de Álgebra','Geometría Analítica','Razonamiento Matemático']) as titulo,
         generate_series(1,3) as orden
  from public.courses c
  where c.title = 'Ingreso a Universidad – Matemáticas'
) sub;

insert into public.lessons (module_id, type, title, content_url, duration_seconds, position, free_preview)
select m.id,
       'video',
       lesson_data.title,
       'https://videos.example.com/demo.m3u8',
       600,
       lesson_data.pos,
       lesson_data.preview
from public.modules m
join (
  select titulo as module_title,
         unnest(ARRAY['Repaso de ecuaciones lineales','Inecuaciones y sistemas']) as title,
         generate_series(1,2) as pos,
         unnest(ARRAY[true,false]) as preview
) as lesson_data on lesson_data.module_title = m.title;

insert into public.enrollments (user_id, course_id, progress)
select '{{ALUMNO_ID}}', c.id, 15
from public.courses c
where c.title = 'Ingreso a Universidad – Matemáticas'
on conflict do nothing;
