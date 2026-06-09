import type { PageId } from "../types";
import type { Task, Employee, Campaign } from "../types";

interface Props {
  assocName: string;
  statContent: number;
  tasks: Task[];
  employees: Employee[];
  campaigns: Campaign[];
  onNavigate: (page: PageId) => void;
}

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 11,
  border: "1px solid rgba(45,122,82,.12)",
  padding: "13px 15px",
};

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "لم يبدأ",
  doing: "جارٍ",
  review: "مراجعة",
  done: "منتهي",
};
const STATUS_COLOR: Record<Task["status"], string> = {
  todo: "#6b7280",
  doing: "#3b82f6",
  review: "#f59e0b",
  done: "#059669",
};
const STATUS_BG: Record<Task["status"], string> = {
  todo: "#f3f4f6",
  doing: "#eff6ff",
  review: "#fffbeb",
  done: "#ecfdf5",
};
const URGENCY_DOT: Record<Task["urgency"], string> = {
  urgent: "#ef4444",
  high: "#f97316",
  normal: "#6b7280",
  low: "#d1d5db",
};

export default function OverviewPage({
  assocName,
  statContent,
  tasks,
  employees,
  campaigns,
  onNavigate,
}: Props) {
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const teamSize = employees.length;

  const recentTasks = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const urgOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return urgOrder[a.urgency] - urgOrder[b.urgency];
    })
    .slice(0, 4);

  return (
    <div>
      {/* Welcome banner */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a5c3a 0%,#2d7a52 60%,#4a9e70 100%)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 18,
          position: "relative",
          overflow: "hidden",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -30,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(255,255,255,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            flexShrink: 0,
          }}
        >
          🏛️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.58)", marginBottom: 2 }}>
            مرحباً بكم في منصة ساعِد
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: 3 }}>
            {assocName ? `أهلاً، ${assocName}` : "أهلاً بجمعيتكم الكريمة"}
          </div>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.52)" }}>
            ارفعوا ملف الجمعية لبدء توليد المحتوى التسويقي بالذكاء الاصطناعي
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.15)",
            padding: "5px 13px",
            borderRadius: 20,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              background: "#7dcea0",
              borderRadius: "50%",
              animation: "pulse 2s infinite",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.75)", fontWeight: 600 }}>
            متصل
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          {
            num: pendingTasks || "—",
            label: "مهام قيد التنفيذ",
            sub: pendingTasks > 0 ? `${tasks.filter((t) => t.status === "done").length} منتهية` : "لا توجد مهام بعد",
            subColor: "#2d7a52",
            accent: "#2d7a52",
          },
          {
            num: teamSize || "—",
            label: "أفراد الفريق",
            sub: teamSize > 0 ? `${employees.filter((e) => e.status === "active").length} نشط` : "+ أضف موظفاً",
            subColor: "#c9a84c",
            accent: "#c9a84c",
          },
          {
            num: statContent || "—",
            label: "محتوى مُنتج",
            sub: statContent > 0 ? "✓ الذكاء الاصطناعي نشط" : "+ ارفع الملف التعريفي",
            subColor: "#3b82f6",
            accent: "#3b82f6",
          },
          {
            num: activeCampaigns || "—",
            label: "حملات نشطة",
            sub: activeCampaigns > 0 ? `${campaigns.length} إجمالي الحملات` : "+ ابدأ حملتك الأولى",
            subColor: "#7c3aed",
            accent: "#7c3aed",
          },
        ].map((s, i) => (
          <div key={i} style={{ ...card, position: "relative", overflow: "hidden", paddingRight: 18 }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 4,
                height: "100%",
                background: s.accent,
              }}
            />
            <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1a5c3a", lineHeight: 1 }}>
              {s.num}
            </div>
            <div style={{ fontSize: ".73rem", color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: ".7rem", fontWeight: 600, color: s.subColor, marginTop: 5 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Recent tasks + Quick actions side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Recent tasks */}
        <div
          style={{
            background: "white",
            borderRadius: 13,
            border: "1px solid rgba(45,122,82,.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "13px 18px",
              borderBottom: "1px solid rgba(45,122,82,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "#e8f5ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".9rem",
                  color: "#2d7a52",
                }}
              >
                ✅
              </div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                المهام الأولى
              </div>
            </div>
            <button
              onClick={() => onNavigate("tasks")}
              style={{
                fontSize: ".73rem",
                color: "#2d7a52",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Tajawal','Cairo',sans-serif",
              }}
            >
              عرض الكل ←
            </button>
          </div>

          <div style={{ padding: "10px 14px" }}>
            {recentTasks.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#9ca3af",
                  fontSize: ".82rem",
                }}
              >
                لا توجد مهام معلقة
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#f9fafb",
                      border: "1px solid rgba(45,122,82,.07)",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: URGENCY_DOT[task.urgency],
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: ".83rem",
                          fontWeight: 600,
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </div>
                      {task.deadline && (
                        <div style={{ fontSize: ".7rem", color: "#9ca3af", marginTop: 2 }}>
                          {task.deadline}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: ".68rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: STATUS_BG[task.status],
                        color: STATUS_COLOR[task.status],
                        flexShrink: 0,
                      }}
                    >
                      {STATUS_LABEL[task.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team snapshot */}
        <div
          style={{
            background: "white",
            borderRadius: 13,
            border: "1px solid rgba(45,122,82,.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "13px 18px",
              borderBottom: "1px solid rgba(45,122,82,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "#fef9c3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".9rem",
                }}
              >
                👥
              </div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                الفريق
              </div>
            </div>
            <button
              onClick={() => onNavigate("team")}
              style={{
                fontSize: ".73rem",
                color: "#2d7a52",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Tajawal','Cairo',sans-serif",
              }}
            >
              إدارة الفريق ←
            </button>
          </div>

          <div style={{ padding: "10px 14px" }}>
            {employees.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#9ca3af",
                  fontSize: ".82rem",
                }}
              >
                لم يُضف أي موظف بعد
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {employees.slice(0, 4).map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: emp.color || "#2d7a52",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: ".85rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {emp.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: ".83rem",
                          fontWeight: 600,
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {emp.name}
                      </div>
                      <div style={{ fontSize: ".7rem", color: "#9ca3af" }}>{emp.role || "—"}</div>
                    </div>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          emp.status === "active"
                            ? "#059669"
                            : emp.status === "away"
                            ? "#f59e0b"
                            : "#9ca3af",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                ))}
                {employees.length > 4 && (
                  <div style={{ fontSize: ".73rem", color: "#9ca3af", textAlign: "center", paddingTop: 4 }}>
                    +{employees.length - 4} آخرون
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div
        style={{
          background: "white",
          borderRadius: 13,
          border: "1px solid rgba(45,122,82,.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(45,122,82,.12)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "#e8f5ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: ".95rem",
              color: "#2d7a52",
            }}
          >
            🚀
          </div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>ابدأ هنا</div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
              ارفع ملف جمعيتك التعريفي ليحلله الذكاء الاصطناعي
            </div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: "📋",
                title: "رفع الملف التعريفي",
                desc: "PDF أو Word — يحلله AI فوراً",
                bg: "#e8f5ee",
                titleColor: "#1a5c3a",
                border: "rgba(45,122,82,.12)",
                page: "profile" as PageId,
              },
              {
                icon: "🛎",
                title: "استعرض خدماتنا",
                desc: "5 خدمات متكاملة للجمعيات",
                bg: "#fff8f0",
                titleColor: "#92400e",
                border: "rgba(201,168,76,.15)",
                page: "services" as PageId,
              },
              {
                icon: "📣",
                title: "ابدأ حملة",
                desc: "حملات رمضان، التبرع، التوعية",
                bg: "#f0f4ff",
                titleColor: "#3730a3",
                border: "rgba(99,102,241,.12)",
                page: "campaigns" as PageId,
              },
            ].map((action) => (
              <button
                key={action.page}
                onClick={() => onNavigate(action.page)}
                style={{
                  flex: 1,
                  background: action.bg,
                  borderRadius: 10,
                  padding: 16,
                  cursor: "pointer",
                  border: `1px solid ${action.border}`,
                  textAlign: "right",
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                  transition: "all .2s",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{action.icon}</div>
                <div
                  style={{
                    fontSize: ".88rem",
                    fontWeight: 700,
                    color: action.titleColor,
                    marginBottom: 3,
                  }}
                >
                  {action.title}
                </div>
                <div style={{ fontSize: ".78rem", color: "#6b7280" }}>{action.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
