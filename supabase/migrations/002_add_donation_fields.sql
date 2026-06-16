-- ============================================================
-- Add new donation fields to donations table
-- ============================================================

alter table public.donations
add column if not exists donation_number text default '',
add column if not exists phone text default '',
add column if not exists project_name text default '',
add column if not exists payment_method text default 'نقد',
add column if not exists bank text default '',
add column if not exists account_number text default '',
add column if not exists source text default '';

drop policy if exists "Admins read all donations" on public.donations;
create policy "Admins read all donations" on public.donations
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins manage donations" on public.donations;
create policy "Admins manage donations" on public.donations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
