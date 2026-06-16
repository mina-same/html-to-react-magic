alter table public.content_generations
  add column if not exists tokens_used integer not null default 0;
