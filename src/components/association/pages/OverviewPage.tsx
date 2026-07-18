import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { PageId } from "../types";
import type { Task, Employee, Campaign, Donation } from "../types";

interface Props {
  assocName: string;
  statContent: number;
  tasks: Task[];
  employees: Employee[];
  campaigns: Campaign[];
  donations: Donation[];
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
const CHANNEL_ICON: Record<string, string> = {
  شيك: "🏦",
  تحويل: "↔️",
  "STC Pay": "📱",
  بطاقة: "💳",
  "Apple Pay": "🍎",
  نقد: "💵",
};

function getDonationMonth(date: string) {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : `${d.getFullYear()}-${d.getMonth()}`;
}

export default function OverviewPage({
  assocName,
  statContent,
  tasks,
  employees,
  campaigns,
  donations,
  onNavigate,
}: Props) {
  const now = new Date();
  const nowMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  // Task stats
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  // Team stats
  const teamSize = employees.length;
  const activeCount = employees.filter((e) => e.status === "active").length;

  // Campaign stats
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  // Donation stats
  const thisMonthDonations = donations.filter((d) => getDonationMonth(d.date) === nowMonthKey);
  const totalThisMonth = thisMonthDonations.reduce((s, d) => s + d.amount, 0);
  const totalCollected = donations
    .filter((d) => d.status === "completed")
    .reduce((s, d) => s + d.amount, 0);
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const lastMonthDonations = donations.filter((d) => {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const key = `${lm.getFullYear()}-${lm.getMonth()}`;
    return getDonationMonth(d.date) === key;
  });
  const lastMonthTotal = lastMonthDonations.reduce((s, d) => s + d.amount, 0);
  const donationTrend =
    lastMonthTotal > 0 ? Math.round(((totalThisMonth - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  const recentTasks = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const urgOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return urgOrder[a.urgency] - urgOrder[b.urgency];
    })
    .slice(0, 4);

  // Chart: last 6 months donations
  const ARABIC_MONTHS = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const donationChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const total = donations
      .filter((dn) => getDonationMonth(dn.date) === key && dn.status === "completed")
      .reduce((s, dn) => s + dn.amount, 0);
    return { month: ARABIC_MONTHS[d.getMonth()], total };
  });

  // Chart: tasks by status
  const taskStatusData = [
    { name: "لم يبدأ", value: tasks.filter((t) => t.status === "todo").length, color: "#9ca3af" },
    { name: "جارٍ", value: tasks.filter((t) => t.status === "doing").length, color: "#3b82f6" },
    { name: "مراجعة", value: tasks.filter((t) => t.status === "review").length, color: "#f59e0b" },
    { name: "منتهي", value: tasks.filter((t) => t.status === "done").length, color: "#059669" },
  ].filter((d) => d.value > 0);

  const recentDonations = [...donations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

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

      {/* ── KPI stats row ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          {
            num: pendingTasks || "—",
            label: "مهام قيد التنفيذ",
            sub: pendingTasks > 0 ? `${doneTasks} منتهية` : "لا توجد مهام بعد",
            subColor: "#2d7a52",
            accent: "#2d7a52",
            icon: "✅",
            page: "tasks" as PageId,
          },
          {
            num: teamSize || "—",
            label: "أفراد الفريق",
            sub: teamSize > 0 ? `${activeCount} نشط` : "+ أضف موظفاً",
            subColor: "#c9a84c",
            accent: "#c9a84c",
            icon: "👥",
            page: "team" as PageId,
          },
          {
            num: totalThisMonth > 0 ? totalThisMonth.toLocaleString() + " ر.س" : "—",
            label: "تبرعات هذا الشهر",
            sub:
              totalThisMonth > 0
                ? donationTrend !== 0
                  ? `${donationTrend > 0 ? "▲" : "▼"} ${Math.abs(donationTrend)}% عن الشهر الماضي`
                  : `${thisMonthDonations.length} تبرع`
                : "+ سجّل تبرعاتك",
            subColor: totalThisMonth > 0 && donationTrend >= 0 ? "#059669" : "#ef4444",
            accent: "#3b82f6",
            icon: "💳",
            page: "donations" as PageId,
          },
          {
            num: activeCampaigns || "—",
            label: "حملات نشطة",
            sub: activeCampaigns > 0 ? `${campaigns.length} إجمالي الحملات` : "+ ابدأ حملتك الأولى",
            subColor: "#7c3aed",
            accent: "#7c3aed",
            icon: "📣",
            page: "campaigns" as PageId,
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => onNavigate(s.page)}
            style={{
              ...card,
              position: "relative",
              overflow: "hidden",
              paddingRight: 18,
              textAlign: "right",
              cursor: "pointer",
              transition: "box-shadow .15s",
              fontFamily: "'Tajawal','Cairo',sans-serif",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(45,122,82,.12)")
            }
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
          >
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
            <div
              style={{
                fontSize: ".75rem",
                marginBottom: 4,
                color: s.accent,
              }}
            >
              {s.icon}
            </div>
            <div
              style={{
                fontSize: totalThisMonth > 999 && i === 2 ? "1rem" : "1.45rem",
                fontWeight: 800,
                color: "#1a5c3a",
                lineHeight: 1,
              }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: ".73rem", color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: ".7rem", fontWeight: 600, color: s.subColor, marginTop: 5 }}>
              {s.sub}
            </div>
          </button>
        ))}
      </div>

      {/* ── Donation summary row ─────────────────────── */}
      {(donations.length > 0 || totalCollected > 0) && (
        <div
          style={{
            background: "white",
            borderRadius: 13,
            border: "1px solid rgba(45,122,82,.12)",
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem" }}>💰</span>
              <div>
                <span style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                  إجمالي التبرعات المحصّلة
                </span>
                {pendingDonations > 0 && (
                  <span
                    style={{
                      marginRight: 8,
                      fontSize: ".68rem",
                      background: "#fef9c3",
                      color: "#854d0e",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontWeight: 700,
                    }}
                  >
                    {pendingDonations} معلق ⚡
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigate("donations")}
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
              إدارة التبرعات ←
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a5c3a" }}>
              {totalCollected.toLocaleString()}
              <span
                style={{ fontSize: ".9rem", color: "#6b7280", fontWeight: 500, marginRight: 4 }}
              >
                ر.س
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: ".72rem", color: "#9ca3af", marginBottom: 4 }}>
                هذا الشهر: {totalThisMonth.toLocaleString()} ر.س
              </div>
              {/* Mini progress bar: this month vs total */}
              {totalCollected > 0 && (
                <div
                  style={{
                    height: 6,
                    background: "#f3f4f6",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round((totalThisMonth / totalCollected) * 100))}%`,
                      background: "linear-gradient(90deg,#2d7a52,#4a9e70)",
                      borderRadius: 4,
                      transition: "width .6s",
                    }}
                  />
                </div>
              )}
            </div>
            <div style={{ textAlign: "left", flexShrink: 0 }}>
              <div style={{ fontSize: ".72rem", color: "#9ca3af" }}>إجمالي التبرعات</div>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#374151" }}>
                {donations.length} تبرع
              </div>
            </div>
          </div>

          {/* Channel breakdown */}
          {donations.length > 0 &&
            (() => {
              const channelTotals: Record<string, number> = {};
              donations
                .filter((d) => d.status === "completed")
                .forEach((d) => {
                  channelTotals[d.paymentMethod] = (channelTotals[d.paymentMethod] ?? 0) + d.amount;
                });
              const channels = Object.entries(channelTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4);
              if (channels.length === 0) return null;
              return (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {channels.map(([ch, total]) => (
                    <div
                      key={ch}
                      style={{
                        fontSize: ".72rem",
                        background: "#f2faf6",
                        color: "#1a5c3a",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>{CHANNEL_ICON[ch] ?? "💼"}</span>
                      <span>{ch}</span>
                      <span style={{ color: "#6b7280", fontWeight: 400 }}>
                        {total.toLocaleString()} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
        </div>
      )}

      {/* ── Charts row ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Monthly donations bar chart */}
        <div
          style={{
            background: "white",
            borderRadius: 13,
            border: "1px solid rgba(45,122,82,.12)",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
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
              }}
            >
              📊
            </div>
            <div>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                التبرعات الشهرية
              </div>
              <div style={{ fontSize: ".72rem", color: "#9ca3af" }}>آخر 6 أشهر (ر.س)</div>
            </div>
          </div>
          {donationChartData.every((d) => d.total === 0) ? (
            <div
              style={{
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d1d5db",
                fontSize: ".82rem",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ fontSize: "2rem" }}>📉</span>
              لا توجد بيانات تبرعات بعد
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={donationChartData}
                margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 10,
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    fill: "#9ca3af",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    fill: "#9ca3af",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}ك` : String(v))}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString()} ر.س`, "التبرعات"]}
                  labelStyle={{ fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: 12 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(45,122,82,.15)",
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="#2d7a52" radius={[5, 5, 0, 0]} maxBarSize={36}>
                  {donationChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        idx === donationChartData.length - 1 ? "#1a5c3a" : "rgba(45,122,82,.45)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Task status donut chart */}
        <div
          style={{
            background: "white",
            borderRadius: 13,
            border: "1px solid rgba(45,122,82,.12)",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
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
              🥧
            </div>
            <div>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                حالة المهام
              </div>
              <div style={{ fontSize: ".72rem", color: "#9ca3af" }}>
                {tasks.length} مهمة إجمالاً
              </div>
            </div>
          </div>
          {tasks.length === 0 ? (
            <div
              style={{
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d1d5db",
                fontSize: ".82rem",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ fontSize: "2rem" }}>📋</span>
              لا توجد مهام بعد
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {taskStatusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [`${v} مهمة`, name]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(45,122,82,.15)",
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span
                      style={{
                        fontSize: ".72rem",
                        fontFamily: "'Tajawal','Cairo',sans-serif",
                        color: "#374151",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Tasks + Recent donations ─────────────────── */}
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

        {/* Recent donations */}
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
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".9rem",
                }}
              >
                💳
              </div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                آخر التبرعات
              </div>
            </div>
            <button
              onClick={() => onNavigate("donations")}
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
            {recentDonations.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#9ca3af",
                  fontSize: ".82rem",
                }}
              >
                لا توجد تبرعات بعد
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentDonations.map((don) => (
                  <div
                    key={don.id}
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
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e0f2fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".88rem",
                        flexShrink: 0,
                      }}
                    >
                      {CHANNEL_ICON[don.paymentMethod] ?? "💼"}
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
                        {don.name}
                      </div>
                      <div style={{ fontSize: ".7rem", color: "#9ca3af", marginTop: 1 }}>
                        {don.date} · {don.paymentMethod}
                      </div>
                    </div>
                    <div style={{ textAlign: "left", flexShrink: 0 }}>
                      <div style={{ fontSize: ".85rem", fontWeight: 800, color: "#1a5c3a" }}>
                        {don.amount.toLocaleString()} ر.س
                      </div>
                      <span
                        style={{
                          fontSize: ".65rem",
                          fontWeight: 700,
                          padding: "1px 7px",
                          borderRadius: 20,
                          ...(don.status === "completed"
                            ? { background: "#dcfce7", color: "#166534" }
                            : { background: "#fef9c3", color: "#854d0e" }),
                        }}
                      >
                        {don.status === "completed" ? "مكتمل" : "معلق"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────── */}
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
                icon: "💳",
                title: "سجّل تبرعاً",
                desc: "تتبع المتبرعين والمبالغ المحصّلة",
                bg: "#eff6ff",
                titleColor: "#1e40af",
                border: "rgba(59,130,246,.12)",
                page: "donations" as PageId,
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
