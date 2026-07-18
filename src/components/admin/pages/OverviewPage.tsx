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
import { StatusBadge, PlatBadge, fmt, infColor, S } from "../helpers";
import type { Org, Influencer, CampaignRequest, PageId } from "../types";
import { toast } from "sonner";

interface OverviewPageProps {
  orgs: Org[];
  influencers: Influencer[];
  requests: CampaignRequest[];
  setActivePage: (page: PageId) => void;
  setOrgModal: (data: { open: boolean; data: Partial<Org> | null }) => void;
}

export function OverviewPage({
  orgs,
  influencers,
  requests,
  setActivePage,
  setOrgModal,
}: OverviewPageProps) {
  const recentOrgs = [...orgs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentReqs = [...requests].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const newOrgs = orgs.filter((o) => o.status === "new").length;
  const pendingOrgs = orgs.filter((o) => o.status === "pending").length;
  const activeOrgs = orgs.filter((o) => o.status === "active").length;
  const pendingReqs = requests.filter((r) => r.status === "pending").length;
  const approvedReqs = requests.filter((r) => r.status === "approved").length;

  // Chart data
  const orgStatusData = [
    { name: "نشط", value: activeOrgs, color: "#2d7a52" },
    { name: "جديد", value: newOrgs, color: "#3b82f6" },
    { name: "قيد المراجعة", value: pendingOrgs, color: "#f59e0b" },
    {
      name: "موقوف",
      value: orgs.filter((o) => o.status === "suspended").length,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  const reqStatusData = [
    {
      name: "معلق",
      value: requests.filter((r) => r.status === "pending").length,
      fill: "#f59e0b",
    },
    { name: "مقبول", value: approvedReqs, fill: "#3b82f6" },
    {
      name: "مكتمل",
      value: requests.filter((r) => r.status === "completed").length,
      fill: "#2d7a52",
    },
    {
      name: "مرفوض",
      value: requests.filter((r) => r.status === "rejected").length,
      fill: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  const topInfluencers = [...influencers].sort((a, b) => b.followers - a.followers).slice(0, 4);

  return (
    <div>
      {/* ── Welcome banner ─────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg,#0f2d1e 0%,#1a5c3a 50%,#2d7a52 100%)",
          borderRadius: 16,
          padding: "22px 26px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 20,
          position: "relative",
          overflow: "hidden",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -40,
            top: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,.03)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            bottom: -60,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(201,168,76,.05)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(255,255,255,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
            flexShrink: 0,
          }}
        >
          🛡️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)", marginBottom: 2 }}>
            لوحة تحكم الإدارة
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", marginBottom: 4 }}>
            مرحباً بالمسؤول — منصة ساعِد
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { v: orgs.length, l: "جمعية" },
              { v: influencers.length, l: "مؤثر" },
              { v: approvedReqs, l: "طلب مقبول" },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  fontSize: ".8rem",
                  color: "rgba(255,255,255,.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontWeight: 800, color: "white", fontSize: ".95rem" }}>{s.v}</span>{" "}
                {s.l}
              </div>
            ))}
          </div>
        </div>
        {(newOrgs > 0 || pendingReqs > 0) && (
          <div
            style={{
              background: "rgba(245,158,11,.2)",
              border: "1px solid rgba(245,158,11,.4)",
              borderRadius: 10,
              padding: "8px 14px",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: ".72rem", color: "#fcd34d", fontWeight: 700, marginBottom: 2 }}>
              ⚡ تحتاج مراجعة
            </div>
            {newOrgs > 0 && (
              <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.8)" }}>
                {newOrgs} جمعية جديدة
              </div>
            )}
            {pendingReqs > 0 && (
              <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.8)" }}>
                {pendingReqs} طلب معلق
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── KPI cards ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          {
            icon: "🏛️",
            num: orgs.length,
            lbl: "إجمالي الجمعيات",
            sub: `${newOrgs} جديدة`,
            accent: "#2d7a52",
            subColor: "#2d7a52",
            page: "orgs",
          },
          {
            icon: "🌟",
            num: influencers.length,
            lbl: "المؤثرون",
            sub: `${influencers.filter((i) => i.status === "active").length} نشط`,
            accent: "#c9a84c",
            subColor: "#92400e",
            page: "influencers",
          },
          {
            icon: "📋",
            num: pendingReqs,
            lbl: "طلبات معلقة",
            sub: `${approvedReqs} مقبولة`,
            accent: "#3b82f6",
            subColor: "#1d4ed8",
            page: "requests",
          },
          {
            icon: "⚙️",
            num: "⚙️",
            lbl: "الإعدادات",
            sub: "إدارة الخيارات",
            accent: "#6b7280",
            subColor: "#4b5563",
            page: "settings",
          },
        ].map((k, i) => (
          <div
            key={i}
            onClick={() => setActivePage(k.page as PageId)}
            style={{
              background: "white",
              borderRadius: 11,
              border: "1px solid rgba(45,122,82,.12)",
              padding: "13px 14px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "box-shadow .15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(45,122,82,.13)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 4,
                height: "100%",
                background: k.accent,
              }}
            />
            <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>
              {k.num}
            </div>
            <div style={{ fontSize: ".7rem", color: "#6b7280" }}>{k.lbl}</div>
            <div style={{ fontSize: ".66rem", fontWeight: 600, marginTop: 4, color: k.subColor }}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Org status donut */}
        <div
          style={{
            background: "white",
            borderRadius: 13,
            border: "1px solid rgba(45,122,82,.12)",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
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
              🏛️
            </div>
            <div>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                حالة الجمعيات
              </div>
              <div style={{ fontSize: ".7rem", color: "#9ca3af" }}>{orgs.length} جمعية مسجلة</div>
            </div>
          </div>
          {orgs.length === 0 ? (
            <div
              style={{
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d1d5db",
                fontSize: ".82rem",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ fontSize: "2rem" }}>🏛️</span>لا توجد جمعيات بعد
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={155}>
              <PieChart>
                <Pie
                  data={orgStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {orgStatusData.map((d, idx) => (
                    <Cell key={idx} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [`${v}`, name]}
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
                  formatter={(v) => (
                    <span
                      style={{
                        fontSize: ".7rem",
                        fontFamily: "'Tajawal','Cairo',sans-serif",
                        color: "#374151",
                      }}
                    >
                      {v}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Request pipeline bar */}
        <div
          style={{
            background: "white",
            borderRadius: 13,
            border: "1px solid rgba(45,122,82,.12)",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
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
              📊
            </div>
            <div>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                خط سير الطلبات
              </div>
              <div style={{ fontSize: ".7rem", color: "#9ca3af" }}>
                {requests.length} طلب إجمالاً
              </div>
            </div>
          </div>
          {requests.length === 0 ? (
            <div
              style={{
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d1d5db",
                fontSize: ".82rem",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ fontSize: "2rem" }}>📋</span>لا توجد طلبات بعد
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={reqStatusData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
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
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(45,122,82,.15)",
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={42} name="الطلبات">
                  {reqStatusData.map((d, idx) => (
                    <Cell key={idx} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent orgs + recent requests ──────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Recent orgs */}
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
                  width: 27,
                  height: 27,
                  borderRadius: 7,
                  background: "#e8f5ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".85rem",
                }}
              >
                🏛️
              </div>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                آخر الجمعيات
              </div>
            </div>
            <button
              onClick={() => setActivePage("orgs")}
              style={{
                fontSize: ".72rem",
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
          <div style={{ padding: "8px 0" }}>
            {recentOrgs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#9ca3af",
                  fontSize: ".82rem",
                }}
              >
                لا توجد جمعيات بعد
              </div>
            ) : (
              recentOrgs.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setOrgModal({ open: true, data: o })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 16px",
                    cursor: "pointer",
                    transition: "background .12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#f2faf6";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#2d7a52,#4a9e70)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: ".85rem",
                      flexShrink: 0,
                    }}
                  >
                    {(o.name || "؟")[0]}
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
                      {o.name || "—"}
                    </div>
                    <div style={{ fontSize: ".7rem", color: "#9ca3af" }}>
                      {o.region || "—"} · {o.date}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent requests + top influencers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Pending requests */}
          <div
            style={{
              background: "white",
              borderRadius: 13,
              border: "1px solid rgba(45,122,82,.12)",
              overflow: "hidden",
              flex: 1,
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
                    width: 27,
                    height: 27,
                    borderRadius: 7,
                    background: "#fef9c3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".85rem",
                  }}
                >
                  📋
                </div>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                  آخر الطلبات
                </div>
              </div>
              <button
                onClick={() => setActivePage("requests")}
                style={{
                  fontSize: ".72rem",
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
            <div style={{ padding: "8px 0" }}>
              {recentReqs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "#9ca3af",
                    fontSize: ".82rem",
                  }}
                >
                  لا توجد طلبات بعد
                </div>
              ) : (
                recentReqs.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 16px",
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "";
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: ".8rem",
                          fontWeight: 600,
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.orgName}
                      </div>
                      <div style={{ fontSize: ".7rem", color: "#9ca3af" }}>
                        {r.infName} · {r.budget.toLocaleString()} ر.س
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top influencers mini */}
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
                padding: "11px 18px",
                borderBottom: "1px solid rgba(45,122,82,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 7,
                    background: "#fef9c3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".85rem",
                  }}
                >
                  🌟
                </div>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                  أبرز المؤثرين
                </div>
              </div>
              <button
                onClick={() => setActivePage("influencers")}
                style={{
                  fontSize: ".72rem",
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
            <div style={{ padding: "6px 0" }}>
              {topInfluencers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 0",
                    color: "#9ca3af",
                    fontSize: ".82rem",
                  }}
                >
                  لا يوجد مؤثرين بعد
                </div>
              ) : (
                topInfluencers.map((inf) => (
                  <div
                    key={inf.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 16px",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#c9a84c,#f0d060)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: ".78rem",
                        flexShrink: 0,
                      }}
                    >
                      {inf.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: ".8rem",
                          fontWeight: 600,
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {inf.name}
                      </div>
                      <div style={{ fontSize: ".7rem", color: "#9ca3af" }}>
                        {inf.platform} · {fmt(inf.followers)} متابع
                      </div>
                    </div>
                    <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#c9a84c" }}>
                      {inf.price.toLocaleString()} ر.س
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
