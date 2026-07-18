import { toast } from "sonner";
import type { GeneratedContentItem } from "@/lib/db";
import { Spin, type Tab } from "./constants";

/** Shared "generated text + visual description" block used by every content tab. */
export function TabTextSection({
  tabContent,
  currentLabel,
  anyLoading,
  isThisTabLoading,
  onRegen,
}: {
  tabContent: GeneratedContentItem;
  currentLabel: string;
  anyLoading: boolean;
  isThisTabLoading: boolean;
  onRegen: () => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 9,
          }}
        >
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            النص المُولَّد
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="cg-outline"
              onClick={() => {
                navigator.clipboard.writeText(tabContent.text);
                toast.success("تم النسخ");
              }}
              style={{
                fontSize: ".69rem",
                padding: "4px 10px",
                borderRadius: 7,
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
                color: "#64748b",
                fontFamily: "'Tajawal',sans-serif",
                fontWeight: 600,
              }}
            >
              📋 نسخ
            </button>
            <button
              className="cg-outline"
              onClick={onRegen}
              disabled={anyLoading}
              style={{
                fontSize: ".69rem",
                padding: "4px 10px",
                borderRadius: 7,
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: anyLoading ? "not-allowed" : "pointer",
                color: "#64748b",
                fontFamily: "'Tajawal',sans-serif",
                fontWeight: 600,
                opacity: anyLoading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {isThisTabLoading ? (
                <>
                  <Spin size={10} light={false} /> يُحدَّث
                </>
              ) : (
                "🔄 إعادة"
              )}
            </button>
          </div>
        </div>
        <div
          style={{
            background: "white",
            borderRadius: 13,
            padding: "18px 20px",
            border: "1.5px solid #e8ecef",
            fontSize: ".89rem",
            lineHeight: 1.9,
            whiteSpace: "pre-wrap",
            color: "#1e293b",
            boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            opacity: isThisTabLoading ? 0.5 : 1,
            transition: "opacity .3s",
          }}
        >
          {tabContent.text}
        </div>
      </div>

      {tabContent.visualDesc && (
        <div
          style={{
            marginBottom: 14,
            padding: "12px 16px",
            borderRadius: 11,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            display: "flex",
            gap: 11,
          }}
        >
          <span style={{ fontSize: ".9rem", flexShrink: 0 }}>🖼️</span>
          <div>
            <div
              style={{
                fontSize: ".67rem",
                fontWeight: 700,
                color: "#92400e",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              الوصف البصري
            </div>
            <div
              style={{
                fontSize: ".79rem",
                color: "#78350f",
                lineHeight: 1.65,
                fontStyle: "italic",
              }}
            >
              {tabContent.visualDesc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  tab: Tab;
  tabContent: GeneratedContentItem;
  imageSrc: string | undefined;
  activeId: number | null;
  imgLoading: Tab | null;
  anyLoading: boolean;
  isThisTabLoading: boolean;
  currentLabel: string;
  onGenImage: () => void;
  onDownloadImage: (url: string, name?: string) => void;
  onRegen: () => void;
}

/** post / story / donation tabs: text + visual description + AI image generation. */
export default function ImageTabContent({
  tab,
  tabContent,
  imageSrc,
  activeId,
  imgLoading,
  anyLoading,
  isThisTabLoading,
  currentLabel,
  onGenImage,
  onDownloadImage,
  onRegen,
}: Props) {
  const canGenImage = imgLoading === null && !!tabContent.visualDesc && !!activeId && activeId > 0;

  return (
    <div>
      <TabTextSection
        tabContent={tabContent}
        currentLabel={currentLabel}
        anyLoading={anyLoading}
        isThisTabLoading={isThisTabLoading}
        onRegen={onRegen}
      />

      <div style={{ marginBottom: 16 }}>
        {(!activeId || activeId <= 0) && tabContent.visualDesc && (
          <div
            style={{
              marginBottom: 10,
              padding: "8px 13px",
              borderRadius: 9,
              background: "#fffbeb",
              border: "1px solid #fde68a",
              fontSize: ".73rem",
              color: "#92400e",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ⚠️ يجب حفظ المحتوى في قاعدة البيانات أولاً قبل توليد الصورة
          </div>
        )}
        <button
          className="cg-imgbtn"
          onClick={onGenImage}
          disabled={!canGenImage}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 13,
            border: "2px dashed #bbf7d0",
            background: "#f0fdf4",
            color: "#16a34a",
            fontSize: ".84rem",
            fontWeight: 700,
            cursor: !canGenImage ? "not-allowed" : "pointer",
            fontFamily: "'Tajawal',Cairo,sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            transition: "all .2s",
            opacity:
              (imgLoading !== null && imgLoading !== tab) || !activeId || activeId <= 0 ? 0.4 : 1,
            marginBottom: imageSrc ? 16 : 0,
          }}
        >
          {imgLoading === tab ? (
            <>
              <Spin size={14} light={false} /> جاري توليد الصورة...
            </>
          ) : (
            <>
              <span>🎨</span> {imageSrc ? "إعادة توليد الصورة" : "توليد صورة"}
            </>
          )}
        </button>

        {/* No image yet: show visual desc hint */}
        {!imageSrc && tabContent.visualDesc && activeId && activeId > 0 && imgLoading !== tab && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#f8fafc",
              border: "1.5px dashed #e2e8f0",
              fontSize: ".75rem",
              color: "#64748b",
              lineHeight: 1.65,
            }}
          >
            <span style={{ fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>
              وصف الصورة المقترح:
            </span>
            <span style={{ fontStyle: "italic" }}>{tabContent.visualDesc}</span>
          </div>
        )}

        {/* Has image */}
        {imageSrc && (
          <div>
            {/* b64-only warning */}
            {imageSrc.startsWith("data:") && (
              <div
                style={{
                  marginBottom: 8,
                  padding: "7px 12px",
                  borderRadius: 8,
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  fontSize: ".72rem",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ⚠️ الصورة مؤقتة (لم ترفع للسحابة) — أعد التوليد للحصول على رابط دائم
              </div>
            )}
            <div
              style={{
                fontSize: ".7rem",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: ".05em",
                marginBottom: 9,
              }}
            >
              الصورة المُولَّدة · {imageSrc.startsWith("data:") ? "مؤقتة" : "محفوظة في السجل"}
            </div>
            <div
              style={{
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,.1)",
              }}
            >
              <img
                src={imageSrc}
                alt="Generated"
                style={{
                  width: "100%",
                  display: "block",
                  minHeight: 200,
                  background: "#f8fafc",
                }}
              />
            </div>
            {/* Download image button */}
            <button
              onClick={() => onDownloadImage(imageSrc, `image_${tab}_${Date.now()}.png`)}
              style={{
                marginTop: 10,
                width: "100%",
                padding: "10px 0",
                borderRadius: 10,
                border: "1.5px solid #bbf7d0",
                background: "#f0fdf4",
                color: "#16a34a",
                fontSize: ".82rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Tajawal',Cairo,sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              ⬇️ تنزيل الصورة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
