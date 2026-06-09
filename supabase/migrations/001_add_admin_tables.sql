-- ============================================================
-- SAAID PLATFORM — Complete Schema + Full Seed Data
-- Paste this entire file into Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Profiles ───────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'association' check (role in ('admin','association')),
  assoc_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Own profile access" on public.profiles;
create policy "Own profile access" on public.profiles
  for all using (auth.uid() = id);

drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- idempotent trigger function
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, assoc_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'association'),
    new.raw_user_meta_data->>'assoc_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. Influencers ────────────────────────────────────────────
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

drop policy if exists "Anyone can read influencers" on public.influencers;
create policy "Anyone can read influencers" on public.influencers
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins manage influencers" on public.influencers;
create policy "Admins manage influencers" on public.influencers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 3. Employees ──────────────────────────────────────────────
create table if not exists public.employees (
  id         serial primary key,
  assoc_id   uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  role       text not null default '',
  status     text not null default 'active' check (status in ('active','away','off')),
  color      text not null default '#2d7a52',
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;

drop policy if exists "Association owns employees" on public.employees;
create policy "Association owns employees" on public.employees
  for all using (auth.uid() = assoc_id);

drop policy if exists "Admins read all employees" on public.employees;
create policy "Admins read all employees" on public.employees
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 4. Tasks ──────────────────────────────────────────────────
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

drop policy if exists "Association owns tasks" on public.tasks;
create policy "Association owns tasks" on public.tasks
  for all using (auth.uid() = assoc_id);

drop policy if exists "Admins read all tasks" on public.tasks;
create policy "Admins read all tasks" on public.tasks
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 5. Donations ──────────────────────────────────────────────
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

drop policy if exists "Association owns donations" on public.donations;
create policy "Association owns donations" on public.donations
  for all using (auth.uid() = assoc_id);

drop policy if exists "Admins read all donations" on public.donations;
create policy "Admins read all donations" on public.donations
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 6. Campaigns ──────────────────────────────────────────────
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

drop policy if exists "Association owns campaigns" on public.campaigns;
create policy "Association owns campaigns" on public.campaigns
  for all using (auth.uid() = assoc_id);

drop policy if exists "Admins read all campaigns" on public.campaigns;
create policy "Admins read all campaigns" on public.campaigns
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 7. Campaign Requests ──────────────────────────────────────
create table if not exists public.campaign_requests (
  id            serial primary key,
  assoc_id      uuid not null references public.profiles(id) on delete cascade,
  influencer_id integer not null references public.influencers(id) on delete cascade,
  type          text not null default 'خيرية',
  budget        integer not null,
  start_date    date not null,
  duration      text not null default 'أسبوع',
  message       text not null,
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected','matched','completed')),
  created_at    timestamptz not null default now()
);

alter table public.campaign_requests enable row level security;

drop policy if exists "Association owns requests" on public.campaign_requests;
create policy "Association owns requests" on public.campaign_requests
  for all using (auth.uid() = assoc_id);

drop policy if exists "Admins manage requests" on public.campaign_requests;
create policy "Admins manage requests" on public.campaign_requests
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 8. Associations ───────────────────────────────────────────
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

drop policy if exists "Association owns details" on public.associations;
create policy "Association owns details" on public.associations
  for all using (auth.uid() = id);

drop policy if exists "Admins manage associations" on public.associations;
create policy "Admins manage associations" on public.associations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 9. Matches ────────────────────────────────────────────────
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

drop policy if exists "Association views own matches" on public.matches;
create policy "Association views own matches" on public.matches
  for select using (auth.uid() = assoc_id);

drop policy if exists "Admins manage matches" on public.matches;
create policy "Admins manage matches" on public.matches
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 10. Platform Settings ─────────────────────────────────────
create table if not exists public.platform_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists "Admins manage settings" on public.platform_settings;
create policy "Admins manage settings" on public.platform_settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Authenticated users read settings" on public.platform_settings;
create policy "Authenticated users read settings" on public.platform_settings
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA
-- ============================================================

-- ── Seed Users into auth.users ────────────────────────────────
-- All passwords: Test@1234
-- UUIDs are fixed so downstream foreign keys work
insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  confirmation_token, recovery_token,
  email_change, email_change_token_new
) values
-- ADMIN
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@saaid.sa',
  extensions.crypt('Test@1234', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"role":"admin","assoc_name":null}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '', '', '', ''
),
-- ASSOCIATION 1 — جمعية تكاتف الخيرية
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'takafol@saaid.sa',
  extensions.crypt('Test@1234', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"role":"association","assoc_name":"جمعية تكاتف الخيرية"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '', '', '', ''
),
-- ASSOCIATION 2 — جمعية رحمة للأيتام
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'rahma@saaid.sa',
  extensions.crypt('Test@1234', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"role":"association","assoc_name":"جمعية رحمة للأيتام"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '', '', '', ''
),
-- ASSOCIATION 3 — جمعية نور للتنمية
(
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'noor@saaid.sa',
  extensions.crypt('Test@1234', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"role":"association","assoc_name":"جمعية نور للتنمية"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '', '', '', ''
),
-- ASSOCIATION 4 — جمعية الأمان الاجتماعي
(
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'aman@saaid.sa',
  extensions.crypt('Test@1234', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"role":"association","assoc_name":"جمعية الأمان الاجتماعي"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '', '', '', ''
)
on conflict (id) do nothing;

-- promote admin role (trigger sets 'association' by default, override for admin)
update public.profiles set role = 'admin'
  where id = '00000000-0000-0000-0000-000000000001';

-- ── Seed: Influencers ─────────────────────────────────────────
insert into public.influencers (name, platform, followers, engagement, status, campaigns, niche, notes, base_price) values
  ('أبو خالد العوضي',  'Instagram', 320000,  5.2, 'active',  4, 'محتوى خيري وعائلي',     'تعاقد سنوي',              1800),
  ('هند الرشيدي',      'X',         890000,  3.8, 'active',  2, 'شؤون اجتماعية',          '',                        3500),
  ('أحمد القحطاني',    'TikTok',    1200000, 7.1, 'active',  1, 'ترفيهي وخيري',           'حملة رمضان فقط',          5000),
  ('نورة العتيبي',     'Snapchat',  450000,  4.5, 'pending', 0, 'محتوى عائلي',             'قيد التفاوض على الأسعار', 2200),
  ('سالم الدوسري',     'YouTube',   280000,  6.3, 'active',  1, 'وثائقي خيري',             '',                        1500),
  ('ريهام السبيعي',    'Instagram', 175000,  8.9, 'ended',   2, 'محتوى نسائي واجتماعي',  'انتهى عقدها مارس 2025',  250)
on conflict do nothing;

-- ── Seed: Associations details ────────────────────────────────
insert into public.associations (id, license, region, phone, email, description, status, verified) values
  ('00000000-0000-0000-0000-000000000002', 'LIC-2021-0042', 'الرياض',   '0112345678', 'takafol@gmail.com',  'جمعية خيرية متخصصة في دعم الأسر المحتاجة وتوزيع المساعدات العينية والنقدية', 'active',    true),
  ('00000000-0000-0000-0000-000000000003', 'LIC-2019-0017', 'جدة',      '0126543210', 'rahma@gmail.com',    'رعاية الأيتام وتأمين احتياجاتهم التعليمية والصحية والمعيشية',                 'active',    true),
  ('00000000-0000-0000-0000-000000000004', 'LIC-2023-0089', 'الدمام',   '0138765432', 'noor@gmail.com',     'برامج تنموية وتدريبية لتمكين الشباب وتأهيلهم لسوق العمل',                   'new',       false),
  ('00000000-0000-0000-0000-000000000005', 'LIC-2020-0031', 'المدينة',  '0148901234', 'aman@gmail.com',     'شبكة أمان اجتماعي للأفراد والأسر في حالات الطوارئ والأزمات',                 'pending',   false)
on conflict (id) do nothing;

-- ── Seed: Employees ───────────────────────────────────────────
-- Assoc 1 employees
insert into public.employees (assoc_id, name, role, status, color) values
  ('00000000-0000-0000-0000-000000000002', 'محمد العتيبي',   'مدير تنفيذي',      'active', '#1a5c3a'),
  ('00000000-0000-0000-0000-000000000002', 'سارة القحطاني',  'منسقة برامج',      'active', '#2d7a52'),
  ('00000000-0000-0000-0000-000000000002', 'خالد الشمري',    'مسؤول مالي',       'away',   '#4a9e70'),
  ('00000000-0000-0000-0000-000000000002', 'نورا الزهراني',  'أخصائية اجتماعية', 'active', '#c9a84c');

-- Assoc 2 employees
insert into public.employees (assoc_id, name, role, status, color) values
  ('00000000-0000-0000-0000-000000000003', 'عبدالله الدوسري', 'رئيس مجلس الإدارة', 'active', '#1a5c3a'),
  ('00000000-0000-0000-0000-000000000003', 'ليلى المطيري',    'مديرة رعاية',        'active', '#2d7a52'),
  ('00000000-0000-0000-0000-000000000003', 'فهد البقمي',      'مسؤول جمع التبرعات', 'active', '#9b59b6');

-- Assoc 3 employees
insert into public.employees (assoc_id, name, role, status, color) values
  ('00000000-0000-0000-0000-000000000004', 'ريم الحارثي',   'المديرة التنفيذية',  'active', '#1a5c3a'),
  ('00000000-0000-0000-0000-000000000004', 'أنس السلمي',    'منسق تدريب',         'active', '#e67e22'),
  ('00000000-0000-0000-0000-000000000004', 'دانا العمري',   'إعلام وتواصل',       'off',    '#2d7a52');

-- Assoc 4 employees
insert into public.employees (assoc_id, name, role, status, color) values
  ('00000000-0000-0000-0000-000000000005', 'سلطان الرشيدي', 'المدير العام',     'active', '#1a5c3a'),
  ('00000000-0000-0000-0000-000000000005', 'هيا المنصور',   'مسؤولة الحالات',  'active', '#2d7a52');

-- ── Seed: Tasks ───────────────────────────────────────────────
insert into public.tasks (assoc_id, title, status, urgency, deadline, category, notes) values
  ('00000000-0000-0000-0000-000000000002', 'إعداد تقرير التبرعات الشهري',    'doing', 'urgent', '2026-05-30', 'مالي',    'يجب تسليمه لمجلس الإدارة'),
  ('00000000-0000-0000-0000-000000000002', 'تنظيم حفل التكريم السنوي',        'todo',  'high',   '2026-06-15', 'فعاليات', ''),
  ('00000000-0000-0000-0000-000000000002', 'تحديث قاعدة بيانات المستفيدين',   'done',  'normal', '2026-05-20', 'إداري',   'تم بنجاح'),
  ('00000000-0000-0000-0000-000000000002', 'التواصل مع المتبرعين الجدد',      'todo',  'normal', '2026-06-01', 'تواصل',   ''),
  ('00000000-0000-0000-0000-000000000003', 'صرف المنح الدراسية لشهر مايو',   'doing', 'urgent', '2026-05-28', 'مالي',    '32 طالباً'),
  ('00000000-0000-0000-0000-000000000003', 'زيارة دور الرعاية في جدة',        'todo',  'high',   '2026-06-10', 'رعاية',   ''),
  ('00000000-0000-0000-0000-000000000003', 'تجديد عقد مقر الجمعية',           'todo',  'urgent', '2026-05-31', 'إداري',   'العقد ينتهي نهاية الشهر'),
  ('00000000-0000-0000-0000-000000000004', 'إطلاق دورة تدريب المهارات',       'doing', 'high',   '2026-06-05', 'تدريب',   '20 مقعداً متاحاً'),
  ('00000000-0000-0000-0000-000000000004', 'تصميم بروشور الجمعية الجديد',     'todo',  'normal', '2026-06-20', 'إعلام',   ''),
  ('00000000-0000-0000-0000-000000000005', 'تسجيل 15 حالة طارئة جديدة',      'done',  'urgent', '2026-05-22', 'حالات',   ''),
  ('00000000-0000-0000-0000-000000000005', 'متابعة ملفات طلبات الدعم',        'doing', 'high',   '2026-05-29', 'حالات',   '8 ملفات معلقة');

-- ── Seed: Donations ───────────────────────────────────────────
insert into public.donations (assoc_id, name, amount, channel, date, status, org) values
  ('00000000-0000-0000-0000-000000000002', 'أحمد بن محمد النغيمشي',    5000,  'تحويل بنكي', '2026-05-20', 'completed', ''),
  ('00000000-0000-0000-0000-000000000002', 'شركة الراجحي للتطوير',      25000, 'تحويل بنكي', '2026-05-18', 'completed', 'الراجحي للتطوير'),
  ('00000000-0000-0000-0000-000000000002', 'فاطمة العتيبي',             1000,  'نقد',         '2026-05-15', 'completed', ''),
  ('00000000-0000-0000-0000-000000000002', 'مجهول',                     500,   'نقد',         '2026-05-10', 'completed', ''),
  ('00000000-0000-0000-0000-000000000002', 'شركة أبشر الخيرية',         15000, 'شيك',         '2026-05-24', 'pending',   'أبشر الخيرية'),
  ('00000000-0000-0000-0000-000000000003', 'محمد الدوسري',              3000,  'تحويل بنكي', '2026-05-19', 'completed', ''),
  ('00000000-0000-0000-0000-000000000003', 'مؤسسة الفيصل الخيرية',      50000, 'تحويل بنكي', '2026-05-12', 'completed', 'مؤسسة الفيصل'),
  ('00000000-0000-0000-0000-000000000003', 'نورة السبيعي',              2500,  'نقد',         '2026-05-08', 'completed', ''),
  ('00000000-0000-0000-0000-000000000003', 'مجموعة أعمال الخليج',       10000, 'شيك',         '2026-05-23', 'pending',   'أعمال الخليج'),
  ('00000000-0000-0000-0000-000000000004', 'عبدالرحمن الغامدي',         2000,  'تحويل بنكي', '2026-05-17', 'completed', ''),
  ('00000000-0000-0000-0000-000000000004', 'جمعية رجال الأعمال',        8000,  'تحويل بنكي', '2026-05-14', 'completed', 'رجال الأعمال'),
  ('00000000-0000-0000-0000-000000000005', 'خالد المطيري',              1500,  'نقد',         '2026-05-21', 'completed', ''),
  ('00000000-0000-0000-0000-000000000005', 'منى الحربي',                1200,  'تحويل بنكي', '2026-05-16', 'completed', ''),
  ('00000000-0000-0000-0000-000000000005', 'شركة الاتصالات السعودية',   20000, 'شيك',         '2026-05-25', 'pending',   'STC');

-- ── Seed: Campaigns ───────────────────────────────────────────
insert into public.campaigns (assoc_id, title, status, budget, reach, start_date) values
  ('00000000-0000-0000-0000-000000000002', 'حملة كسوة الشتاء 2026',         'active',  15000, '120K+',  '2026-04-01'),
  ('00000000-0000-0000-0000-000000000002', 'حملة إفطار الصائم',              'ended',   8000,  '80K',    '2026-03-01'),
  ('00000000-0000-0000-0000-000000000002', 'حملة دعم الطلاب المحتاجين',      'draft',   20000, '—',      null),
  ('00000000-0000-0000-0000-000000000003', 'حملة بناء الأسرة',               'active',  25000, '200K+',  '2026-04-15'),
  ('00000000-0000-0000-0000-000000000003', 'حملة الرعاية الصحية للأيتام',    'paused',  12000, '55K',    '2026-02-01'),
  ('00000000-0000-0000-0000-000000000004', 'حملة فرص العمل للشباب',          'active',  18000, '95K+',   '2026-05-01'),
  ('00000000-0000-0000-0000-000000000005', 'حملة الطوارئ الرمضانية',         'ended',   30000, '310K',   '2026-02-15'),
  ('00000000-0000-0000-0000-000000000005', 'حملة الدعم النفسي',              'draft',   10000, '—',      null);

-- ── Seed: Campaign Requests ───────────────────────────────────
insert into public.campaign_requests (assoc_id, influencer_id, type, budget, start_date, duration, message, status) values
  ('00000000-0000-0000-0000-000000000002', 1, 'خيرية',    8000,  '2026-06-01', 'أسبوعان', 'نرغب في التعاون معك لحملة كسوة الشتاء، يشمل المحتوى قصصاً من الميدان وتحفيز المتبرعين.', 'pending'),
  ('00000000-0000-0000-0000-000000000002', 3, 'توعوية',   12000, '2026-06-15', 'شهر',     'حملة توعوية بأهمية دعم الطلاب، مقاطع قصيرة على تيك توك تستهدف الشباب.', 'pending'),
  ('00000000-0000-0000-0000-000000000003', 2, 'اجتماعية', 10000, '2026-06-10', 'أسبوعان', 'نودّ التعاون في حملة توعوية لأهمية رعاية الأيتام على منصة X.', 'approved'),
  ('00000000-0000-0000-0000-000000000003', 5, 'وثائقية',  6000,  '2026-07-01', 'أسبوع',   'تغطية وثائقية لمشروعنا الجديد لرعاية الأيتام في مدينة جدة.', 'pending'),
  ('00000000-0000-0000-0000-000000000004', 1, 'تنموية',   5000,  '2026-06-20', 'أسبوع',   'حملة للتعريف ببرامجنا التدريبية للشباب واستقطاب المتطوعين.', 'matched'),
  ('00000000-0000-0000-0000-000000000005', 4, 'طارئة',    9000,  '2026-05-28', 'أسبوعان', 'نحتاج دعمك لحملة عاجلة لجمع تبرعات للأسر المتضررة.', 'rejected');

-- ── Seed: Matches ─────────────────────────────────────────────
insert into public.matches (assoc_id, influencer_id, status, start_date, budget, notes) values
  ('00000000-0000-0000-0000-000000000002', 2, 'active',    '2026-04-01', 14000, 'حملة ناجحة — المؤثرة هند الرشيدي. 4 منشورات أسبوعياً على X.'),
  ('00000000-0000-0000-0000-000000000003', 5, 'completed', '2026-02-15', 6000,  'تغطية مميزة لمشاريع الرعاية، أنتجنا 2 فيديو وثائقي قصير.'),
  ('00000000-0000-0000-0000-000000000004', 1, 'active',    '2026-05-01', 5000,  'تعاون لحملة فرص الشباب مع أبو خالد العوضي على إنستغرام.');

-- ── Seed: Platform Settings ───────────────────────────────────
insert into public.platform_settings (key, value) values
  ('platform_name',       'ساعِد'),
  ('contact_email',       'support@saaid.sa'),
  ('commission_rate',     '15'),
  ('maintenance_mode',    'false'),
  ('min_campaign_budget', '500')
on conflict (key) do nothing;
