import type { Service, PageId } from "../types";
import { SERVICES } from "../data";

interface Props {
  onNavigate: (page: PageId) => void;
}

const SERVICE_BG: Record<string, string> = {
  profile:   "#e8f5ee",
  content:   "#f0f4ff",
  campaigns: "#fff8f0",
  analytics: "#fef3f2",
  team:      "#f8f0ff",
};

const SERVICE_BORDER: Record<string, string> = {
  profile:   "rgba(45,122,82,.15)",
  content:   "rgba(99,102,241,.12)",
  campaigns: "rgba(201,168,76,.15)",
  analytics: "rgba(239,68,68,.1)",
  team:      "rgba(139,92,246,.12)",
};

const SERVICE_TITLE_COLOR: Record<string, string> = {
  profile:   "#1a5c3a",
  content:   "#3730a3",
  campaigns: "#92400e",
  analytics: "#991b1b",
  team:      "#5b21b6",
};

export default function ServicesPage({ onNavigate }: Props) {
  return (
    <div>
      {/* Header card */}
      <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", marginBottom: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>🛎</div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>خدماتنا</div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>اختر الخدمات المناسبة لجمعيتك</div>
          </div>
        </div>
        <div style={{ padding: "12px 18px" }}>
          <div style={{ fontSize: ".82rem", color: "#374151", lineHeight: 1.7 }}>
            منصة <strong>ساعِد</strong> توفر مجموعة متكاملة من الخدمات المصممة خصيصاً للجمعيات الخيرية، من توليد المحتوى بالذكاء الاصطناعي إلى إدارة الحملات والمؤثرين.
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((svc: Service) => (
          <button key={svc.id}
            onClick={() => onNavigate(svc.id as PageId)}
            style={{
              background: SERVICE_BG[svc.id] ?? "#f9fafb",
              borderRadius: 12,
              border: `1px solid ${SERVICE_BORDER[svc.id] ?? "rgba(0,0,0,.08)"}`,
              padding: 20,
              textAlign: "right",
              cursor: "pointer",
              fontFamily: "'Tajawal','Cairo',sans-serif",
              transition: "all .2s",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(0,0,0,.08)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
            }}>
            <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>{svc.icon}</div>
            <div style={{ fontSize: ".9rem", fontWeight: 700, color: SERVICE_TITLE_COLOR[svc.id] ?? "#111827" }}>{svc.title}</div>
            <div style={{ fontSize: ".78rem", color: "#6b7280", lineHeight: 1.55, flex: 1 }}>{svc.desc}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,.06)" }}>
              <span style={{ fontSize: ".78rem", fontWeight: 700, color: SERVICE_TITLE_COLOR[svc.id] ?? "#1a5c3a" }}>{svc.price}</span>
              <span style={{ fontSize: ".7rem", color: "#9ca3af" }}>اضغط للتفعيل ←</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
