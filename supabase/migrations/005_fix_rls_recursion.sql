-- Fix: RLS policies that query profiles from within profiles policies cause
-- infinite recursion (HTTP 500). Replace with a security definer function
-- that bypasses RLS internally.

create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ── profiles ──────────────────────────────────────────────────
drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles" on public.profiles
  for select using (public.is_admin());

-- ── influencers ───────────────────────────────────────────────
drop policy if exists "Admins manage influencers" on public.influencers;
create policy "Admins manage influencers" on public.influencers
  for all using (public.is_admin());

-- ── employees ─────────────────────────────────────────────────
drop policy if exists "Admins read all employees" on public.employees;
create policy "Admins read all employees" on public.employees
  for select using (public.is_admin());

-- ── tasks ─────────────────────────────────────────────────────
drop policy if exists "Admins read all tasks" on public.tasks;
create policy "Admins read all tasks" on public.tasks
  for select using (public.is_admin());

-- ── donations ─────────────────────────────────────────────────
drop policy if exists "Admins read all donations" on public.donations;
create policy "Admins read all donations" on public.donations
  for select using (public.is_admin());

-- ── campaigns ─────────────────────────────────────────────────
drop policy if exists "Admins read all campaigns" on public.campaigns;
create policy "Admins read all campaigns" on public.campaigns
  for select using (public.is_admin());

-- ── campaign_requests ─────────────────────────────────────────
drop policy if exists "Admins manage requests" on public.campaign_requests;
create policy "Admins manage requests" on public.campaign_requests
  for all using (public.is_admin());

-- ── associations ──────────────────────────────────────────────
drop policy if exists "Admins manage associations" on public.associations;
create policy "Admins manage associations" on public.associations
  for all using (public.is_admin());

-- ── matches ───────────────────────────────────────────────────
drop policy if exists "Admins manage matches" on public.matches;
create policy "Admins manage matches" on public.matches
  for all using (public.is_admin());

-- ── platform_settings ─────────────────────────────────────────
drop policy if exists "Admins manage settings" on public.platform_settings;
create policy "Admins manage settings" on public.platform_settings
  for all using (public.is_admin());
