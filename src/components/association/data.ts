import type { Influencer, Employee, Task, Donation, Service } from "./types";

export const INF_COLORS = [
  "#7c3aed","#be185d","#0369a1","#b91c1c","#166534","#92400e","#0f766e",
];

export const INITIAL_INFLUENCERS: Influencer[] = [
  { id:1, name:"أبو خالد العوضي",  platform:"Instagram", followers:320000,  engagement:5.2, status:"active",  campaigns:4, niche:"محتوى خيري وعائلي",      notes:"تعاقد سنوي",              basePrice:1800, bio:"صانع محتوى يركز على الأسرة والعمل الخيري.", location:"الرياض", audience:"عائلات وشباب", instagramHandle:"@abokhaled", xHandle:"@abokhaled", tiktokHandle:"@abokhaled", youtubeHandle:"youtube.com/@abokhaled", snapchatHandle:"@abokhaled", website:"https://abokhaled.example", email:"contact@abokhaled.sa", phone:"+966500000001" },
  { id:2, name:"هند الرشيدي",      platform:"X",         followers:890000,  engagement:3.8, status:"active",  campaigns:2, niche:"شؤون اجتماعية",           notes:"",                         basePrice:3500, bio:"مهتمة بالقضايا الاجتماعية والوعي المجتمعي.", location:"جدة", audience:"مهتمون بالشأن العام", instagramHandle:"@hendalrasheedi", xHandle:"@hendalrasheedi", tiktokHandle:"", youtubeHandle:"", snapchatHandle:"", website:"https://hend.example", email:"media@hend.example", phone:"+966500000002" },
  { id:3, name:"أحمد القحطاني",    platform:"TikTok",    followers:1200000, engagement:7.1, status:"active",  campaigns:1, niche:"ترفيهي وخيري",            notes:"حملة رمضان فقط",           basePrice:5000, bio:"محتوى سريع الانتشار يجمع بين الترفيه والرسائل الخيرية.", location:"الدمام", audience:"18-34", instagramHandle:"@ahmedq", xHandle:"", tiktokHandle:"@ahmedq", youtubeHandle:"youtube.com/@ahmedq", snapchatHandle:"@ahmedq", website:"", email:"booking@ahmedq.sa", phone:"+966500000003" },
  { id:4, name:"نورة العتيبي",     platform:"Snapchat",  followers:450000,  engagement:4.5, status:"pending", campaigns:0, niche:"محتوى عائلي",              notes:"قيد التفاوض على الأسعار", basePrice:2200, bio:"محتوى عائلي يومي مع حضور قوي في سناب شات.", location:"الخبر", audience:"الأمهات والشباب", instagramHandle:"@noura", xHandle:"", tiktokHandle:"", youtubeHandle:"", snapchatHandle:"@noura", website:"https://noura.example", email:"hello@noura.example", phone:"+966500000004" },
  { id:5, name:"سالم الدوسري",     platform:"YouTube",   followers:280000,  engagement:6.3, status:"active",  campaigns:1, niche:"وثائقي خيري",              notes:"",                         basePrice:1500, bio:"صانع أفلام قصيرة ووثائقيات إنسانية.", location:"المدينة", audience:"محبو المحتوى الوثائقي", instagramHandle:"@salm", xHandle:"@salm", tiktokHandle:"", youtubeHandle:"youtube.com/@salm", snapchatHandle:"", website:"https://salm.example", email:"media@salm.example", phone:"+966500000005" },
  { id:6, name:"ريهام السبيعي",    platform:"Instagram", followers:175000,  engagement:8.9, status:"ended",   campaigns:2, niche:"محتوى نسائي واجتماعي",   notes:"انتهى عقدها مارس 2025",   basePrice:250, bio:"محتوى نسائي اجتماعي مع حضور قوي في القصص والريلز.", location:"الرياض", audience:"نساء 18-40", instagramHandle:"@riham", xHandle:"", tiktokHandle:"@riham", youtubeHandle:"", snapchatHandle:"@riham", website:"https://riham.example", email:"contact@riham.example", phone:"+966500000006" },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id:1, name:"سارة العمري",      role:"مدير تسويق",   status:"active", color:"#7c3aed" },
  { id:2, name:"محمد الحربي",      role:"مدير البرامج", status:"active", color:"#0369a1" },
  { id:3, name:"نوف الشهري",       role:"محاسبة",       status:"active", color:"#be185d" },
  { id:4, name:"خالد الغامدي",     role:"تصميم",        status:"away",   color:"#b91c1c" },
  { id:5, name:"ريم السيد",        role:"علاقات عامة",  status:"off",    color:"#166534" },
  { id:6, name:"فيصل العتيبي",     role:"مطوّر",        status:"active", color:"#92400e" },
  { id:7, name:"أميرة الزهراني",   role:"تنسيق",        status:"away",   color:"#0f766e" },
];

export const INITIAL_TASKS: Task[] = [
  { id:1, title:"إطلاق حملة رمضان التوعوية",     status:"doing", urgency:"urgent", deadline:"2025-05-30", assignee:1, category:"حملات",   notes:"تنسيق مع المؤثرين قبل الموعد" },
  { id:2, title:"تصميم بنر التبرع الرمضاني",      status:"todo",  urgency:"high",   deadline:"2025-06-05", assignee:4, category:"تصميم",   notes:"" },
  { id:3, title:"نشر تقرير الشفافية الربعي",       status:"todo",  urgency:"normal", deadline:"2025-06-15", assignee:2, category:"إدارة",   notes:"" },
  { id:4, title:"تحديث بيانات المتبرعين",          status:"done",  urgency:"normal", deadline:"2025-05-20", assignee:3, category:"تبرعات",  notes:"" },
  { id:5, title:"مراجعة عروض المؤثرين الجدد",     status:"doing", urgency:"high",   deadline:"2025-05-28", assignee:1, category:"محتوى",   notes:"انتظار ردود من 3 مؤثرين" },
  { id:6, title:"تحديث صفحة السوشيال ميديا",      status:"todo",  urgency:"low",    deadline:"2025-06-20", assignee:5, category:"محتوى",   notes:"" },
  { id:7, title:"تجديد عقد المؤثر سالم الدوسري",  status:"todo",  urgency:"urgent", deadline:"2025-05-25", assignee:2, category:"شراكات",  notes:"ينتهي العقد قريباً" },
  { id:8, title:"إعداد خطة محتوى يونيو",          status:"done",  urgency:"normal", deadline:"2025-05-22", assignee:1, category:"محتوى",   notes:"" },
];

export const INITIAL_DONATIONS: Donation[] = [
  { id:1,  name:"أحمد الفيصل",    amount:20000, channel:"شيك",      date:"2025-05-12", status:"completed", org:"مؤسسة الأمل" },
  { id:2,  name:"شركة البركة",    amount:15000, channel:"تحويل",    date:"2025-05-10", status:"completed", org:"شركة" },
  { id:3,  name:"سلمى العمري",    amount:5000,  channel:"STC Pay",  date:"2025-05-09", status:"completed", org:"" },
  { id:4,  name:"عبدالله الشمري", amount:3000,  channel:"بطاقة",    date:"2025-05-08", status:"pending",   org:"" },
  { id:5,  name:"مجموعة خيرية",   amount:2500,  channel:"تحويل",    date:"2025-05-06", status:"completed", org:"جمعية" },
  { id:6,  name:"نورة الحربي",    amount:1000,  channel:"Apple Pay", date:"2025-05-04", status:"completed", org:"" },
  { id:7,  name:"متبرع مجهول",    amount:500,   channel:"نقد",      date:"2025-05-02", status:"pending",   org:"" },
  { id:8,  name:"فهد الغامدي",    amount:1500,  channel:"بطاقة",    date:"2025-04-28", status:"completed", org:"" },
  { id:9,  name:"رياض الأنصاري",  amount:800,   channel:"STC Pay",  date:"2025-04-25", status:"completed", org:"" },
  { id:10, name:"شركة الرياض",    amount:10000, channel:"تحويل",    date:"2025-04-20", status:"completed", org:"شركة" },
];

export const SERVICES: Service[] = [
  { id:"profile",   icon:"📋", title:"ملف الجمعية الرقمي",        desc:"ملف تعريفي احترافي مُعزَّز بالذكاء الاصطناعي",       price:"مجاناً" },
  { id:"content",   icon:"✍️", title:"توليد المحتوى التسويقي",    desc:"منشورات، قصص، ونداءات تبرع مخصصة",                   price:"99 ر.س / شهرياً" },
  { id:"campaigns", icon:"📣", title:"إدارة الحملات",              desc:"ربط مع المؤثرين وإدارة الحملات الخيرية",              price:"199 ر.س / شهرياً" },
  { id:"analytics", icon:"📊", title:"تحليلات المنصة",             desc:"تقارير الأداء والوصول والتبرعات",                     price:"149 ر.س / شهرياً" },
  { id:"team",      icon:"👥", title:"إدارة الفريق",               desc:"مهام، أدوار، وأذونات الفريق",                         price:"مجاناً" },
];

export const AI_CONTENT: Record<"post"|"story"|"donation", string> = {
  post: "بقلوبٍ تنبض بالإيمان، وأيدٍ تسعى للخير، تواصل جمعيتنا مسيرتها في خدمة المجتمع. كل يوم نُحدث فرقًا في حياة عائلات محتاجة، ونزرع بسمة الأمل في قلوب الأيتام. ساندونا في هذه المسيرة المباركة — تبرعكم الصغير يصنع تغييرًا كبيرًا. 💚 #جمعية_خيرية #ساعِد",
  story: "في إحدى قرى المنطقة، كانت حياة عائلة قد تغيّرت بفضل مشروع بئر المياه. الأم تقول: 'كنا نسير ساعاتٍ طويلة لجلب الماء، واليوم نجد الماء على بُعد خطوات من بيتنا.' هذا ما يصنعه دعمكم — قصص حقيقية، وتغيير حقيقي.",
  donation: "أخي الكريم، أختي الكريمة... كل ريال تتبرع به يُغيّر حياةً وينير مستقبلاً. مشاريعنا الخيرية تنتظر دعمكم لتصل إلى المحتاجين. تبرّع الآن وكن شريكًا في الأجر. 🤲",
};

export const AI_ANALYSIS = {
  summary: "جمعية خيرية رائدة تعمل في مجال دعم الأسر المحتاجة وتطوير المجتمع. تتميز بتنوع برامجها الخيرية وشفافيتها العالية في الإفصاح عن مصادر التمويل.",
  ideas: [
    "حملة توعية رمضانية عبر السوشيال ميديا",
    "إطلاق تقرير شفافية سنوي بتصميم احترافي",
    "تفعيل برنامج المتبرع الشهري المنتظم",
    "قصص نجاح مصوّرة من المستفيدين",
  ],
  painPoints: [
    "ضعف الحضور الرقمي مقارنة بالجمعيات المشابهة",
    "غياب استراتيجية محتوى واضحة ومستدامة",
    "محدودية الوصول لشريحة الشباب عبر منصات TikTok وInstagram",
  ],
};

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}
