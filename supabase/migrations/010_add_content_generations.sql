create table if not exists public.content_generations (
  id         serial primary key,
  assoc_id   uuid not null references public.profiles(id) on delete cascade,
  prompt     text not null default '',
  content    jsonb not null default '{}',
  tokens_used integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.content_generations enable row level security;

drop policy if exists "Association owns generations" on public.content_generations;
create policy "Association owns generations" on public.content_generations
  for all using (auth.uid() = assoc_id);

drop policy if exists "Admins manage all generations" on public.content_generations;
create policy "Admins manage all generations" on public.content_generations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
