import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { contentGenerationsDb } from "@/lib/db";

interface Props {
  assocName: string;
  onNameChange: (name: string) => void;
  onLogout: () => void;
}

interface TokenStats {
  totalTokens: number;
  sessionCount: number;
  lastUsed: string | null;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("ar-SA");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SettingsPage({ assocName, onNameChange, onLogout }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    contentGenerationsDb
      .list(user.id)
      .then((rows) => {
        const totalTokens = rows.reduce((sum, r) => sum + r.tokensUsed, 0);
        const sessionCount = rows.length;
        const lastUsed = rows.length > 0 ? rows[0].createdAt : null;
        setStats({ totalTokens, sessionCount, lastUsed });
      })
      .finally(() => setStatsLoading(false));
  }, [user]);

  const pct = stats ? Math.min(100, (stats.totalTokens / 100_000) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* AI token usage */}
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
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
              استخدام الذكاء الاصطناعي
            </div>
            <div style={{ fontSize: ".7rem", color: "#6b7280", marginTop: 1 }}>
              توليد المحتوى · gpt-4o-mini
            </div>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {statsLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#9ca3af",
                fontSize: ".82rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid #e5e7eb",
                  borderTopColor: "#2d7a52",
                  animation: "spin .7s linear infinite",
                }}
              />
              جاري التحميل...
            </div>
          ) : (
            <>
              {/* Stat row */}
              <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: 110,
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div
                    style={{
                      fontSize: ".67rem",
                      fontWeight: 600,
                      color: "#166534",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      marginBottom: 5,
                    }}
                  >
                    إجمالي التوكنات
                  </div>
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "#15803d", lineHeight: 1 }}
                  >
                    {fmtNum(stats?.totalTokens ?? 0)}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 110,
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: ".67rem",
                      fontWeight: 600,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      marginBottom: 5,
                    }}
                  >
                    جلسات التوليد
                  </div>
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", lineHeight: 1 }}
                  >
                    {stats?.sessionCount ?? 0}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 110,
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: ".67rem",
                      fontWeight: 600,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      marginBottom: 5,
                    }}
                  >
                    آخر استخدام
                  </div>
                  <div
                    style={{
                      fontSize: ".88rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      lineHeight: 1.3,
                      marginTop: 4,
                    }}
                  >
                    {stats?.lastUsed ? fmtDate(stats.lastUsed) : "—"}
                  </div>
                </div>
              </div>

              {/* Progress bar toward 100K */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: ".72rem", color: "#6b7280", fontWeight: 600 }}>
                    الاستخدام مقابل 100K توكن
                  </span>
                  <span style={{ fontSize: ".72rem", color: "#374151", fontWeight: 700 }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div
                  style={{ height: 7, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      width: `${pct}%`,
                      background: pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#16a34a",
                      transition: "width .5s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: ".67rem", color: "#9ca3af", marginTop: 5 }}>
                  {fmtNum(stats?.totalTokens ?? 0)} من 100,000 توكن
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile settings */}
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
            }}
          >
            ⚙️
          </div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
            إعدادات الجمعية
          </div>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: ".78rem",
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 5,
              }}
            >
              اسم الجمعية
            </label>
            <input
              value={assocName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="أدخل اسم جمعيتك"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(45,122,82,.2)",
                fontSize: ".84rem",
                fontFamily: "'Tajawal','Cairo',sans-serif",
                color: "#374151",
                outline: "none",
                background: "white",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".78rem",
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 5,
              }}
            >
              البريد الإلكتروني
            </label>
            <input
              placeholder="example@assoc.org"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(45,122,82,.2)",
                fontSize: ".84rem",
                fontFamily: "'Tajawal','Cairo',sans-serif",
                color: "#374151",
                outline: "none",
                background: "#f9fafb",
                boxSizing: "border-box",
              }}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
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
            }}
          >
            🔔
          </div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>الإشعارات</div>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "إشعارات التبرعات الجديدة", on: true },
            { label: "تذكير المهام المتأخرة", on: true },
            { label: "تقارير الأداء الأسبوعية", on: false },
          ].map((n) => (
            <div
              key={n.label}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span style={{ fontSize: ".83rem", color: "#374151" }}>{n.label}</span>
              <div
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  background: n.on ? "#2d7a52" : "#e5e7eb",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 2,
                    transition: "left .2s",
                    left: n.on ? 18 : 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div
        style={{
          background: "white",
          borderRadius: 13,
          border: "1px solid rgba(239,68,68,.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(239,68,68,.1)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#991b1b" }}>تسجيل الخروج</div>
        </div>
        <div style={{ padding: 16 }}>
          <button
            onClick={onLogout}
            style={{
              fontSize: ".82rem",
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid rgba(239,68,68,.25)",
              background: "#fef2f2",
              color: "#b91c1c",
              fontFamily: "'Tajawal','Cairo',sans-serif",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
