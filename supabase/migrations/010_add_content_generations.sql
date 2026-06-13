create table if not exists public.content_generations (
  id         serial primary key,
  assoc_id   uuid not null references public.profiles(id) on delete cascade,
  prompt     text not null default '',
  content    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.content_generations enable row level security;

create policy "Association owns generations" on public.content_generations
  for all using (auth.uid() = assoc_id);
