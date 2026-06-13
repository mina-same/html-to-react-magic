alter table associations
  add column if not exists ai_summary text,
  add column if not exists ai_ideas jsonb,
  add column if not exists ai_pain_points jsonb;
