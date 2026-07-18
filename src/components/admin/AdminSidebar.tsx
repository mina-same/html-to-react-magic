import { useAuth } from "@/hooks/useAuth";
import saaidLogo from "../../assets/saaid-logo.png";
import type { Org, Influencer, CampaignRequest, PageId } from "./types";

interface AdminSidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  orgs: Org[];
  influencers: Influencer[];
  requests: CampaignRequest[];
}

export function AdminSidebar({
  activePage,
  setActivePage,
  orgs,
  influencers,
  requests,
}: AdminSidebarProps) {
  const { signOut } = useAuth();

  type NavItem = { id: PageId; icon: string; label: string; badge?: { text: string; cls: string } };
  type NavSection = { label: string; items: NavItem[] };

  const navSections: NavSection[] = [
    {
      label: "الرئيسية",
      items: [{ id: "overview", icon: "⊞", label: "لوحة التحكم" }],
    },
    {
      label: "إدارة",
      items: [
        {
          id: "orgs",
          icon: "🏛",
          label: "الجمعيات",
          badge: { text: String(orgs.filter((o) => o.status === "new").length), cls: "gold" },
        },
        {
          id: "influencers",
          icon: "🌟",
          label: "المؤثرون",
          badge: {
            text: String(influencers.filter((i) => i.status === "active").length),
            cls: "green",
          },
        },
        {
          id: "requests",
          icon: "📋",
          label: "الطلبات",
          badge: {
            text: String(requests.filter((r) => r.status === "pending").length),
            cls: "red",
          },
        },
      ],
    },
    {
      label: "تقارير",
      items: [
        { id: "reports", icon: "📊", label: "التقارير المالية" },
        { id: "settings", icon: "⚙", label: "الإعدادات" },
      ],
    },
  ];

  const navItemStyles = {
    base: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 12px",
      borderRadius: "8px",
      marginBottom: "4px",
      cursor: "pointer",
      transition: "all .15s",
      position: "relative" as const,
      overflow: "hidden",
    },
    active: {
      background: "rgba(255,255,255,.12)",
    },
    hover: {
      background: "rgba(255,255,255,.08)",
    },
    icon: {
      width: "32px",
      height: "32px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      flexShrink: 0,
    },
    label: {
      fontSize: ".85rem",
      fontWeight: 500,
      color: "rgba(255,255,255,.85)",
      flex: 1,
    },
    badge: {
      fontSize: ".72rem",
      padding: "2px 10px",
      borderRadius: "999px",
      fontWeight: 600,
    },
  };

  return (
    <aside
      style={{
        width: "252px",
        minWidth: "252px",
        height: "100dvh",
        background: "#0d3322",
        display: "flex",
        flexDirection: "column" as const,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "14px 16px 12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <img
          src={saaidLogo}
          alt="ساعِد"
          style={{ width: "38px", height: "auto", filter: "brightness(0) invert(1)" }}
        />
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", lineHeight: "1" }}>
            ساعِد
          </div>
          <div
            style={{
              fontSize: ".58rem",
              color: "rgba(255,255,255,.3)",
              letterSpacing: "2px",
              marginTop: "1px",
            }}
          >
            SAAID PLATFORM
          </div>
        </div>
      </div>
      {/* Admin badge */}
      <div
        style={{
          margin: "10px 14px",
          background: "rgba(201,168,76,.15)",
          border: "1px solid rgba(201,168,76,.25)",
          borderRadius: "8px",
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#c9a84c",
            animation: "pulse 2s infinite",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: ".75rem", fontWeight: 600, color: "rgba(201,168,76,.9)" }}>
          لوحة الإدارة
        </span>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto" as const, padding: "6px 8px" }}>
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div
              style={{
                fontSize: ".6rem",
                fontWeight: 600,
                letterSpacing: ".1em",
                color: "rgba(255,255,255,.25)",
                padding: "10px 8px 4px",
                textTransform: "uppercase",
              }}
            >
              {sec.label}
            </div>
            {sec.items.map((item) => (
              <div
                key={item.id}
                style={{
                  ...navItemStyles.base,
                  ...(activePage === item.id ? navItemStyles.active : {}),
                }}
                onClick={() => setActivePage(item.id)}
                onMouseEnter={(e) => {
                  if (activePage !== item.id) {
                    Object.assign(e.currentTarget.style, navItemStyles.hover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePage !== item.id) {
                    Object.assign(e.currentTarget.style, navItemStyles.base);
                  }
                }}
              >
                <div
                  style={{
                    ...navItemStyles.icon,
                    ...(activePage === item.id
                      ? { background: "rgba(45,122,82,.5)" }
                      : { background: "transparent" }),
                  }}
                >
                  {item.icon}
                </div>
                <span style={navItemStyles.label}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      ...navItemStyles.badge,
                      background:
                        item.badge.cls === "gold"
                          ? "rgba(201,168,76,.25)"
                          : item.badge.cls === "green"
                            ? "rgba(45,122,82,.25)"
                            : "rgba(239,68,68,.25)",
                      color:
                        item.badge.cls === "gold"
                          ? "#c9a84c"
                          : item.badge.cls === "green"
                            ? "#2d7a52"
                            : "#ef4444",
                    }}
                  >
                    {item.badge.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>
      {/* Bottom: logout */}
      <div
        style={{
          padding: "12px 14px 16px",
          borderTop: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <button
          onClick={signOut}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 12px",
            borderRadius: "8px",
            background: "transparent",
            border: "1px solid rgba(239,68,68,.25)",
            color: "#fca5a5",
            fontFamily: "'Tajawal',sans-serif",
            fontSize: ".8rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span>↩</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
