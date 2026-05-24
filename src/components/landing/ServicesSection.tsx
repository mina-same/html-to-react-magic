import { WhatsAppIcon } from "./WhatsAppIcon";

const SERVICES = [
  {
    icon: "📱", title: "الظهور الإعلامي وبناء الهوية",
    desc: "نبني هويتك الإعلامية بالكامل ونديرها باحترافية",
    items: ["إدارة الحسابات على منصات التواصل الاجتماعي","بناء الهوية الإعلامية واللغة البصرية","توحيد الرسائل والمحتوى مع أهداف الجمعية"],
  },
  {
    icon: "🎬", title: "صناعة المحتوى المؤثر",
    desc: "محتوى يحرّك القلوب ويدفع نحو التبرع والمشاركة",
    items: ["محتوى قصصي إنساني Storytelling","فيديوهات توعوية وتعريفية بالمشاريع","تغطيات ميدانية للمبادرات والأنشطة","محتوى تفاعلي يزيد من الانتشار"],
  },
  {
    icon: "📊", title: "تصميم التقارير والملفات التعريفية",
    desc: "نحوّل بياناتك إلى محتوى بصري واضح ومؤثر",
    items: ["تصميم الملف التعريفي الرسمي","إعداد تقارير المشاريع","تحويل التقارير إلى موشن جرافيك"],
  },
  {
    icon: "🚀", title: "الحملات الإعلامية وجمع التبرعات",
    desc: "حملات رقمية مدروسة ترفع معدلات التبرع",
    items: ["حملات موسمية: رمضان، الحج، الأعياد","صفحات هبوط مخصصة للحملات","تحسين الرسائل التحفيزية للتبرع"],
  },
  {
    icon: "🌟", title: "إدارة المؤثرين والشراكات",
    desc: "نربطك بالمؤثرين المناسبين لرسالتك",
    items: ["ربط الجمعيات بالمؤثرين المناسبين","إدارة حملات المؤثرين باحترافية","توثيق الشراكات الإعلامية"],
  },
  {
    icon: "📰", title: "التغطية الإعلامية والمناسبات",
    desc: "نبرز إنجازات جمعيتك في كل مناسبة",
    items: ["تغطية الفعاليات والملتقيات الخيرية","إدارة الحضور الإعلامي للمناسبات","إبراز إنجازات الجمعية إعلاميًا"],
  },
];

const AI_FEATURES = [
  { icon: "🤖", label: "توليد محتوى بالذكاء الاصطناعي" },
  { icon: "🖼️", label: "توليد صور احترافية" },
  { icon: "🎬", label: "إنتاج فيديوهات تلقائية" },
  { icon: "✅", label: "إدارة المهام والتاسكات" },
  { icon: "📈", label: "داشبورد تتبع وتحليل" },
  { icon: "📅", label: "جدولة ونشر تلقائي" },
  { icon: "🔔", label: "تتبع الأداء لحظة بلحظة" },
  { icon: "🤝", label: "تعاون الفريق بالكامل" },
];

const BAR_HEIGHTS = ["55%","70%","45%","90%","65%","80%","50%"];

export function ServicesSection() {
  return (
    <section id="services" style={{ background: "white" }} className="px-6 md:px-16 py-20 md:py-24">
      {/* Header */}
      <div className="fade-up text-center mx-auto mb-12" style={{ maxWidth: 700 }}>
        <span style={{ display: "inline-block", background: "#e8f5ee", color: "#1a5c3a", padding: "0.35rem 1rem", borderRadius: 50, fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>خدماتنا</span>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>ماذا نقدم؟</h2>
        <p style={{ fontSize: "1.05rem", color: "#6b7280", lineHeight: 1.9, margin: "0 auto" }}>خمس خدمات متكاملة تغطي كل احتياجات الجمعية الخيرية الإعلامية</p>
      </div>

      {/* Grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {SERVICES.map(svc => (
          <div key={svc.title} className="fade-up"
            style={{ background: "#f8faf9", borderRadius: 24, padding: "2rem", border: "1px solid rgba(45,122,82,0.15)", position: "relative", overflow: "hidden", transition: "all 0.3s" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, borderRadius: "0 24px 0 100%", background: "#e8f5ee", opacity: 0.5, pointerEvents: "none" }} />
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#1a5c3a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.25rem", position: "relative", zIndex: 1 }}>{svc.icon}</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.75rem", position: "relative", zIndex: 1 }}>{svc.title}</h3>
            <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.8, margin: 0, position: "relative", zIndex: 1 }}>{svc.desc}</p>
            <ul style={{ listStyle: "none", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem", position: "relative", zIndex: 1, padding: 0 }}>
              {svc.items.map(item => (
                <li key={item} style={{ fontSize: "0.85rem", color: "#3a3a5c", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                  <span style={{ color: "#4a9e70", fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* AI Platform Card */}
      <div className="fade-up mt-12" style={{ borderRadius: 28, background: "linear-gradient(135deg,#0d3322 0%,#1a5c3a 60%,#2d7a52 100%)", padding: "3rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-4rem", left: "-4rem", width: "20rem", height: "20rem", borderRadius: "50%", background: "rgba(201,168,76,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-4rem", right: "-4rem", width: "24rem", height: "24rem", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", padding: "0.4rem 1.1rem", borderRadius: 50, fontSize: "0.85rem", fontWeight: 600, marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c9a84c", display: "inline-block", animation: "pulse 2s infinite" }} />
          مدعوم بالذكاء الاصطناعي — حصريًا لعملاء ساعِد
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center" style={{ position: "relative", zIndex: 1 }}>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1.25, marginBottom: "1rem" }}>
              منصة ساعِد الذكية<br /><span style={{ color: "#c9a84c" }}>لإدارة التسويق الخيري</span>
            </h3>
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.9, marginBottom: "1.75rem" }}>
              منصة متكاملة تجمع كل أدوات إدارة محتواك الخيري في مكان واحد — من توليد المحتوى والصور والفيديوهات بالذكاء الاصطناعي، إلى تتبع المهام والداشبورد التحليلي الكامل.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {AI_FEATURES.map(feat => (
                <div key={feat.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "0.55rem 0.8rem" }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>{feat.icon}</span>
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{feat.label}</span>
                </div>
              ))}
            </div>
            <a href="https://wa.me/201019268509" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "#25d366", color: "white", padding: "0.85rem 2rem", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: "0.95rem" }}>
              <WhatsAppIcon size={18} />احصل على وصول مبكر
            </a>
          </div>

          {/* Dashboard mock */}
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["rgba(255,95,87,0.7)","rgba(255,189,68,0.7)","rgba(40,200,64,0.7)"].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />)}
              </div>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>منصة ساعِد — لوحة التحكم</span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              {[{v:"١٢٤",l:"منشور هذا الشهر",gold:false},{v:"٣٨ ألف",l:"وصول إجمالي",gold:true},{v:"٨٩٪",l:"نسبة الإنجاز",gold:false}].map(s => (
                <div key={s.l} style={{ background: s.gold ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.05)", border: s.gold ? "1px solid rgba(201,168,76,0.2)" : "none", borderRadius: 10, padding: "0.6rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: s.gold ? "#c9a84c" : "white" }}>{s.v}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-1">
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.7rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.6rem", background: "rgba(201,168,76,0.2)", color: "#c9a84c", padding: "2px 6px", borderRadius: 6 }}>🤖 AI</span>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>توليد محتوى</span>
                </div>
                {["100%","75%","50%"].map((w, i) => <div key={i} style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", width: w, marginBottom: 4 }} />)}
                <div style={{ fontSize: "0.65rem", background: "rgba(201,168,76,0.2)", color: "#c9a84c", borderRadius: 6, padding: "3px 8px", textAlign: "center", marginTop: 4 }}>توليد الآن ✨</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.7rem" }}>
                <div style={{ marginBottom: "0.5rem" }}><span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>المهام النشطة</span></div>
                {[{t:"✓ تصميم بوست رمضان",c:"rgba(74,200,120,0.8)"},{t:"✓ فيديو حملة التبرع",c:"rgba(74,200,120,0.8)"},{t:"⟳ تقرير الأداء الأسبوعي",c:"rgba(255,200,60,0.8)"},{t:"◯ محتوى يوم الوطني",c:"rgba(255,255,255,0.35)"}].map((r, i) => (
                  <div key={i} style={{ fontSize: "0.65rem", padding: "3px 0", color: r.c }}>{r.t}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, padding: "0.75rem", height: 70 }}>
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", background: h === "90%" ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)", height: h }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
