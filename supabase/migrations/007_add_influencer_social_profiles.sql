-- Add richer profile fields for influencer cards and profile page
alter table public.influencers
  add column if not exists bio text not null default '',
  add column if not exists location text not null default '',
  add column if not exists audience text not null default '',
  add column if not exists instagram_handle text not null default '',
  add column if not exists x_handle text not null default '',
  add column if not exists tiktok_handle text not null default '',
  add column if not exists youtube_handle text not null default '',
  add column if not exists snapchat_handle text not null default '',
  add column if not exists website text not null default '',
  add column if not exists email text not null default '',
  add column if not exists phone text not null default '';

update public.influencers
set
  bio = coalesce(bio, ''),
  location = coalesce(location, ''),
  audience = coalesce(audience, ''),
  instagram_handle = coalesce(instagram_handle, ''),
  x_handle = coalesce(x_handle, ''),
  tiktok_handle = coalesce(tiktok_handle, ''),
  youtube_handle = coalesce(youtube_handle, ''),
  snapchat_handle = coalesce(snapchat_handle, ''),
  website = coalesce(website, ''),
  email = coalesce(email, ''),
  phone = coalesce(phone, '')
where true;

update public.influencers
set
  bio = 'صانع محتوى يركز على الأسرة والعمل الخيري.',
  location = 'الرياض',
  audience = 'عائلات وشباب',
  instagram_handle = '@abokhaled',
  x_handle = '@abokhaled',
  tiktok_handle = '@abokhaled',
  youtube_handle = 'youtube.com/@abokhaled',
  snapchat_handle = '@abokhaled',
  website = 'https://abokhaled.example',
  email = 'contact@abokhaled.sa',
  phone = '+966500000001'
where name = 'أبو خالد العوضي';

update public.influencers
set
  bio = 'مهتمة بالقضايا الاجتماعية والوعي المجتمعي.',
  location = 'جدة',
  audience = 'مهتمون بالشأن العام',
  instagram_handle = '@hendalrasheedi',
  x_handle = '@hendalrasheedi',
  tiktok_handle = '',
  youtube_handle = '',
  snapchat_handle = '',
  website = 'https://hend.example',
  email = 'media@hend.example',
  phone = '+966500000002'
where name = 'هند الرشيدي';

update public.influencers
set
  bio = 'محتوى سريع الانتشار يجمع بين الترفيه والرسائل الخيرية.',
  location = 'الدمام',
  audience = '18-34',
  instagram_handle = '@ahmedq',
  x_handle = '',
  tiktok_handle = '@ahmedq',
  youtube_handle = 'youtube.com/@ahmedq',
  snapchat_handle = '@ahmedq',
  website = '',
  email = 'booking@ahmedq.sa',
  phone = '+966500000003'
where name = 'أحمد القحطاني';

update public.influencers
set
  bio = 'محتوى عائلي يومي مع حضور قوي في سناب شات.',
  location = 'الخبر',
  audience = 'الأمهات والشباب',
  instagram_handle = '@noura',
  x_handle = '',
  tiktok_handle = '',
  youtube_handle = '',
  snapchat_handle = '@noura',
  website = 'https://noura.example',
  email = 'hello@noura.example',
  phone = '+966500000004'
where name = 'نورة العتيبي';

update public.influencers
set
  bio = 'صانع أفلام قصيرة ووثائقيات إنسانية.',
  location = 'المدينة',
  audience = 'محبو المحتوى الوثائقي',
  instagram_handle = '@salm',
  x_handle = '@salm',
  tiktok_handle = '',
  youtube_handle = 'youtube.com/@salm',
  snapchat_handle = '',
  website = 'https://salm.example',
  email = 'media@salm.example',
  phone = '+966500000005'
where name = 'سالم الدوسري';

update public.influencers
set
  bio = 'محتوى نسائي اجتماعي مع حضور قوي في القصص والريلز.',
  location = 'الرياض',
  audience = 'نساء 18-40',
  instagram_handle = '@riham',
  x_handle = '',
  tiktok_handle = '@riham',
  youtube_handle = '',
  snapchat_handle = '@riham',
  website = 'https://riham.example',
  email = 'contact@riham.example',
  phone = '+966500000006'
where name = 'ريهام السبيعي';
