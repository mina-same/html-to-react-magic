import { AI_ANALYSIS } from "../../data";
import {
  sc,
  scH,
  iconBadge,
  cardTitle,
  cardSubtitle,
  editBtn,
  viewFileLink,
  analysisOrFallback,
  type AnalysisResult,
} from "./constants";

interface AnalysisPanelProps {
  savedName: string;
  savedDesc: string;
  pdfUrl: string | null;
  aiResult: AnalysisResult | null;
  onEdit: () => void;
}

/**
 * The "saved profile" view — shown once an AI analysis exists and the user
 * is not re-editing. Renders the description card, saved PDF card, AI summary,
 * and the marketing ideas / pain-points cards.
 */
export default function AnalysisPanel({
  savedName,
  savedDesc,
  pdfUrl,
  aiResult,
  onEdit,
}: AnalysisPanelProps) {
  const result = analysisOrFallback(aiResult);

  return (
    <>
      {/* Description card */}
      <div style={sc}>
        <div style={{ ...scH, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={iconBadge}>📄</div>
            <div>
              <div style={cardTitle}>ملف الجمعية</div>
              <div style={cardSubtitle}>المحتوى المحفوظ</div>
            </div>
          </div>
          <button onClick={onEdit} style={editBtn}>
            ✏️ تعديل
          </button>
        </div>
        <div style={{ padding: 18 }}>
          {savedName && (
            <div
              style={{
                fontSize: ".82rem",
                fontWeight: 700,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              🏛 {savedName}
            </div>
          )}
          {savedDesc && (
            <div
              style={{
                fontSize: ".85rem",
                color: "#374151",
                lineHeight: 1.75,
                background: "#f9fafb",
                borderRadius: 9,
                padding: "12px 14px",
                border: "1px solid rgba(45,122,82,.1)",
              }}
            >
              {savedDesc}
            </div>
          )}
        </div>
      </div>

      {/* PDF file card */}
      {pdfUrl && (
        <div style={sc}>
          <div style={{ ...scH, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={iconBadge}>📎</div>
              <div>
                <div style={cardTitle}>الملف التعريفي المحفوظ</div>
                <div style={cardSubtitle}>الملف المضغوط المرفوع</div>
              </div>
            </div>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={viewFileLink}>
              👁 عرض الملف
            </a>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div style={sc}>
        <div style={scH}>
          <div style={iconBadge}>✦</div>
          <div>
            <div style={cardTitle}>ملخص الجمعية</div>
            <div style={cardSubtitle}>تحليل AI للملف التعريفي</div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div
            style={{
              background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
              border: "1px solid rgba(45,122,82,.15)",
              borderRadius: 11,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: ".7rem",
                fontWeight: 700,
                letterSpacing: ".08em",
                color: "#2d7a52",
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              ✦ ملخص تلقائي
            </div>
            <div style={{ fontSize: ".88rem", lineHeight: 1.75, color: "#374151" }}>
              {result.summary}
            </div>
          </div>
        </div>
      </div>

      {/* Ideas & Pain Points */}
      <div style={sc}>
        <div style={scH}>
          <div style={iconBadge}>💡</div>
          <div>
            <div style={cardTitle}>أفكار وتحديات تسويقية</div>
            <div style={cardSubtitle}>توصيات AI لتحسين الحضور الإعلامي</div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Ideas */}
            <div
              style={{
                background: "white",
                borderRadius: 11,
                border: "1px solid rgba(45,122,82,.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "11px 13px",
                  borderBottom: "1px solid rgba(45,122,82,.12)",
                  background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>💡</span>
                <span style={{ fontSize: ".83rem", fontWeight: 700, color: "#111827" }}>
                  أفكار للمحتوى التسويقي
                </span>
              </div>
              <div style={{ padding: "11px 13px" }}>
                {(aiResult?.ideas ?? AI_ANALYSIS.ideas).map((idea, i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      padding: "6px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,.04)" : "none",
                      fontSize: ".8rem",
                      color: "#374151",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#2d7a52",
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    {idea}
                  </div>
                ))}
              </div>
            </div>
            {/* Pain points */}
            <div
              style={{
                background: "white",
                borderRadius: 11,
                border: "1px solid rgba(45,122,82,.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "11px 13px",
                  borderBottom: "1px solid rgba(45,122,82,.12)",
                  background: "linear-gradient(135deg,#fff8f0,#fdeee0)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚠️</span>
                <span style={{ fontSize: ".83rem", fontWeight: 700, color: "#111827" }}>
                  تحديات ونقاط ضعف إعلامية
                </span>
              </div>
              <div style={{ padding: "11px 13px" }}>
                {(aiResult?.painPoints ?? AI_ANALYSIS.painPoints).map((pt, i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      padding: "6px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,.04)" : "none",
                      fontSize: ".8rem",
                      color: "#374151",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#d97706",
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    {pt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
