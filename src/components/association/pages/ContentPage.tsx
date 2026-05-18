import { useState } from "react";
import { AI_CONTENT } from "../data";
import { toast } from "sonner";

type Tab = "post" | "story" | "donation";

const TAB_LABELS: Record<Tab, string> = { post: "منشور", story: "قصة", donation: "نداء تبرع" };

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("post");

  function copyText() {
    navigator.clipboard.writeText(AI_CONTENT[activeTab]).then(() => toast.success("تم النسخ!"));
  }

  return (
    <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>✍️</div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>المحتوى التسويقي</div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>محتوى مُولَّد بالذكاء الاصطناعي لجمعيتك</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(45,122,82,.12)" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "10px 0", fontSize: ".8rem", fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? "#1a5c3a" : "#6b7280",
              background: activeTab === tab ? "#e8f5ee" : "transparent",
              border: "none", borderBottom: activeTab === tab ? "2px solid #2d7a52" : "2px solid transparent",
              cursor: "pointer", fontFamily: "'Tajawal','Cairo',sans-serif", transition: "all .15s",
            }}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <div style={{ background: "#f2faf6", borderRadius: 10, padding: 18, marginBottom: 14, fontSize: ".85rem", color: "#374151", lineHeight: 1.85, fontWeight: 500, whiteSpace: "pre-wrap", minHeight: 100, border: "1px solid rgba(45,122,82,.1)" }}>
          {AI_CONTENT[activeTab]}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={copyText}
            style={{ fontSize: ".78rem", padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(45,122,82,.2)", background: "white", color: "#2d7a52", fontFamily: "'Tajawal','Cairo',sans-serif", cursor: "pointer", fontWeight: 600 }}>
            📋 نسخ النص
          </button>
          <button
            style={{ fontSize: ".78rem", padding: "7px 16px", borderRadius: 8, border: "none", background: "#2d7a52", color: "white", fontFamily: "'Tajawal','Cairo',sans-serif", cursor: "pointer", fontWeight: 600 }}>
            🔄 إعادة التوليد
          </button>
        </div>
      </div>

      {/* Tip */}
      <div style={{ margin: "0 20px 20px", background: "#fffbeb", borderRadius: 9, padding: "10px 14px", border: "1px solid rgba(245,158,11,.2)", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: "1rem" }}>💡</span>
        <div style={{ fontSize: ".74rem", color: "#92400e", lineHeight: 1.6 }}>
          لتوليد محتوى مخصص لجمعيتك، قم برفع الملف التعريفي أولاً من صفحة <strong>الملف الشخصي</strong>.
        </div>
      </div>
    </div>
  );
}
