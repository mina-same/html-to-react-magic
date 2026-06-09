-- ============================================================
-- SAAID PLATFORM — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'association' check (role in ('admin','association')),
  assoc_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "Own profile access" on public.profiles
  for all using (auth.uid() = id);

-- Admins can read all profiles
create policy "Admin read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, assoc_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'association'),
    new.raw_user_meta_data->>'assoc_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. Influencers (global, managed by admins)
-- ============================================================
create table if not exists public.influencers (
  id         serial primary key,
  name       text not null,
  platform   text not null,
  followers  integer not null default 0,
  engagement numeric(5,2) not null default 0,
  status     text not null default 'active' check (status in ('active','pending','ended')),
  campaigns  integer not null default 0,
  niche      text not null default '',
  notes      text not null default '',
  base_price integer not null default 500,
  bio               text not null default '',
  location          text not null default '',
  audience          text not null default '',
  instagram_handle  text not null default '',
  x_handle          text not null default '',
  tiktok_handle     text not null default '',
  youtube_handle    text not null default '',
  snapchat_handle   text not null default '',
  website           text not null default '',
  email             text not null default '',
  phone             text not null default '',
  created_at timestamptz not null default now()
);

alter table public.influencers enable row level security;

create policy "Anyone can read influencers" on public.influencers
  for select using (auth.role() = 'authenticated');

create policy "Admins manage influencers" on public.influencers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 3. Employees (per association)
-- ============================================================
create table if not exists public.employees (
  id        serial primary key,
  assoc_id  uuid not null references public.profiles(id) on delete cascade,
  name      text not null,
  role      text not null default '',
  status    text not null default 'active' check (status in ('active','away','off')),
  color     text not null default '#2d7a52',
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;

create policy "Association owns employees" on public.employees
  for all using (auth.uid() = assoc_id);

create policy "Admins read all employees" on public.employees
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 4. Tasks (per association)
-- ============================================================
create table if not exists public.tasks (
  id         serial primary key,
  assoc_id   uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  status     text not null default 'todo' check (status in ('todo','doing','review','done')),
  urgency    text not null default 'normal' check (urgency in ('urgent','high','normal','low')),
  deadline   date,
  assignee   integer references public.employees(id) on delete set null,
  category   text not null default 'عام',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Association owns tasks" on public.tasks
  for all using (auth.uid() = assoc_id);

create policy "Admins read all tasks" on public.tasks
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 5. Donations (per association)
-- ============================================================
create table if not exists public.donations (
  id         serial primary key,
  assoc_id   uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  amount     integer not null,
  channel    text not null default 'نقد',
  date       date not null default current_date,
  status     text not null default 'pending' check (status in ('completed','pending')),
  org        text not null default '',
  created_at timestamptz not null default now()
);

alter table public.donations enable row level security;

create policy "Association owns donations" on public.donations
  for all using (auth.uid() = assoc_id);

create policy "Admins read all donations" on public.donations
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 6. Campaigns (per association)
-- ============================================================
create table if not exists public.campaigns (
  id         serial primary key,
  assoc_id   uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  status     text not null default 'draft' check (status in ('draft','active','paused','ended')),
  budget     integer not null default 0,
  reach      text not null default '—',
  start_date date,
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Association owns campaigns" on public.campaigns
  for all using (auth.uid() = assoc_id);

create policy "Admins read all campaigns" on public.campaigns
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 7. Campaign Requests (association → influencer)
-- ============================================================
create table if not exists public.campaign_requests (
  id            serial primary key,
  assoc_id      uuid not null references public.profiles(id) on delete cascade,
  influencer_id integer not null references public.influencers(id) on delete cascade,
  type          text not null default 'خيرية',
  budget        integer not null,
  start_date    date not null,
  duration      text not null default 'أسبوع',
  message       text not null,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now()
);

alter table public.campaign_requests enable row level security;

create policy "Association owns requests" on public.campaign_requests
  for all using (auth.uid() = assoc_id);

create policy "Admins manage requests" on public.campaign_requests
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 8. Seed default influencers
-- ============================================================
insert into public.influencers (name, platform, followers, engagement, status, campaigns, niche, notes, base_price) values
  ('أبو خالد العوضي',  'Instagram', 320000,  5.2, 'active',  4, 'محتوى خيري وعائلي',      'تعاقد سنوي',              1800),
  ('هند الرشيدي',      'X',         890000,  3.8, 'active',  2, 'شؤون اجتماعية',           '',                         3500),
  ('أحمد القحطاني',    'TikTok',    1200000, 7.1, 'active',  1, 'ترفيهي وخيري',            'حملة رمضان فقط',           5000),
  ('نورة العتيبي',     'Snapchat',  450000,  4.5, 'pending', 0, 'محتوى عائلي',              'قيد التفاوض على الأسعار', 2200),
  ('سالم الدوسري',     'YouTube',   280000,  6.3, 'active',  1, 'وثائقي خيري',              '',                         1500),
  ('ريهام السبيعي',    'Instagram', 175000,  8.9, 'ended',   2, 'محتوى نسائي واجتماعي',   'انتهى عقدها مارس 2025',   250)
on conflict do nothing;

-- ============================================================
-- Create the first admin user (run after creating the user in Auth)
-- Replace 'YOUR_ADMIN_USER_ID' with the actual UUID from auth.users
-- ============================================================
-- update public.profiles set role = 'admin' where id = 'YOUR_ADMIN_USER_ID';

-- ============================================================
-- 9. Associations (extended org profile — managed by org + admin)
-- ============================================================
create table if not exists public.associations (
  id          uuid primary key references public.profiles(id) on delete cascade,
  license     text not null default '',
  region      text not null default '',
  phone       text not null default '',
  email       text not null default '',
  description text not null default '',
  status      text not null default 'active'
              check (status in ('active','new','pending','suspended')),
  verified    boolean not null default false,
  updated_at  timestamptz not null default now()
);

alter table public.associations enable row level security;

create policy "Association owns details" on public.associations
  for all using (auth.uid() = id);

create policy "Admins manage associations" on public.associations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 10. Matches (org ↔ influencer partnerships, admin-managed)
-- ============================================================
create table if not exists public.matches (
  id            serial primary key,
  assoc_id      uuid not null references public.profiles(id) on delete cascade,
  influencer_id integer not null references public.influencers(id) on delete cascade,
  status        text not null default 'active'
                check (status in ('active','pending','completed')),
  start_date    date not null default current_date,
  budget        integer not null default 0,
  notes         text not null default '',
  created_at    timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "Association views own matches" on public.matches
  for select using (auth.uid() = assoc_id);

create policy "Admins manage matches" on public.matches
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 11. Platform settings (admin key/value store)
-- ============================================================
create table if not exists public.platform_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

create policy "Admins manage settings" on public.platform_settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users read settings" on public.platform_settings
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- 12. Expand campaign_requests.status to include admin workflow values
-- ============================================================
do $$
begin
  alter table public.campaign_requests
    drop constraint if exists campaign_requests_status_check;
  alter table public.campaign_requests
    add constraint campaign_requests_status_check
    check (status in ('pending','approved','rejected','matched','completed'));
exception when others then null;
end $$;
