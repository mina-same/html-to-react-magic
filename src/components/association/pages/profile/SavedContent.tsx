import {
  sc,
  scH,
  iconBadge,
  cardTitle,
  cardSubtitle,
  editBtn,
  CONTENT_TABS,
  type ContentTab,
  type GeneratedContent,
} from "./constants";

interface SavedContentProps {
  latestContent: GeneratedContent | null;
  contentTab: ContentTab;
  setContentTab: (tab: ContentTab) => void;
  onNavigate: (page: string) => void;
}

/**
 * Preview of the most recent AI-generated content session, with the four
 * content-type tabs (post / story / donation / video). Followed by a link
 * card routing to the full content page.
 */
export default function SavedContent({
  latestContent,
  contentTab,
  setContentTab,
  onNavigate,
}: SavedContentProps) {
  if (!latestContent) return null;

  const item = latestContent[contentTab];

  return (
    <>
      <div style={sc}>
        <div style={{ ...scH, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={iconBadge}>✍️</div>
            <div>
              <div style={cardTitle}>المحتوى التسويقي المُولَّد</div>
              <div style={cardSubtitle}>آخر جلسة توليد بالذكاء الاصطناعي</div>
            </div>
          </div>
          <button onClick={() => onNavigate("content")} style={editBtn}>
            عرض الكل ←
          </button>
        </div>
        <div style={{ padding: "12px 18px 18px" }}>
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              gap: 3,
              marginBottom: 14,
              background: "#f2faf6",
              borderRadius: 9,
              padding: 3,
              border: "1px solid rgba(45,122,82,.1)",
            }}
          >
            {CONTENT_TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setContentTab(key)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 6,
                  border: "none",
                  background: contentTab === key ? "white" : "transparent",
                  color: contentTab === key ? "#1a5c3a" : "#6b7280",
                  fontWeight: contentTab === key ? 700 : 500,
                  fontSize: ".78rem",
                  cursor: "pointer",
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                  boxShadow: contentTab === key ? "0 1px 4px rgba(45,122,82,.12)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
          {/* Content */}
          {item?.text ? (
            <>
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 9,
                  padding: "12px 14px",
                  border: "1px solid rgba(45,122,82,.1)",
                  fontSize: ".84rem",
                  lineHeight: 1.8,
                  color: "#374151",
                  whiteSpace: "pre-wrap",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                {item.text}
              </div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt="صورة مُولَّدة"
                  style={{
                    width: "100%",
                    borderRadius: 9,
                    marginTop: 10,
                    maxHeight: 220,
                    objectFit: "cover",
                  }}
                />
              )}
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "22px 0",
                color: "#9ca3af",
                fontSize: ".82rem",
              }}
            >
              لم يُولَّد هذا النوع بعد
            </div>
          )}
        </div>
      </div>

      {/* Link to content page */}
      <button
        onClick={() => onNavigate("content")}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          borderRadius: 13,
          border: "1.5px solid rgba(45,122,82,.18)",
          background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
          cursor: "pointer",
          fontFamily: "'Tajawal','Cairo',sans-serif",
          transition: "all .2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              boxShadow: "0 1px 6px rgba(45,122,82,.12)",
            }}
          >
            ✍️
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
              المحتوى التسويقي
            </div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 2 }}>
              اعرض وأدر المحتوى المُولَّد بالذكاء الاصطناعي
            </div>
          </div>
        </div>
        <span style={{ fontSize: "1.1rem", color: "#2d7a52", opacity: 0.7 }}>←</span>
      </button>
    </>
  );
}
