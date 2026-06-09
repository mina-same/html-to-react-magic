import type { Influencer } from "../types";
import { formatFollowers } from "../data";
import { Button } from "@/components/ui/button";

interface Props {
  influencers: Influencer[];
  canManage?: boolean;
  onAdd?: () => void;
  onEdit?: (inf: Influencer) => void;
  onView?: (inf: Influencer) => void;
  onRequest: (inf: Influencer) => void;
}

const PLAT_STYLE: Record<string, React.CSSProperties> = {
  Instagram: { background: "#fce7f3", color: "#9d174d" },
  X: { background: "#e0f2fe", color: "#075985" },
  TikTok: { background: "#f3e8ff", color: "#6b21a8" },
  Snapchat: { background: "#fef9c3", color: "#854d0e" },
  YouTube: { background: "#fee2e2", color: "#b91c1c" },
};

const PLAT_ICON: Record<string, string> = {
  Instagram: "📷",
  X: "🐦",
  TikTok: "🎵",
  Snapchat: "👻",
  YouTube: "▶️",
};

const STATUS_STYLE: Record<Influencer["status"], React.CSSProperties> = {
  active: { background: "#dcfce7", color: "#166534" },
  pending: { background: "#fef9c3", color: "#854d0e" },
  ended: { background: "#f1f5f9", color: "#94a3b8" },
};

const STATUS_LABEL: Record<Influencer["status"], string> = {
  active: "نشط",
  pending: "قيد التفاوض",
  ended: "منتهي",
};

export default function InfluencersPage({
  influencers,
  canManage = false,
  onAdd,
  onEdit,
  onView,
  onRequest,
}: Props) {
  const activeCount = influencers.filter((i) => i.status === "active").length;
  const socialBadges = (inf: Influencer) =>
    [
      { label: "IG", value: inf.instagramHandle },
      { label: "X", value: inf.xHandle },
      { label: "TT", value: inf.tiktokHandle },
      { label: "YT", value: inf.youtubeHandle },
      { label: "SC", value: inf.snapchatHandle },
    ].filter((item) => item.value);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 13,
        border: "1px solid rgba(45,122,82,.12)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(45,122,82,.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
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
          }}
        >
          🌟
        </div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>المؤثرون</div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
            {influencers.length} مؤثر
          </div>
        </div>
        <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              fontSize: ".72rem",
              background: "#dcfce7",
              color: "#166534",
              padding: "2px 9px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {activeCount} نشطين
          </span>
          {canManage ? (
            <Button
              size="sm"
              onClick={onAdd}
              style={{
                background: "#2d7a52",
                color: "white",
                fontSize: ".78rem",
                padding: "6px 14px",
                borderRadius: 8,
              }}
            >
              + إضافة مؤثر
            </Button>
          ) : (
            <span style={{ fontSize: ".72rem", color: "#6b7280" }}>
              الجمعية يمكنها طلب حملة فقط
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ padding: 16 }}>
        {influencers.map((inf) => (
          <div
            key={inf.id}
            style={{
              background: "#f2faf6",
              borderRadius: 12,
              border: "1px solid rgba(45,122,82,.12)",
              padding: 16,
              cursor: "pointer",
              transition: "all .18s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 2px 14px rgba(45,122,82,.12)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(45,122,82,.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(45,122,82,.12)";
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#2d7a52",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".9rem",
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {inf.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: ".86rem", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}
                >
                  {inf.name}
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: ".64rem",
                      padding: "2px 7px",
                      borderRadius: 20,
                      fontWeight: 700,
                      ...(PLAT_STYLE[inf.platform] ?? {}),
                    }}
                  >
                    {PLAT_ICON[inf.platform]} {inf.platform}
                  </span>
                  <span
                    style={{
                      fontSize: ".63rem",
                      padding: "2px 7px",
                      borderRadius: 20,
                      fontWeight: 600,
                      ...STATUS_STYLE[inf.status],
                    }}
                  >
                    {STATUS_LABEL[inf.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2" style={{ marginBottom: 12 }}>
              {[
                { label: "المتابعون", value: formatFollowers(inf.followers) },
                { label: "التفاعل", value: `${inf.engagement}%` },
                { label: "الحملات", value: inf.campaigns },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "white",
                    borderRadius: 8,
                    padding: "7px 8px",
                    textAlign: "center",
                    border: "1px solid rgba(45,122,82,.08)",
                  }}
                >
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#1a5c3a" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: ".6rem", color: "#6b7280", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {inf.niche && (
              <div
                style={{
                  fontSize: ".7rem",
                  color: "#2d7a52",
                  background: "#e8f5ee",
                  padding: "3px 9px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                {inf.niche}
              </div>
            )}

            {inf.notes && (
              <div
                style={{
                  fontSize: ".69rem",
                  color: "#6b7280",
                  marginBottom: 10,
                  lineHeight: 1.5,
                  borderTop: "1px solid rgba(45,122,82,.08)",
                  paddingTop: 8,
                }}
              >
                {inf.notes}
              </div>
            )}

            {socialBadges(inf).length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {socialBadges(inf).map((badge) => (
                  <span
                    key={`${inf.id}-${badge.label}`}
                    style={{
                      fontSize: ".63rem",
                      padding: "3px 7px",
                      borderRadius: 20,
                      background: "#eef6f1",
                      color: "#2d7a52",
                      fontWeight: 700,
                    }}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Price + actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderTop: "1px solid rgba(45,122,82,.08)",
                paddingTop: 10,
              }}
            >
              <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#1a5c3a" }}>
                {inf.basePrice.toLocaleString()} ر.س
              </span>
              <span style={{ fontSize: ".62rem", color: "#6b7280" }}>/ حملة</span>
              <div style={{ display: "flex", gap: 6, marginRight: "auto" }}>
                {onView && (
                  <button
                    onClick={() => onView(inf)}
                    style={{
                      fontSize: ".68rem",
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(45,122,82,.2)",
                      background: "white",
                      color: "#2d7a52",
                      fontFamily: "'Tajawal','Cairo',sans-serif",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    الملف
                  </button>
                )}
                {canManage && onEdit && (
                  <button
                    onClick={() => onEdit(inf)}
                    style={{
                      fontSize: ".68rem",
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(45,122,82,.2)",
                      background: "white",
                      color: "#2d7a52",
                      fontFamily: "'Tajawal','Cairo',sans-serif",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    تعديل
                  </button>
                )}
                {inf.status !== "ended" && (
                  <button
                    onClick={() => onRequest(inf)}
                    style={{
                      fontSize: ".68rem",
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: "#2d7a52",
                      color: "white",
                      fontFamily: "'Tajawal','Cairo',sans-serif",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    طلب حملة
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
