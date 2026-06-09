-- ============================================================
-- SAAID — Data-only seed (run AFTER creating users via Auth UI)
-- Step 1: Go to Supabase Dashboard → Authentication → Users
--         Create these 4 users (password: Test@1234):
--           takafol@saaid.sa  → assoc_name: جمعية تكاتف الخيرية
--           rahma@saaid.sa    → assoc_name: جمعية رحمة للأيتام
--           noor@saaid.sa     → assoc_name: جمعية نور للتنمية
--           aman@saaid.sa     → assoc_name: جمعية الأمان الاجتماعي
-- Step 2: Run THIS file
-- ============================================================

-- seed influencers (safe to re-run)
insert into public.influencers (name, platform, followers, engagement, status, campaigns, niche, notes, base_price) values
  ('أبو خالد العوضي',  'Instagram', 320000,  5.2, 'active',  4, 'محتوى خيري وعائلي',     'تعاقد سنوي',              1800),
  ('هند الرشيدي',      'X',         890000,  3.8, 'active',  2, 'شؤون اجتماعية',          '',                        3500),
  ('أحمد القحطاني',    'TikTok',    1200000, 7.1, 'active',  1, 'ترفيهي وخيري',           'حملة رمضان فقط',          5000),
  ('نورة العتيبي',     'Snapchat',  450000,  4.5, 'pending', 0, 'محتوى عائلي',             'قيد التفاوض على الأسعار', 2200),
  ('سالم الدوسري',     'YouTube',   280000,  6.3, 'active',  1, 'وثائقي خيري',             '',                        1500),
  ('ريهام السبيعي',    'Instagram', 175000,  8.9, 'ended',   2, 'محتوى نسائي واجتماعي',  'انتهى عقدها مارس 2025',  250)
on conflict do nothing;

-- platform settings
insert into public.platform_settings (key, value) values
  ('platform_name',       'ساعِد'),
  ('contact_email',       'support@saaid.sa'),
  ('commission_rate',     '15'),
  ('maintenance_mode',    'false'),
  ('min_campaign_budget', '500')
on conflict (key) do nothing;

-- ── seed the rest using the real UUIDs from auth.users ────────
-- We capture each association's UUID by email lookup, then insert all their data.

do $$
declare
  id1 uuid; -- تكاتف
  id2 uuid; -- رحمة
  id3 uuid; -- نور
  id4 uuid; -- أمان
  inf1 int; inf2 int; inf3 int; inf4 int; inf5 int;
begin

  -- get association UUIDs (these were created when the user signed up)
  select id into id1 from auth.users where email = 'takafol@saaid.sa' limit 1;
  select id into id2 from auth.users where email = 'rahma@saaid.sa'   limit 1;
  select id into id3 from auth.users where email = 'noor@saaid.sa'    limit 1;
  select id into id4 from auth.users where email = 'aman@saaid.sa'    limit 1;

  -- get influencer IDs (just inserted above)
  select id into inf1 from public.influencers where name = 'أبو خالد العوضي' limit 1;
  select id into inf2 from public.influencers where name = 'هند الرشيدي'     limit 1;
  select id into inf3 from public.influencers where name = 'أحمد القحطاني'   limit 1;
  select id into inf5 from public.influencers where name = 'سالم الدوسري'    limit 1;

  -- skip if any association user wasn't created yet
  if id1 is null and id2 is null and id3 is null and id4 is null then
    raise notice 'No association users found. Create them in Auth UI first, then re-run.';
    return;
  end if;

  -- ── associations ──────────────────────────────────────────
  if id1 is not null then
    insert into public.associations (id, license, region, phone, email, description, status, verified)
    values (id1, 'LIC-2021-0042', 'الرياض',  '0112345678', 'takafol@gmail.com',
            'جمعية خيرية متخصصة في دعم الأسر المحتاجة وتوزيع المساعدات العينية والنقدية', 'active', true)
    on conflict (id) do nothing;
  end if;

  if id2 is not null then
    insert into public.associations (id, license, region, phone, email, description, status, verified)
    values (id2, 'LIC-2019-0017', 'جدة',     '0126543210', 'rahma@gmail.com',
            'رعاية الأيتام وتأمين احتياجاتهم التعليمية والصحية والمعيشية', 'active', true)
    on conflict (id) do nothing;
  end if;

  if id3 is not null then
    insert into public.associations (id, license, region, phone, email, description, status, verified)
    values (id3, 'LIC-2023-0089', 'الدمام',  '0138765432', 'noor@gmail.com',
            'برامج تنموية وتدريبية لتمكين الشباب وتأهيلهم لسوق العمل', 'new', false)
    on conflict (id) do nothing;
  end if;

  if id4 is not null then
    insert into public.associations (id, license, region, phone, email, description, status, verified)
    values (id4, 'LIC-2020-0031', 'المدينة', '0148901234', 'aman@gmail.com',
            'شبكة أمان اجتماعي للأفراد والأسر في حالات الطوارئ والأزمات', 'pending', false)
    on conflict (id) do nothing;
  end if;

  -- ── employees ─────────────────────────────────────────────
  if id1 is not null then
    insert into public.employees (assoc_id, name, role, status, color) values
      (id1, 'محمد العتيبي',  'مدير تنفيذي',       'active', '#1a5c3a'),
      (id1, 'سارة القحطاني', 'منسقة برامج',       'active', '#2d7a52'),
      (id1, 'خالد الشمري',   'مسؤول مالي',        'away',   '#4a9e70'),
      (id1, 'نورا الزهراني', 'أخصائية اجتماعية',  'active', '#c9a84c');
  end if;

  if id2 is not null then
    insert into public.employees (assoc_id, name, role, status, color) values
      (id2, 'عبدالله الدوسري', 'رئيس مجلس الإدارة',  'active', '#1a5c3a'),
      (id2, 'ليلى المطيري',    'مديرة رعاية',         'active', '#2d7a52'),
      (id2, 'فهد البقمي',      'مسؤول جمع التبرعات',  'active', '#9b59b6');
  end if;

  if id3 is not null then
    insert into public.employees (assoc_id, name, role, status, color) values
      (id3, 'ريم الحارثي', 'المديرة التنفيذية', 'active', '#1a5c3a'),
      (id3, 'أنس السلمي',  'منسق تدريب',        'active', '#e67e22'),
      (id3, 'دانا العمري', 'إعلام وتواصل',      'off',    '#2d7a52');
  end if;

  if id4 is not null then
    insert into public.employees (assoc_id, name, role, status, color) values
      (id4, 'سلطان الرشيدي', 'المدير العام',    'active', '#1a5c3a'),
      (id4, 'هيا المنصور',   'مسؤولة الحالات', 'active', '#2d7a52');
  end if;

  -- ── tasks ─────────────────────────────────────────────────
  if id1 is not null then
    insert into public.tasks (assoc_id, title, status, urgency, deadline, category, notes) values
      (id1, 'إعداد تقرير التبرعات الشهري',  'doing', 'urgent', '2026-05-30', 'مالي',    'يجب تسليمه لمجلس الإدارة'),
      (id1, 'تنظيم حفل التكريم السنوي',      'todo',  'high',   '2026-06-15', 'فعاليات', ''),
      (id1, 'تحديث قاعدة بيانات المستفيدين', 'done',  'normal', '2026-05-20', 'إداري',   'تم بنجاح'),
      (id1, 'التواصل مع المتبرعين الجدد',    'todo',  'normal', '2026-06-01', 'تواصل',   '');
  end if;

  if id2 is not null then
    insert into public.tasks (assoc_id, title, status, urgency, deadline, category, notes) values
      (id2, 'صرف المنح الدراسية لشهر مايو', 'doing', 'urgent', '2026-05-28', 'مالي',   '32 طالباً'),
      (id2, 'زيارة دور الرعاية في جدة',      'todo',  'high',   '2026-06-10', 'رعاية',  ''),
      (id2, 'تجديد عقد مقر الجمعية',          'todo',  'urgent', '2026-05-31', 'إداري',  'العقد ينتهي نهاية الشهر');
  end if;

  if id3 is not null then
    insert into public.tasks (assoc_id, title, status, urgency, deadline, category, notes) values
      (id3, 'إطلاق دورة تدريب المهارات',   'doing', 'high',   '2026-06-05', 'تدريب', '20 مقعداً متاحاً'),
      (id3, 'تصميم بروشور الجمعية الجديد', 'todo',  'normal', '2026-06-20', 'إعلام', '');
  end if;

  if id4 is not null then
    insert into public.tasks (assoc_id, title, status, urgency, deadline, category, notes) values
      (id4, 'تسجيل 15 حالة طارئة جديدة', 'done',  'urgent', '2026-05-22', 'حالات', ''),
      (id4, 'متابعة ملفات طلبات الدعم',   'doing', 'high',   '2026-05-29', 'حالات', '8 ملفات معلقة');
  end if;

  -- ── donations ─────────────────────────────────────────────
  if id1 is not null then
    insert into public.donations (assoc_id, name, amount, channel, date, status, org) values
      (id1, 'أحمد بن محمد النغيمشي', 5000,  'تحويل بنكي', '2026-05-20', 'completed', ''),
      (id1, 'شركة الراجحي للتطوير',  25000, 'تحويل بنكي', '2026-05-18', 'completed', 'الراجحي للتطوير'),
      (id1, 'فاطمة العتيبي',         1000,  'نقد',         '2026-05-15', 'completed', ''),
      (id1, 'مجهول',                  500,   'نقد',         '2026-05-10', 'completed', ''),
      (id1, 'شركة أبشر الخيرية',     15000, 'شيك',         '2026-05-24', 'pending',   'أبشر الخيرية');
  end if;

  if id2 is not null then
    insert into public.donations (assoc_id, name, amount, channel, date, status, org) values
      (id2, 'محمد الدوسري',          3000,  'تحويل بنكي', '2026-05-19', 'completed', ''),
      (id2, 'مؤسسة الفيصل الخيرية', 50000, 'تحويل بنكي', '2026-05-12', 'completed', 'مؤسسة الفيصل'),
      (id2, 'نورة السبيعي',          2500,  'نقد',         '2026-05-08', 'completed', ''),
      (id2, 'مجموعة أعمال الخليج',   10000, 'شيك',         '2026-05-23', 'pending',   'أعمال الخليج');
  end if;

  if id3 is not null then
    insert into public.donations (assoc_id, name, amount, channel, date, status, org) values
      (id3, 'عبدالرحمن الغامدي',   2000, 'تحويل بنكي', '2026-05-17', 'completed', ''),
      (id3, 'جمعية رجال الأعمال',  8000, 'تحويل بنكي', '2026-05-14', 'completed', 'رجال الأعمال');
  end if;

  if id4 is not null then
    insert into public.donations (assoc_id, name, amount, channel, date, status, org) values
      (id4, 'خالد المطيري',              1500,  'نقد',         '2026-05-21', 'completed', ''),
      (id4, 'منى الحربي',                1200,  'تحويل بنكي', '2026-05-16', 'completed', ''),
      (id4, 'شركة الاتصالات السعودية',   20000, 'شيك',         '2026-05-25', 'pending',   'STC');
  end if;

  -- ── campaigns ─────────────────────────────────────────────
  if id1 is not null then
    insert into public.campaigns (assoc_id, title, status, budget, reach, start_date) values
      (id1, 'حملة كسوة الشتاء 2026',    'active', 15000, '120K+', '2026-04-01'),
      (id1, 'حملة إفطار الصائم',         'ended',  8000,  '80K',   '2026-03-01'),
      (id1, 'حملة دعم الطلاب المحتاجين', 'draft',  20000, '—',     null);
  end if;

  if id2 is not null then
    insert into public.campaigns (assoc_id, title, status, budget, reach, start_date) values
      (id2, 'حملة بناء الأسرة',            'active', 25000, '200K+', '2026-04-15'),
      (id2, 'حملة الرعاية الصحية للأيتام', 'paused', 12000, '55K',   '2026-02-01');
  end if;

  if id3 is not null then
    insert into public.campaigns (assoc_id, title, status, budget, reach, start_date) values
      (id3, 'حملة فرص العمل للشباب', 'active', 18000, '95K+', '2026-05-01');
  end if;

  if id4 is not null then
    insert into public.campaigns (assoc_id, title, status, budget, reach, start_date) values
      (id4, 'حملة الطوارئ الرمضانية', 'ended', 30000, '310K', '2026-02-15'),
      (id4, 'حملة الدعم النفسي',      'draft', 10000, '—',    null);
  end if;

  -- ── campaign requests ─────────────────────────────────────
  if id1 is not null and inf1 is not null then
    insert into public.campaign_requests (assoc_id, influencer_id, type, budget, start_date, duration, message, status) values
      (id1, inf1, 'خيرية',  8000,  '2026-06-01', 'أسبوعان', 'نرغب في التعاون معك لحملة كسوة الشتاء، يشمل المحتوى قصصاً من الميدان وتحفيز المتبرعين.', 'pending'),
      (id1, inf3, 'توعوية', 12000, '2026-06-15', 'شهر',     'حملة توعوية بأهمية دعم الطلاب، مقاطع قصيرة على تيك توك تستهدف الشباب.', 'pending');
  end if;

  if id2 is not null and inf2 is not null then
    insert into public.campaign_requests (assoc_id, influencer_id, type, budget, start_date, duration, message, status) values
      (id2, inf2, 'اجتماعية', 10000, '2026-06-10', 'أسبوعان', 'نودّ التعاون في حملة توعوية لأهمية رعاية الأيتام على منصة X.', 'approved'),
      (id2, inf5, 'وثائقية',  6000,  '2026-07-01', 'أسبوع',   'تغطية وثائقية لمشروعنا الجديد لرعاية الأيتام في مدينة جدة.',    'pending');
  end if;

  if id3 is not null and inf1 is not null then
    insert into public.campaign_requests (assoc_id, influencer_id, type, budget, start_date, duration, message, status) values
      (id3, inf1, 'تنموية', 5000, '2026-06-20', 'أسبوع', 'حملة للتعريف ببرامجنا التدريبية للشباب واستقطاب المتطوعين.', 'matched');
  end if;

  -- ── matches ───────────────────────────────────────────────
  if id1 is not null and inf2 is not null then
    insert into public.matches (assoc_id, influencer_id, status, start_date, budget, notes) values
      (id1, inf2, 'active', '2026-04-01', 14000, 'حملة ناجحة — المؤثرة هند الرشيدي. 4 منشورات أسبوعياً على X.');
  end if;

  if id2 is not null and inf5 is not null then
    insert into public.matches (assoc_id, influencer_id, status, start_date, budget, notes) values
      (id2, inf5, 'completed', '2026-02-15', 6000, 'تغطية مميزة لمشاريع الرعاية، أنتجنا 2 فيديو وثائقي قصير.');
  end if;

  if id3 is not null and inf1 is not null then
    insert into public.matches (assoc_id, influencer_id, status, start_date, budget, notes) values
      (id3, inf1, 'active', '2026-05-01', 5000, 'تعاون لحملة فرص الشباب مع أبو خالد العوضي على إنستغرام.');
  end if;

end $$;
