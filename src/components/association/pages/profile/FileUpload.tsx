import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  sc,
  scH,
  inp,
  iconBadge,
  cardTitle,
  cardSubtitle,
  ACCEPTED_FILE_TYPES,
  FILE_TYPE_BADGES,
  type FileInfo,
  type InputMode,
} from "./constants";

interface FileUploadProps {
  assocName: string;
  setAssocName: (v: string) => void;
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  assocDesc: string;
  setAssocDesc: (v: string) => void;
  fileInfo: FileInfo | null;
  setFileInfo: (v: FileInfo | null) => void;
  setFileObj: (v: File | null) => void;
  pdfUrl: string | null;
  onRemoveSavedPdf: () => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  processFile: (file: File) => void;
  analyzing: boolean;
  editing: boolean;
  onAnalyze: () => void;
}

/**
 * The upload / edit section — association name input, file-vs-text mode
 * toggle, drag-and-drop dropzone (with the saved-PDF affordance), the text
 * textarea, and the "analyze with AI" button.
 */
export default function FileUpload({
  assocName,
  setAssocName,
  inputMode,
  setInputMode,
  assocDesc,
  setAssocDesc,
  fileInfo,
  setFileInfo,
  setFileObj,
  pdfUrl,
  onRemoveSavedPdf,
  isDragging,
  setIsDragging,
  processFile,
  analyzing,
  editing,
  onAnalyze,
}: FileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div style={sc}>
      <div style={scH}>
        <div style={{ ...iconBadge, color: "#2d7a52" }}>📤</div>
        <div style={{ flex: 1 }}>
          <div style={cardTitle}>ملف الجمعية التعريفي</div>
          <div style={cardSubtitle}>ارفع الملف وسيقوم الذكاء الاصطناعي بتحليله وتوليد المحتوى</div>
        </div>
        <span
          style={{
            fontSize: ".68rem",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 20,
            background: "linear-gradient(135deg,#e8f5ee,#d4eddf)",
            color: "#1a5c3a",
            border: "1px solid rgba(45,122,82,.15)",
          }}
        >
          ✦ مدعوم بـ AI
        </span>
      </div>
      <div style={{ padding: 18 }}>
        {/* Assoc name */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: ".82rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: 5,
            }}
          >
            اسم الجمعية
          </label>
          <input
            value={assocName}
            onChange={(e) => setAssocName(e.target.value)}
            placeholder="مثال: جمعية تكاتف الخيرية"
            style={inp}
          />
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: "#f2faf6",
            borderRadius: 10,
            padding: 3,
            marginBottom: 16,
            border: "1px solid rgba(45,122,82,.1)",
          }}
        >
          {(["file", "text"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setInputMode(mode);
                if (mode === "file") setAssocDesc("");
                else {
                  setFileInfo(null);
                  setFileObj(null);
                }
              }}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 7,
                border: "none",
                background: inputMode === mode ? "white" : "transparent",
                color: inputMode === mode ? "#1a5c3a" : "#6b7280",
                fontWeight: inputMode === mode ? 700 : 500,
                fontSize: ".85rem",
                cursor: "pointer",
                fontFamily: "'Tajawal','Cairo',sans-serif",
                boxShadow: inputMode === mode ? "0 1px 6px rgba(45,122,82,.12)" : "none",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {mode === "file" ? "📎 رفع ملف" : "✏️ كتابة نص"}
            </button>
          ))}
        </div>

        {/* File upload mode */}
        {inputMode === "file" && (
          <>
            {/* Show saved PDF when no new file selected */}
            {pdfUrl && !fileInfo && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 16px",
                  background: "#e8f5ee",
                  borderRadius: 11,
                  border: "1.5px solid rgba(45,122,82,.2)",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>📎</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1a5c3a" }}>
                    الملف التعريفي المحفوظ
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: ".73rem", color: "#2d7a52", textDecoration: "underline" }}
                  >
                    عرض الملف ↗
                  </a>
                </div>
                <button
                  onClick={onRemoveSavedPdf}
                  style={{
                    fontSize: ".73rem",
                    color: "#dc2626",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    fontFamily: "'Tajawal',sans-serif",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  ✕ إزالة
                </button>
              </div>
            )}

            {/* Dropzone — only when no saved PDF or user wants to replace */}
            {(!pdfUrl || fileInfo) && (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) processFile(f);
                  }}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? "#2d7a52" : "rgba(45,122,82,.12)"}`,
                    borderRadius: 11,
                    padding: "28px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: isDragging ? "#e8f5ee" : "#f9fafb",
                    transition: "all .25s",
                    position: "relative",
                    marginBottom: fileInfo ? 0 : 14,
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) processFile(f);
                    }}
                  />
                  <div style={{ fontSize: "2.2rem", marginBottom: 8, opacity: fileInfo ? 1 : 0.4 }}>
                    {fileInfo ? "✅" : "📄"}
                  </div>
                  <div
                    style={{
                      fontSize: ".9rem",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: 4,
                    }}
                  >
                    {fileInfo ? fileInfo.name : "اسحب الملف هنا أو اضغط للرفع"}
                  </div>
                  <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
                    {fileInfo
                      ? fileInfo.size
                      : "الملف التعريفي، التقرير السنوي، أو أي وثيقة تعريفية"}
                  </div>
                  {!fileInfo && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "center",
                        marginTop: 9,
                        flexWrap: "wrap",
                      }}
                    >
                      {FILE_TYPE_BADGES.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: ".68rem",
                            background: "rgba(45,122,82,.08)",
                            color: "#2d7a52",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {fileInfo && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 13px",
                      background: "#e8f5ee",
                      borderRadius: 9,
                      marginBottom: 14,
                      marginTop: 10,
                      border: "1px solid rgba(45,122,82,.12)",
                    }}
                  >
                    <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: ".85rem",
                          fontWeight: 600,
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fileInfo.name}
                      </div>
                      <div style={{ fontSize: ".73rem", color: "#6b7280" }}>{fileInfo.size}</div>
                    </div>
                    <button
                      onClick={() => {
                        setFileInfo(null);
                        setFileObj(null);
                      }}
                      style={{
                        fontSize: ".73rem",
                        color: "#dc2626",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        fontFamily: "'Tajawal',sans-serif",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      ✕ إزالة
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Text input mode */}
        {inputMode === "text" && (
          <div style={{ marginBottom: 14 }}>
            <textarea
              value={assocDesc}
              onChange={(e) => setAssocDesc(e.target.value)}
              placeholder="أكتب هنا نبذة عن الجمعية — مجال عملها، مشاريعها، أهدافها، وجمهورها المستهدف..."
              rows={6}
              style={{ ...inp, resize: "vertical", minHeight: 130, lineHeight: 1.7 }}
            />
            <div style={{ fontSize: ".73rem", color: "#9ca3af", marginTop: 5 }}>
              كلما أضفت تفاصيل أكثر، كان تحليل الذكاء الاصطناعي أدق وأشمل.
            </div>
          </div>
        )}

        <Button
          onClick={onAnalyze}
          disabled={analyzing}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 9,
            background: analyzing ? "rgba(26,92,58,.5)" : "linear-gradient(135deg,#1a5c3a,#2d7a52)",
            color: "white",
            border: "none",
            fontFamily: "'Tajawal',sans-serif",
            fontSize: ".92rem",
            fontWeight: 700,
            marginTop: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {analyzing ? (
            <>
              <span style={{ animation: "spin .8s linear infinite", display: "inline-block" }}>
                ⟳
              </span>
              يجري التحليل...
            </>
          ) : editing ? (
            "✦ إعادة التحليل بالذكاء الاصطناعي"
          ) : (
            "✦ تحليل الملف بالذكاء الاصطناعي"
          )}
        </Button>
      </div>
    </div>
  );
}
