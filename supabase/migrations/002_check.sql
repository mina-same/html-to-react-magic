-- Run this first to see what exists
select 'profiles'    as tbl, count(*) from public.profiles
union all
select 'influencers', count(*) from public.influencers
union all
select 'associations', count(*) from public.associations
union all
select 'employees',  count(*) from public.employees
union all
select 'tasks',      count(*) from public.tasks
union all
select 'donations',  count(*) from public.donations
union all
select 'campaigns',  count(*) from public.campaigns
union all
select 'campaign_requests', count(*) from public.campaign_requests
union all
select 'matches',    count(*) from public.matches;
