import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AI_CONTENT, AI_ANALYSIS } from "../data";

interface Props {
  onAnalysisComplete: (name: string, contentCount: number) => void;
}

type ContentTab = "post" | "story" | "donation";

export default function ProfilePage({ onAnalysisComplete }: Props) {
  const [assocName,   setAssocName]   = useState("");
  const [assocDesc,   setAssocDesc]   = useState("");
  const [fileInfo,    setFileInfo]    = useState<{ name: string; size: string } | null>(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [analyzing,   setAnalyzing]   = useState(false);
  const [step,        setStep]        = useState("جاري قراءة الملف التعريفي");
  const [done,        setDone]        = useState(false);
  const [tab,         setTab]         = useState<ContentTab>("post");
  const fileRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    const kb = file.size / 1024;
    setFileInfo({ name: file.name, size: kb > 1024 ? (kb/1024).toFixed(1)+"MB" : kb.toFixed(0)+"KB" });
  }

  async function analyzeProfile() {
    if (!assocName.trim() && !assocDesc.trim() && !fileInfo) return;
    setAnalyzing(true); setDone(false);
    const steps = ["جاري قراءة الملف التعريفي","تحليل المحتوى وتحديد الهوية","توليد الأفكار التسويقية","إعداد المحتوى الجاهز للنشر"];
    for (const s of steps) {
      setStep(s);
      await new Promise(r => setTimeout(r, 700));
    }
    setAnalyzing(false); setDone(true);
    onAnalysisComplete(assocName.trim() || "جمعيتكم", 3);
  }

  const sc: React.CSSProperties = { background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", marginBottom: 18, overflow: "hidden" };
  const scH: React.CSSProperties = { padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10 };
  const inp: React.CSSProperties = { width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid rgba(45,122,82,.12)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: ".93rem", color: "#111827", outline: "none", background: "white", transition: "border-color .2s" };

  return (
    <div>
      {/* Upload section */}
      <div style={sc}>
        <div style={scH}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", color: "#2d7a52" }}>📤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>ملف الجمعية التعريفي</div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>ارفع الملف وسيقوم الذكاء الاصطناعي بتحليله وتوليد المحتوى</div>
          </div>
          <span style={{ fontSize: ".68rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "linear-gradient(135deg,#e8f5ee,#d4eddf)", color: "#1a5c3a", border: "1px solid rgba(45,122,82,.15)" }}>✦ مدعوم بـ AI</span>
        </div>
        <div style={{ padding: 18 }}>
          {/* Assoc name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: ".82rem", fontWeight: 600, color: "#374151", marginBottom: 5 }}>اسم الجمعية</label>
            <input value={assocName} onChange={e => setAssocName(e.target.value)} placeholder="مثال: جمعية تكاتف الخيرية" style={inp} />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${isDragging ? "#2d7a52" : "rgba(45,122,82,.12)"}`, borderRadius: 11, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: isDragging ? "#e8f5ee" : "#f2faf6", transition: "all .25s", position: "relative", marginBottom: fileInfo ? 0 : 14 }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={e => { const f = e.target.files?.[0]; if(f) processFile(f); }} />
            <div style={{ fontSize: "2.2rem", marginBottom: 8, opacity: .5 }}>📄</div>
            <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#374151", marginBottom: 4 }}>اسحب الملف هنا أو اضغط للرفع</div>
            <div style={{ fontSize: ".78rem", color: "#6b7280" }}>الملف التعريفي للجمعية، التقرير السنوي، أو أي وثيقة تعريفية</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 9, flexWrap: "wrap" }}>
              {["PDF","Word","TXT","صور JPG/PNG"].map(t => (
                <span key={t} style={{ fontSize: ".68rem", background: "rgba(45,122,82,.08)", color: "#2d7a52", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* File preview */}
          {fileInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", background: "#e8f5ee", borderRadius: 9, marginBottom: 14, marginTop: 11, border: "1px solid rgba(45,122,82,.12)" }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>📄</span>
              <div>
                <div style={{ fontSize: ".85rem", fontWeight: 600, color: "#111827" }}>{fileInfo.name}</div>
                <div style={{ fontSize: ".73rem", color: "#6b7280" }}>{fileInfo.size}</div>
              </div>
              <button onClick={() => setFileInfo(null)} style={{ marginRight: "auto", fontSize: ".73rem", color: "#dc2626", cursor: "pointer", background: "none", border: "none", fontFamily: "'Tajawal',sans-serif", fontWeight: 600 }}>✕ إزالة</button>
            </div>
          )}

          {/* Desc textarea */}
          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontSize: ".82rem", fontWeight: 600, color: "#374151", marginBottom: 5 }}>أو أكتب وصف الجمعية مباشرة</label>
            <textarea value={assocDesc} onChange={e => setAssocDesc(e.target.value)} placeholder="أكتب هنا نبذة عن الجمعية، مجال عملها، مشاريعها، وأهدافها..."
              style={{ ...inp, resize: "vertical", minHeight: 90, lineHeight: 1.65 }} />
          </div>

          <Button onClick={analyzeProfile} disabled={analyzing || (!assocName.trim() && !assocDesc.trim() && !fileInfo)}
            style={{ width: "100%", padding: 12, borderRadius: 9, background: analyzing ? "rgba(26,92,58,.5)" : "linear-gradient(135deg,#1a5c3a,#2d7a52)", color: "white", border: "none", fontFamily: "'Tajawal',sans-serif", fontSize: ".92rem", fontWeight: 700, marginTop: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {analyzing ? <><span style={{ animation: "spin .8s linear infinite", display: "inline-block" }}>⟳</span> يجري التحليل...</> : "✦ تحليل الملف بالذكاء الاصطناعي"}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {analyzing && (
        <div style={{ textAlign: "center", padding: "28px 18px" }}>
          <div style={{ width: 38, height: 38, border: "3px solid #e8f5ee", borderTopColor: "#2d7a52", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 11px" }} />
          <div style={{ fontSize: ".85rem", color: "#6b7280", fontWeight: 500 }}>يجري الذكاء الاصطناعي التحليل...</div>
          <div style={{ fontSize: ".76rem", color: "#9ca3af", marginTop: 4 }}>{step}</div>
        </div>
      )}

      {/* AI Results */}
      {done && (
        <>
          {/* Summary */}
          <div style={sc}>
            <div style={scH}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>✦</div>
              <div>
                <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>ملخص الجمعية</div>
                <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>تحليل AI للملف التعريفي</div>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ background: "linear-gradient(135deg,#f0faf5,#e8f5ee)", border: "1px solid rgba(45,122,82,.15)", borderRadius: 11, padding: "16px 18px" }}>
                <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", color: "#2d7a52", textTransform: "uppercase", marginBottom: 7 }}>✦ ملخص تلقائي</div>
                <div style={{ fontSize: ".88rem", lineHeight: 1.75, color: "#374151" }}>{AI_ANALYSIS.summary}</div>
              </div>
            </div>
          </div>

          {/* Ideas & Pain Points */}
          <div style={sc}>
            <div style={scH}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>💡</div>
              <div>
                <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>أفكار وتحديات تسويقية</div>
                <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>توصيات AI لتحسين الحضور الإعلامي</div>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div style={{ background: "white", borderRadius: 11, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
                  <div style={{ padding: "11px 13px", borderBottom: "1px solid rgba(45,122,82,.12)", background: "linear-gradient(135deg,#f0faf5,#e8f5ee)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>💡</span><span style={{ fontSize: ".83rem", fontWeight: 700, color: "#111827" }}>أفكار للمحتوى التسويقي</span>
                  </div>
                  <div style={{ padding: "11px 13px" }}>
                    {AI_ANALYSIS.ideas.map((idea, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "6px 0", borderBottom: i < AI_ANALYSIS.ideas.length-1 ? "1px solid rgba(0,0,0,.04)" : "none", fontSize: ".8rem", color: "#374151", lineHeight: 1.5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2d7a52", flexShrink: 0, marginTop: 5 }} />
                        {idea}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: 11, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
                  <div style={{ padding: "11px 13px", borderBottom: "1px solid rgba(45,122,82,.12)", background: "linear-gradient(135deg,#fff8f0,#fdeee0)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>⚠️</span><span style={{ fontSize: ".83rem", fontWeight: 700, color: "#111827" }}>تحديات ونقاط ضعف إعلامية</span>
                  </div>
                  <div style={{ padding: "11px 13px" }}>
                    {AI_ANALYSIS.painPoints.map((pt, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "6px 0", borderBottom: i < AI_ANALYSIS.painPoints.length-1 ? "1px solid rgba(0,0,0,.04)" : "none", fontSize: ".8rem", color: "#374151", lineHeight: 1.5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706", flexShrink: 0, marginTop: 5 }} />
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content tabs */}
          <div style={sc}>
            <div style={scH}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>✍️</div>
              <div>
                <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>محتوى تسويقي مقترح</div>
                <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>محتوى جاهز للنشر مُولَّد بالذكاء الاصطناعي</div>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 13, borderBottom: "1px solid rgba(45,122,82,.12)", paddingBottom: 0 }}>
                {(["post","story","donation"] as ContentTab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding: "7px 13px", fontSize: ".81rem", fontWeight: 600, cursor: "pointer", color: tab===t ? "#1a5c3a" : "#6b7280", border: "none", background: "none", borderBottom: tab===t ? "2px solid #2d7a52" : "2px solid transparent", marginBottom: -1, fontFamily: "'Tajawal',sans-serif", transition: "all .17s" }}>
                    {t==="post" ? "منشور سوشيال" : t==="story" ? "قصة إنسانية" : "نداء تبرع"}
                  </button>
                ))}
              </div>
              <div style={{ background: "#f2faf6", borderRadius: 9, border: "1px solid rgba(45,122,82,.12)", padding: 15, minHeight: 110, fontSize: ".85rem", color: "#374151", lineHeight: 1.75, position: "relative" }}>
                <button onClick={() => navigator.clipboard?.writeText(AI_CONTENT[tab])}
                  style={{ position: "absolute", top: 9, left: 9, fontSize: ".7rem", padding: "3px 9px", borderRadius: 6, border: "1px solid rgba(45,122,82,.12)", background: "white", cursor: "pointer", fontFamily: "'Tajawal',sans-serif", color: "#6b7280" }}>
                  نسخ
                </button>
                {AI_CONTENT[tab]}
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 7, border: "1px solid rgba(45,122,82,.12)", background: "white", fontFamily: "'Tajawal',sans-serif", fontSize: ".8rem", color: "#374151", cursor: "pointer", marginTop: 9, transition: "all .2s" }}>
                🔄 توليد نص جديد
              </button>
            </div>
          </div>
        </>
      )}

      {!analyzing && !done && (
        <div style={{ textAlign: "center", padding: "28px 18px", color: "#9ca3af" }}>
          <div style={{ fontSize: "2rem", marginBottom: 9, opacity: .3 }}>✦</div>
          <div style={{ fontSize: ".85rem" }}>ارفع الملف التعريفي أو اكتب وصف الجمعية لبدء التحليل</div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
