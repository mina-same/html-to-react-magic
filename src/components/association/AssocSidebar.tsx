import saaidLogo from "@/assets/saaid-logo.png";
import type { PageId } from "./types";

const NAV: {
  section: string;
  items: { id: PageId; icon: string; label: string; badge?: string; badgeColor?: string }[];
}[] = [
  {
    section: "الرئيسية",
    items: [
      { id: "overview", icon: "⊞", label: "نظرة عامة" },
      { id: "profile", icon: "📋", label: "ملف الجمعية", badge: "AI", badgeColor: "green" },
    ],
  },
  {
    section: "الإدارة",
    items: [
      { id: "team", icon: "👥", label: "الفريق" },
      { id: "tasks", icon: "✅", label: "المهام", badgeColor: "red" },
      { id: "donations", icon: "💳", label: "التبرعات" },
    ],
  },
  {
    section: "المحتوى",
    items: [
      { id: "content", icon: "✦", label: "محتوى تسويقي" },
      { id: "campaigns", icon: "📣", label: "الحملات" },
      { id: "influencers", icon: "⭐", label: "المؤثرون" },
    ],
  },
  {
    section: "الخدمات",
    items: [
      { id: "services", icon: "🛎", label: "خدماتنا" },
      { id: "analytics", icon: "📊", label: "التحليلات" },
    ],
  },
  {
    section: "الإعدادات",
    items: [{ id: "settings", icon: "⚙", label: "الإعدادات" }],
  },
];

interface Props {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  assocName: string;
  assocInitial: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  tasksCount?: number;
}

export default function AssocSidebar({
  activePage,
  onNavigate,
  assocName,
  assocInitial,
  onLogout,
  isOpen,
  onClose,
  tasksCount = 0,
}: Props) {
  const sidebar = (
    <aside
      style={{
        width: 260,
        height: "100dvh",
        background: "#1a5c3a",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          bottom: -50,
          right: -50,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(201,168,76,.06)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          padding: "14px 16px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <img
          src={saaidLogo}
          alt="ساعِد"
          style={{ width: 42, height: "auto", filter: "brightness(0) invert(1)" }}
        />
        <div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "white", lineHeight: 1 }}>
            ساعِد
          </div>
          <div
            style={{
              fontSize: ".56rem",
              color: "rgba(255,255,255,.38)",
              letterSpacing: 2,
              marginTop: 2,
            }}
          >
            SAAID PLATFORM
          </div>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="md:hidden"
          style={{
            marginRight: "auto",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,.5)",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Assoc identity */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,.07)",
          background: "rgba(255,255,255,.04)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "linear-gradient(135deg,#c9a84c,#e8c96e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: ".82rem",
            fontWeight: 700,
            color: "#1a5c3a",
            flexShrink: 0,
          }}
        >
          {assocInitial}
        </div>
        <div>
          <div style={{ fontSize: ".85rem", fontWeight: 700, color: "white", lineHeight: 1.3 }}>
            {assocName || "اسم الجمعية"}
          </div>
          <span
            style={{
              fontSize: ".63rem",
              color: "rgba(255,255,255,.4)",
              background: "rgba(255,255,255,.08)",
              padding: "2px 7px",
              borderRadius: 20,
              display: "inline-block",
              marginTop: 3,
            }}
          >
            جمعية خيرية
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}>
        {NAV.map((group) => (
          <div key={group.section}>
            <div
              style={{
                fontSize: ".6rem",
                fontWeight: 600,
                letterSpacing: ".12em",
                color: "rgba(255,255,255,.26)",
                padding: "10px 8px 4px",
                textTransform: "uppercase",
              }}
            >
              {group.section}
            </div>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 10px",
                  borderRadius: 7,
                  marginBottom: 1,
                  width: "100%",
                  border: "none",
                  background: activePage === item.id ? "rgba(255,255,255,.13)" : "transparent",
                  color: activePage === item.id ? "white" : "rgba(255,255,255,.6)",
                  fontSize: ".86rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                  textAlign: "right",
                  transition: "all .17s",
                }}
              >
                <span
                  style={{
                    fontSize: ".95rem",
                    width: 17,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: activePage === item.id ? "#c9a84c" : undefined,
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
                {(item.badge || (item.id === "tasks" && tasksCount > 0)) && (
                  <span
                    style={{
                      marginRight: "auto",
                      fontSize: ".6rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 20,
                      background:
                        item.badgeColor === "green"
                          ? "rgba(74,158,112,.25)"
                          : item.badgeColor === "red"
                            ? "rgba(220,38,38,.2)"
                            : "#c9a84c",
                      color:
                        item.badgeColor === "green"
                          ? "#7dcea0"
                          : item.badgeColor === "red"
                            ? "#ef4444"
                            : "#1a5c3a",
                    }}
                  >
                    {item.id === "tasks" && tasksCount > 0 ? tasksCount : item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: 8, borderTop: "1px solid rgba(255,255,255,.07)" }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 10px",
            borderRadius: 7,
            width: "100%",
            border: "none",
            background: "transparent",
            color: "rgba(255,100,100,.5)",
            fontSize: ".83rem",
            cursor: "pointer",
            fontFamily: "'Tajawal','Cairo',sans-serif",
            textAlign: "right",
          }}
        >
          <span style={{ fontSize: ".95rem", width: 17 }}>⬡</span>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex">{sidebar}</div>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="relative z-10">{sidebar}</div>
        </div>
      )}
    </>
  );
}
