import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/saaid-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ساعِد – المساعدة، اليد التي تمتد لتصنع أثرًا" },
      { name: "description", content: "مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية" },
    ],
  }),
  component: Landing,
});

/* ───────── small ui atoms ───────── */
const SectionTag = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <span
    className={
      "inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 " +
      (dark ? "bg-white/10 text-white/80" : "bg-saaid-g5 text-saaid-g2")
    }
  >
    {children}
  </span>
);

const SectionTitle = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <h2 className={"text-3xl md:text-4xl font-extrabold leading-tight mb-4 " + (dark ? "text-white" : "text-saaid-td")}>
    {children}
  </h2>
);

const SectionDesc = ({ children, dark = false, center = false }: { children: React.ReactNode; dark?: boolean; center?: boolean }) => (
  <p
    className={
      "text-base md:text-lg leading-loose max-w-2xl " +
      (dark ? "text-white/65" : "text-saaid-tl") +
      (center ? " mx-auto" : "")
    }
  >
    {children}
  </p>
);

/* ───────── data ───────── */
const NAV_LINKS = [
  { id: "about", label: "من نحن" },
  { id: "services", label: "خدماتنا" },
  { id: "how", label: "كيف نعمل" },
  { id: "why", label: "لماذا ساعِد" },
  { id: "impact", label: "أثرنا" },
];

const VALUES = [
  "الأثر قبل الأرقام",
  "الشفافية والمصداقية",
  "الشراكة لا التنفيذ فقط",
  "الاحترافية في خدمة العمل الخيري",
  "الإنسان أولًا",
];

const ABOUT_CARDS = [
  { icon: "🎯", title: "رؤيتنا", text: "أن نكون الشريك الإعلامي الأول للجمعيات الخيرية في المملكة العربية السعودية" },
  { icon: "📢", title: "رسالتنا", text: "تمكين الجمعيات الخيرية من إيصال رسالتها الإنسانية لأكبر شريحة ممكنة" },
  { icon: "🤝", title: "شريك حقيقي", text: "لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة أثر حقيقي" },
  { icon: "⭐", title: "تجربة مثبتة", text: "عملنا مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات الرائدة" },
];

const SERVICES = [
  { icon: "📱", title: "الظهور الإعلامي وبناء الهوية", desc: "نبني هويتك الإعلامية بالكامل ونديرها باحترافية", items: ["إدارة الحسابات على منصات التواصل الاجتماعي", "بناء الهوية الإعلامية واللغة البصرية", "توحيد الرسائل والمحتوى مع أهداف الجمعية"] },
  { icon: "🎬", title: "صناعة المحتوى المؤثر", desc: "محتوى يحرّك القلوب ويدفع نحو التبرع والمشاركة", items: ["محتوى قصصي إنساني Storytelling", "فيديوهات توعوية وتعريفية بالمشاريع", "تغطيات ميدانية للمبادرات والأنشطة", "محتوى تفاعلي يزيد من الانتشار"] },
  { icon: "📊", title: "تصميم التقارير والملفات التعريفية", desc: "نحوّل بياناتك إلى محتوى بصري واضح ومؤثر", items: ["تصميم الملف التعريفي الرسمي", "إعداد تقارير المشاريع", "تحويل التقارير إلى موشن جرافيك"] },
  { icon: "🚀", title: "الحملات الإعلامية وجمع التبرعات", desc: "حملات رقمية مدروسة ترفع معدلات التبرع", items: ["حملات موسمية: رمضان، الحج، الأعياد", "صفحات هبوط مخصصة للحملات", "تحسين الرسائل التحفيزية للتبرع"] },
  { icon: "🌟", title: "إدارة المؤثرين والشراكات", desc: "نربطك بالمؤثرين المناسبين لرسالتك", items: ["ربط الجمعيات بالمؤثرين المناسبين", "إدارة حملات المؤثرين باحترافية", "توثيق الشراكات الإعلامية"] },
  { icon: "📰", title: "التغطية الإعلامية والمناسبات", desc: "نبرز إنجازات جمعيتك في كل مناسبة", items: ["تغطية الفعاليات والملتقيات الخيرية", "إدارة الحضور الإعلامي للمناسبات", "إبراز إنجازات الجمعية إعلاميًا"] },
];

const STEPS = [
  { n: "١", title: "فهم الرسالة والأهداف", text: "نبدأ بالاستماع العميق لفهم رسالتكم وطموحاتكم" },
  { n: "٢", title: "تحليل الوضع الإعلامي", text: "نقيّم الوضع الحالي ونحدد الفجوات والفرص" },
  { n: "٣", title: "بناء الاستراتيجية", text: "نصمم خطة إعلامية مخصصة لأهداف جمعيتكم" },
  { n: "٤", title: "تنفيذ المحتوى والحملات", text: "ننفذ بدقة واحترافية كل عناصر الخطة الموضوعة" },
  { n: "٥", title: "قياس الأثر والتطوير", text: "نقيس النتائج ونطور باستمرار لتعظيم الأثر" },
];

const WHY = [
  { icon: "🏛️", title: "فهم عميق للقطاع الخيري السعودي", text: "خبرة متخصصة في القطاع غير الربحي وفهم عميق لاحتياجاته وخصوصيته" },
  { icon: "💡", title: "خبرة في الإعلام الرقمي وصناعة التأثير", text: "فريق متخصص في المحتوى الرقمي والحملات التي تصنع فارقًا حقيقيًا" },
  { icon: "❤️", title: "محتوى إنساني يحترم الرسالة ولا يبتذلها", text: "نروي القصص بطريقة تحترم كرامة المستفيدين وتعكس نبل رسالتكم" },
  { icon: "📈", title: "تركيز على النتائج والأثر الحقيقي", text: "لا نكتفي بالجمال البصري، بل نقيس الأثر الحقيقي على التبرعات والوعي" },
  { icon: "🤝", title: "شريك طويل المدى وليس مزود خدمة مؤقت", text: "نبني علاقات شراكة حقيقية وطويلة الأمد، لا مجرد تعاقدات موسمية" },
  { icon: "🏆", title: "تجربة مثبتة مع جمعيات رائدة", text: "سجل حافل مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات المرموقة" },
];

const IMPACT = [
  { icon: "🏛️", num: "10 جمعيات", label: "تحت الإدارة الإعلامية الكاملة في المملكة" },
  { icon: "💵", num: "+2,000,000 ريال", label: "تمويلات محققة لجمعياتنا الشريكة" },
  { icon: "❤️", num: "10,000 ريال", label: "تبرعات مجمّعة عبر حملاتنا الرقمية" },
  { icon: "📡", num: "وصول أوسع", label: "لرسالة الجمعية لأكبر شريحة ممكنة من المجتمع" },
  { icon: "🔄", num: "متابع ← داعم", label: "تحويل المتابع إلى داعم وشريك فاعل" },
];

const TARGETS = [
  { icon: "🕌", label: "الجمعيات الخيرية" },
  { icon: "🏛️", label: "المؤسسات غير الربحية" },
  { icon: "🌱", label: "المبادرات المجتمعية" },
  { icon: "📿", label: "الأوقاف والمنظمات الإنسانية" },
];

const AI_FEATURES = [
  { icon: "🎨", text: "توليد صور بالـ AI" },
  { icon: "🎥", text: "فيديوهات تلقائية" },
  { icon: "✍️", text: "كتابة محتوى ذكي" },
  { icon: "📅", text: "جدولة المنشورات" },
  { icon: "📊", text: "تقارير الأداء" },
  { icon: "🎯", text: "إدارة الحملات" },
];

/* ───────── component ───────── */
function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="font-arabic bg-white text-saaid-td overflow-x-hidden" dir="rtl">
      {/* NAV */}
      <nav
        className={
          "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 backdrop-blur-md border-b border-saaid-g2/15 bg-white/95 transition-shadow " +
          (scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.08)]" : "")
        }
      >
        <a href="#hero" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-saaid-g1 to-saaid-g4 flex items-center justify-center text-white font-extrabold">
            س
          </div>
          <div className="leading-tight">
            <div className="text-xl font-extrabold text-saaid-g2">ساعِد</div>
            <div className="text-[0.65rem] tracking-[0.2em] text-saaid-g4">SAAID</div>
          </div>
        </a>

        <ul className="hidden md:flex gap-8 list-none">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className="text-sm font-medium text-saaid-tm hover:text-saaid-g2 transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="#cta" className="hidden md:inline-flex bg-saaid-g2 text-white border-2 border-saaid-g2 rounded-full px-6 py-2 text-sm font-semibold hover:bg-transparent hover:text-saaid-g2 transition-all">
            تواصل معنا
          </a>
          <Link to="/gate" className="inline-flex bg-saaid-g2 text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-saaid-g3 hover:-translate-y-px transition-all">
            دخول المنصة ←
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center px-6 md:px-16 pt-28 pb-16 overflow-hidden bg-gradient-to-br from-[#0d3322] via-saaid-g2 to-saaid-g3"
      >
        <div className="absolute -right-40 -top-40 w-[50rem] h-[50rem] rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-[30rem] h-[30rem] rounded-full bg-white/[0.03] pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/85 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-1.5 h-1.5 bg-saaid-gold rounded-full animate-pulse" />
            المبادرة الإعلامية الأولى للجمعيات الخيرية
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-3">
            <span className="text-saaid-gold">ساعِد</span> —<br />
            اليد التي تمتد<br />
            لتصنع أثرًا
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light leading-loose mb-3">
            المساعدة – الأثر قبل الأرقام
          </p>
          <p className="text-base text-white/60 leading-loose mb-10 max-w-xl">
            مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية،
            عبر تمكينها من الظهور الإعلامي المؤثر والاحترافي وتحويل رسالتها
            الإنسانية إلى قصص تصل للناس وتحرّكهم نحو التبرع والمشاركة.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#cta" className="inline-flex items-center gap-2 bg-saaid-gold text-saaid-g2 rounded-full px-7 py-3 font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(201,168,76,0.4)] transition-all">
              ابدأ الشراكة معنا ←
            </a>
            <Link to="/gate" className="inline-flex items-center gap-2 bg-white text-saaid-g2 border-2 border-saaid-g2 rounded-full px-7 py-3 font-bold hover:bg-saaid-g2 hover:text-white transition-all">
              🔐 دخول المنصة
            </Link>
            <a href="#services" className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/30 rounded-full px-7 py-3 font-semibold hover:border-white hover:bg-white/10 transition-all">
              اكتشف خدماتنا
            </a>
            <a
              href="https://drive.google.com/file/d/1Woa17q3C2o4_HGd3zdTAVoVzp2NjjeNh/view"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/30 rounded-full px-7 py-3 font-semibold hover:border-white hover:bg-white/10 transition-all"
            >
              📄 الملف التعريفي
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mt-16 pt-8 border-t border-white/10">
            {[
              { n: "10", l: "جمعية تحت الإدارة" },
              { n: "+2M", l: "ريال تمويلات محققة" },
              { n: "10K", l: "ريال تبرعات مجمّعة" },
              { n: "5", l: "خدمات متكاملة" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-saaid-gold">{s.n}</div>
                <div className="text-xs text-white/50 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* hero visual */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none z-0 hidden lg:flex items-center justify-center">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_18s_linear_infinite]" />
            <div className="absolute inset-6 rounded-full border border-dashed border-saaid-gold/25 animate-[spin_10s_linear_infinite_reverse]" />
            <div className="absolute inset-16 rounded-full border border-saaid-gold/15 bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
            <img src={logo} alt="ساعِد" className="w-40 relative z-10 animate-[float_4s_ease-in-out_infinite] brightness-0 invert" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 md:px-16 bg-[#f8faf9]">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <SectionTag>من نحن</SectionTag>
            <SectionTitle>نؤمن أن الخير<br />يستحق أن يُرى</SectionTitle>
            <SectionDesc>
              نؤمن أن العمل الخيري لا يحتاج فقط إلى نية صادقة، بل إلى صوت قوي،
              وصورة واضحة، ورسالة تصل في الوقت الصحيح وبالطريقة الصحيحة.
            </SectionDesc>
            <div className="flex flex-col gap-3 mt-8">
              {VALUES.map((v) => (
                <div key={v} className="flex items-center gap-3 bg-white border border-saaid-g2/15 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-saaid-g3 flex-shrink-0" />
                  <span className="text-saaid-tm font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ABOUT_CARDS.map((c, i) => (
              <div
                key={c.title}
                className={
                  "bg-white rounded-2xl p-6 border border-saaid-g2/15 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(26,92,58,0.1)] transition-all " +
                  (i === 1 ? "mt-8 " : "") + (i === 3 ? "-mt-8 " : "")
                }
              >
                <div className="w-12 h-12 rounded-xl bg-saaid-g5 text-saaid-g2 flex items-center justify-center text-xl mb-3">{c.icon}</div>
                <h4 className="font-bold text-saaid-td mb-1">{c.title}</h4>
                <p className="text-sm text-saaid-tl leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6 md:px-16 bg-white">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionTag>خدماتنا</SectionTag>
          <SectionTitle>ماذا نقدم؟</SectionTitle>
          <SectionDesc center>خمس خدمات متكاملة تغطي كل احتياجات الجمعية الخيرية الإعلامية</SectionDesc>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div key={s.title} className="relative overflow-hidden bg-[#f8faf9] rounded-3xl p-8 border border-saaid-g2/15 hover:-translate-y-1.5 hover:shadow-[0_16px_50px_rgba(26,92,58,0.12)] transition-all group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[100%] bg-saaid-g5/50 group-hover:opacity-100 opacity-60 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-saaid-g2 text-white flex items-center justify-center text-2xl mb-5">{s.icon}</div>
                <h3 className="text-lg font-bold text-saaid-td mb-3">{s.title}</h3>
                <p className="text-sm text-saaid-tl leading-loose">{s.desc}</p>
                <ul className="list-none mt-4 flex flex-col gap-1.5">
                  {s.items.map((it) => (
                    <li key={it} className="text-sm text-saaid-tm flex gap-2">
                      <span className="text-saaid-g4 font-bold">✓</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* AI Platform Card */}
        <div className="mt-12 relative overflow-hidden rounded-[28px] p-8 md:p-12 bg-gradient-to-br from-[#0d3322] via-saaid-g2 to-saaid-g3">
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-saaid-gold/[0.06] pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-white/[0.03] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-saaid-gold/15 border border-saaid-gold/30 text-saaid-gold rounded-full px-4 py-1.5 text-sm font-semibold mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-saaid-gold animate-pulse" />
              مدعوم بالذكاء الاصطناعي — حصريًا لعملاء ساعِد
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-3xl font-extrabold text-white leading-tight mb-4">
                  منصة ساعِد الذكية<br />
                  <span className="text-saaid-gold">لإدارة التسويق الخيري</span>
                </h3>
                <p className="text-white/65 leading-loose mb-6">
                  منصة متكاملة تجمع كل أدوات إدارة محتواك الخيري في مكان واحد — من توليد المحتوى والصور والفيديوهات بالذكاء الاصطناعي،
                  إلى تتبع الحملات وقياس الأثر.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {AI_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 hover:border-saaid-gold/35 transition-all">
                      <span className="text-base">{f.icon}</span>
                      <span className="text-xs text-white/80 font-medium">{f.text}</span>
                    </div>
                  ))}
                </div>
                <Link to="/gate" className="inline-flex items-center gap-2 bg-[#25d366] text-white px-7 py-3 rounded-full font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(37,211,102,0.45)] transition-all">
                  جرّب المنصة ←
                </Link>
              </div>

              {/* Dashboard Mock */}
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-black/20 px-4 py-2.5 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd44]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/70" />
                  </div>
                  <span className="text-xs text-white/50">saaid.dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3">
                  {[
                    { n: "+128", l: "منشور هذا الشهر", gold: true },
                    { n: "47K", l: "وصول" },
                    { n: "+12%", l: "نمو" },
                  ].map((s) => (
                    <div key={s.l} className={"rounded-xl p-2.5 text-center " + (s.gold ? "bg-saaid-gold/10 border border-saaid-gold/20" : "bg-white/5")}>
                      <div className={"text-sm font-bold " + (s.gold ? "text-saaid-gold" : "text-white")}>{s.n}</div>
                      <div className="text-[0.6rem] text-white/40 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[0.6rem] bg-saaid-gold/20 text-saaid-gold px-1.5 py-0.5 rounded">AI</span>
                      <span className="text-xs text-white/70 font-semibold">محتوى مقترح</span>
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="h-1.5 rounded bg-white/10 w-full" />
                      <div className="h-1.5 rounded bg-white/10 w-3/4" />
                      <div className="h-1.5 rounded bg-white/10 w-1/2" />
                    </div>
                    <div className="text-[0.65rem] bg-saaid-gold/20 text-saaid-gold rounded px-2 py-0.5 text-center">توليد ✨</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="text-xs text-white/70 font-semibold mb-2">المهام</div>
                    <div className="text-[0.65rem] text-saaid-g4/80">✓ تصميم بوست</div>
                    <div className="text-[0.65rem] text-amber-300/80">◷ فيديو جديد</div>
                    <div className="text-[0.65rem] text-white/35">○ جدولة الحملة</div>
                  </div>
                </div>
                <div className="flex items-end gap-1 px-3 pb-3 h-16">
                  {[55, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className={"flex-1 rounded-t " + (h === 90 ? "bg-saaid-gold/50" : "bg-white/10")} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-24 px-6 md:px-16 bg-saaid-g2">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionTag dark>منهجيتنا</SectionTag>
          <SectionTitle dark>كيف نعمل؟</SectionTitle>
          <SectionDesc dark center>خمس خطوات منهجية نضمن بها أقصى أثر ممكن لكل جمعية نعمل معها</SectionDesc>
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="hidden md:block absolute top-7 inset-x-[10%] h-0.5 bg-white/10" />
          {STEPS.map((s) => (
            <div key={s.n} className="text-center relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-white/[0.08] border-2 border-white/15 text-white text-xl font-extrabold flex items-center justify-center mx-auto mb-4 group-hover:bg-saaid-gold group-hover:border-saaid-gold group-hover:text-saaid-g2 transition-all">
                {s.n}
              </div>
              <h4 className="text-white font-semibold mb-1">{s.title}</h4>
              <p className="text-xs text-white/50 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="py-24 px-6 md:px-16 bg-[#f8faf9]">
        <SectionTag>تميّزنا</SectionTag>
        <SectionTitle>لماذا ساعِد؟</SectionTitle>
        <SectionDesc>ما يميّزنا عن غيرنا من الوكالات والمقدمين</SectionDesc>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {WHY.map((w) => (
            <div key={w.title} className="flex gap-4 p-6 bg-white rounded-2xl border border-saaid-g2/15 hover:shadow-[0_8px_30px_rgba(26,92,58,0.08)] hover:-translate-x-1 transition-all">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-saaid-g5 text-saaid-g2 flex items-center justify-center text-xl">{w.icon}</div>
              <div>
                <h4 className="font-bold text-saaid-td mb-1">{w.title}</h4>
                <p className="text-sm text-saaid-tl leading-loose">{w.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="py-24 px-6 md:px-16 bg-white">
        {/* big numbers strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gradient-to-br from-[#0d3322] to-saaid-g2 rounded-3xl p-8 md:p-12 mb-16">
          {[
            { v: "10", suffix: "+", l: "جمعية تحت إدارتنا في المملكة" },
            { v: "+2", unit: "مليون ريال", l: "تمويلات محققة لجمعياتنا الشريكة" },
            { v: "10,000", unit: "ريال", l: "تبرعات مجمّعة عبر حملاتنا الرقمية" },
            { v: "6", suffix: "+", l: "خدمات إعلامية متكاملة تحت سقف واحد" },
          ].map((b, i) => (
            <div key={i} className="text-center">
              <div className="text-saaid-gold font-black leading-none">
                <span className="text-5xl md:text-6xl">{b.v}</span>
                {b.suffix && <span className="text-3xl align-super">{b.suffix}</span>}
              </div>
              {b.unit && <div className="text-sm text-white/50 font-semibold mt-1">{b.unit}</div>}
              <div className="text-xs text-white/55 mt-2 leading-relaxed">{b.l}</div>
            </div>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionTag>الأثر الذي نصنعه</SectionTag>
          <SectionTitle>ماذا يعني العمل معنا؟</SectionTitle>
          <SectionDesc center>نتائج ملموسة تنعكس على رسالة جمعيتكم ومجتمعكم</SectionDesc>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {IMPACT.map((i) => (
            <div key={i.label} className="text-center p-8 rounded-3xl border border-saaid-g2/15 bg-[#f8faf9] hover:bg-saaid-g2 transition-all group">
              <div className="w-14 h-14 rounded-full bg-saaid-g5 text-saaid-g2 group-hover:bg-white/10 group-hover:text-white flex items-center justify-center text-2xl mx-auto mb-4 transition-all">
                {i.icon}
              </div>
              <div className="font-bold text-saaid-td group-hover:text-saaid-gold mb-2 transition-all">{i.num}</div>
              <div className="text-sm text-saaid-tl group-hover:text-white/65 transition-all">{i.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TARGET */}
      <section id="target" className="py-24 px-6 md:px-16 bg-[#f8faf9]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionTag>الفئة المستهدفة</SectionTag>
          <SectionTitle>لمن نقدم خدماتنا؟</SectionTitle>
          <SectionDesc center>نختص في العمل مع جهات العمل الخيري والإنساني</SectionDesc>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TARGETS.map((t) => (
            <div key={t.label} className="flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border-2 border-saaid-g2/15 hover:border-saaid-g3 hover:bg-saaid-g5 transition-all">
              <span className="text-3xl flex-shrink-0">{t.icon}</span>
              <h4 className="font-semibold text-saaid-td">{t.label}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative py-24 px-6 md:px-16 overflow-hidden text-center bg-gradient-to-br from-[#0d3322] to-saaid-g2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,168,76,0.08)_0%,transparent_60%),radial-gradient(circle_at_70%_50%,rgba(74,158,112,0.1)_0%,transparent_60%)]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <SectionTag dark>دعوة للتعاون</SectionTag>
          <SectionTitle dark>معًا… نُظهر الخير<br />ونُضاعف أثره</SectionTitle>
          <SectionDesc dark center>
            في ساعِد لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة
            أثر حقيقي يصل للناس ويغيّر حياتهم
          </SectionDesc>
          <div className="flex flex-wrap gap-3 justify-center mt-10">
            <a href="https://wa.me/201019268509" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25d366] text-white px-7 py-3 rounded-full font-bold hover:-translate-y-0.5 transition-all">
              <WhatsAppIcon className="w-5 h-5" /> تواصل عبر واتساب
            </a>
            <a href="https://drive.google.com/file/d/1Woa17q3C2o4_HGd3zdTAVoVzp2NjjeNh/view" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/30 rounded-full px-7 py-3 font-semibold hover:border-white hover:bg-white/10 transition-all">
              📄 الملف التعريفي
            </a>
            <a href="https://www.thebrightstation.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/30 rounded-full px-7 py-3 font-semibold hover:border-white hover:bg-white/10 transition-all">
              The Bright Station
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a2518] text-white/50 px-6 md:px-16 pt-12 pb-8 border-t border-white/5">
        <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-12 mb-8">
          <div>
            <h3 className="text-white text-xl font-extrabold mb-3">ساعِد — SAAID</h3>
            <p className="text-sm leading-loose">مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية. نحوّل رسالتك الإنسانية إلى أثر مجتمعي حقيقي.</p>
            <p className="mt-3 text-sm">مبادرة من <a href="https://www.thebrightstation.com" target="_blank" rel="noreferrer" className="text-saaid-gold">The Bright Station</a> للإعلان والتسويق</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="list-none flex flex-col gap-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.id}><a href={`#${l.id}`} className="text-white/50 hover:text-saaid-gold transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <ul className="list-none flex flex-col gap-2 text-sm">
              <li><a href="mailto:info@saaid-platform.com" className="text-white/50 hover:text-saaid-gold transition-colors">info@saaid-platform.com</a></li>
              <li><a href="https://www.thebrightstation.com" target="_blank" rel="noreferrer" className="text-white/50 hover:text-saaid-gold transition-colors">The Bright Station</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
          <span>© 2025 ساعِد — جميع الحقوق محفوظة</span>
          <span>مبادرة من <a href="https://www.thebrightstation.com" target="_blank" rel="noreferrer" className="text-saaid-gold">The Bright Station</a></span>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/201019268509" target="_blank" rel="noreferrer"
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-[#25d366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] z-50 hover:scale-110 transition-transform animate-[bounce-soft_3s_ease-in-out_infinite]"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7 text-white" />
      </a>

      {/* keyframes */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes bounce-soft { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
