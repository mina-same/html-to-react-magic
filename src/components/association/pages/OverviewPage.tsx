import type { PageId } from "../types";

interface Props {
  assocName: string;
  statContent: number;
  onNavigate: (page: PageId) => void;
}

const card: React.CSSProperties = { background: "white", borderRadius: 11, border: "1px solid rgba(45,122,82,.12)", padding: "13px 15px" };

export default function OverviewPage({ assocName, statContent, onNavigate }: Props) {
  return (
    <div>
      {/* Welcome banner */}
      <div style={{ background: "linear-gradient(135deg,#1a5c3a 0%,#2d7a52 60%,#4a9e70 100%)", borderRadius: 14, padding: "20px 24px", marginBottom: 18, display: "flex", alignItems: "center", gap: 18, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
        <div style={{ position: "absolute", left: -30, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>🏛️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.58)", marginBottom: 2 }}>مرحباً بكم في منصة ساعِد</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: 3 }}>{assocName ? `أهلاً، ${assocName}` : "أهلاً بجمعيتكم الكريمة"}</div>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.52)" }}>ارفعوا ملف الجمعية لبدء توليد المحتوى التسويقي بالذكاء الاصطناعي</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", padding: "5px 13px", borderRadius: 20, flexShrink: 0 }}>
          <span style={{ width: 7, height: 7, background: "#7dcea0", borderRadius: "50%", animation: "pulse 2s infinite", display: "inline-block" }} />
          <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.75)", fontWeight: 600 }}>متصل</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { num: "—",           label: "متابع على المنصات",   sub: "+ ابدأ بتفعيل حسابك", subColor: "#059669" },
          { num: "—",           label: "تبرعات هذا الشهر",    sub: "+ ابدأ حملتك الأولى", subColor: "#059669" },
          { num: statContent,   label: "قطعة محتوى مُنتجة",  sub: "+ ارفع الملف التعريفي", subColor: "#059669" },
          { num: "5",           label: "خدمات متاحة لك",      sub: "✓ جاهزة للتفعيل",      subColor: "#2d7a52" },
        ].map((s, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1a5c3a", lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: ".73rem", color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: ".7rem", fontWeight: 600, color: s.subColor, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", marginBottom: 18, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", color: "#2d7a52" }}>🚀</div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>ابدأ هنا</div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>ارفع ملف جمعيتك التعريفي ليحلله الذكاء الاصطناعي</div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon:"📋", title:"رفع الملف التعريفي",    desc:"PDF أو Word — يحلله AI فوراً",         bg:"#e8f5ee", titleColor:"#1a5c3a", border:"rgba(45,122,82,.12)", page:"profile" as PageId },
              { icon:"🛎", title:"استعرض خدماتنا",        desc:"5 خدمات متكاملة للجمعيات",             bg:"#fff8f0", titleColor:"#92400e", border:"rgba(201,168,76,.15)", page:"services" as PageId },
              { icon:"📣", title:"ابدأ حملة",             desc:"حملات رمضان، التبرع، التوعية",         bg:"#f0f4ff", titleColor:"#3730a3", border:"rgba(99,102,241,.12)", page:"campaigns" as PageId },
            ].map((action) => (
              <button key={action.page} onClick={() => onNavigate(action.page)}
                style={{ flex: 1, background: action.bg, borderRadius: 10, padding: 16, cursor: "pointer", border: `1px solid ${action.border}`, textAlign: "right", fontFamily: "'Tajawal','Cairo',sans-serif", transition: "all .2s" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{action.icon}</div>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: action.titleColor, marginBottom: 3 }}>{action.title}</div>
                <div style={{ fontSize: ".78rem", color: "#6b7280" }}>{action.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
