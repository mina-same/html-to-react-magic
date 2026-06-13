-- ============================================================
-- Add new donation fields to donations table
-- ============================================================

ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS donation_number text default '',
ADD COLUMN IF NOT EXISTS phone text default '',
ADD COLUMN IF NOT EXISTS project_name text default '',
ADD COLUMN IF NOT EXISTS payment_method text default 'نقد',
ADD COLUMN IF NOT EXISTS bank text default '',
ADD COLUMN IF NOT EXISTS account_number text default '',
ADD COLUMN IF NOT EXISTS source text default '';
