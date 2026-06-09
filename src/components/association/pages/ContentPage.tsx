import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { assocProfileDb } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

type Tab = "post" | "story" | "donation" | "video";
type GeneratedContent = Record<Tab, { text: string; visualDesc?: string; imageUrl?: string }>;

const TAB_LABELS: Record<Tab, string> = {
  post: "منشور",
  story: "قصة",
  donation: "نداء تبرع",
  video: "سيناريو فيديو",
};

const EMPTY: GeneratedContent = {
  post: { text: "" },
  story: { text: "" },
  donation: { text: "" },
  video: { text: "" },
};

interface Props {
  assocName?: string;
}

const PROMPTS: Record<Tab, string> = {
  post: "اكتب منشوراً احترافياً لوسائل التواصل الاجتماعي (3-4 أسطر) يُعرّف بالجمعية ويدعو للتبرع. أسلوب مؤثر وإيجابي. أضف وصفاً مقترحاً لصورة مرافقة للمنشور.",
  story:
    "اكتب نص قصة قصيرة (5-6 أسطر) مناسبة لـ Instagram Stories تحكي عن أثر الجمعية على المستفيدين. أضف وصفاً لما يجب أن يظهر في خلفية القصة.",
  donation:
    "اكتب نداء تبرع مقنعاً وعاطفياً (4-5 أسطر) يحفّز القارئ على التبرع فوراً، مع دعوة واضحة للعمل. أضف وصفاً لصورة مؤثرة تدعم هذا النداء.",
  video:
    "اكتب سيناريو لفيديو قصير (30-60 ثانية) يتضمن المشاهد والتعليق الصوتي المقترح. ركز على إنجازات الجمعية أو قصة نجاح.",
};

async function generateContent(
  assocName: string,
  context: string,
  tab: Tab,
  userPromptInput: string = "",
): Promise<{ text: string; visualDesc?: string }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY غير موجود");

  const systemPrompt = `أنت خبير تسويق رقمي محترف متخصص في المنظمات الخيرية والإنسانية السعودية والخليجية.
تمتلك خبرة واسعة في كتابة محتوى يحفّز التبرع، يبني الثقة، ويحقق تفاعلاً عالياً على منصات التواصل الاجتماعي.

## هوية الجمعية — السياق الكامل:
"""
الجمعية: ${assocName}
${context}
"""

## معايير الكتابة الإلزامية:
- اللغة: عربية فصيحة ذات جرس خليجي أصيل — لا ترجمة حرفية
- الأسلوب: عاطفي صادق ومحفّز دون مبالغة مفتعلة
- الجملة الأولى: hook قوي — إما سؤال يفتح القلب، أو صورة إنسانية حية، أو حقيقة صادمة
- الجملة الأخيرة: CTA (دعوة للعمل) واضح ومحدد — تبرّع الآن / ساهم معنا / شارك القصة
- الكثافة: كل كلمة تحمل وزناً — لا حشو ولا إطالة فارغة
- الأرقام: استخدم فقط ما ورد في السياق أعلاه، لا تخترع أرقاماً أو إحصاءات
- الاسم: ادمج اسم الجمعية بشكل طبيعي، لا تكرره بشكل مصطنع

## تنسيق المخرجات — التزم بهذا بدقة:
[نص المحتوى الكامل]

الوصف البصري: [وصف دقيق للصورة أو الفيديو المقترح: المشهد، الأشخاص، الإضاءة، الألوان، المشاعر الظاهرة، وأي نص يظهر على الصورة]`;


  const userPrompt = userPromptInput
    ? `باستخدام السياق، نفذ هذا الطلب الإضافي: ${userPromptInput}. \nنوع المحتوى المطلوب: ${PROMPTS[tab]}`
    : PROMPTS[tab];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error("فشل الاتصال بـ AI");

  const data = await res.json();
  const fullText = data.choices[0]?.message?.content ?? "";

  const parts = fullText.split("الوصف البصري:");
  return {
    text: parts[0].trim(),
    visualDesc: parts[1]?.trim(),
  };
}

export default function ContentPage({ assocName = "الجمعية" }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("post");
  const [content, setContent] = useState<GeneratedContent>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    if (user) {
      assocProfileDb.get(user.id).then((data) => {
        if (data?.description) setContext(data.description);
      });
    }
  }, [user]);

  async function handleGenerateAll() {
    if (!context) {
      toast.error("يرجى إكمال ملف الجمعية أولاً في صفحة 'ملف الجمعية'");
      return;
    }
    setLoading(true);
    try {
      const tabs: Tab[] = ["post", "story", "donation", "video"];
      const results = await Promise.all(
        tabs.map((t) => generateContent(assocName, context, t, customPrompt)),
      );

      const newContent = { ...EMPTY };
      tabs.forEach((t, i) => {
        newContent[t] = results[i];
      });
      setContent(newContent);
      toast.success("تم توليد المحتوى بنجاح!");
    } catch (err) {
      toast.error("حدث خطأ في التوليد");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateTab() {
    setLoading(true);
    try {
      const result = await generateContent(assocName, context, activeTab, customPrompt);
      setContent((prev) => ({ ...prev, [activeTab]: result }));
      toast.success(`تم تحديث ${TAB_LABELS[activeTab]}`);
    } catch (err) {
      toast.error("حدث خطأ في التوليد");
    } finally {
      setLoading(false);
    }
  }

  const hasContent = !!content[activeTab].text;

  return (
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
          ✦
        </div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
            توليد المحتوى الذكي
          </div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
            يعتمد الـ AI على سياق ملف جمعية "{assocName}" المرفوع مسبقاً
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div
        style={{
          padding: "18px",
          background: "#f8fdfb",
          borderBottom: "1px solid rgba(45,122,82,.08)",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              fontSize: ".82rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            تعليمات إضافية (اختياري)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="مثال: ركز على حملة الشتاء القادمة، أو اجعل الأسلوب أكثر حماساً..."
            style={{
              width: "100%",
              padding: "10px 13px",
              borderRadius: 8,
              border: "1.5px solid rgba(45,122,82,.12)",
              fontFamily: "inherit",
              fontSize: ".88rem",
              minHeight: 60,
              resize: "vertical",
            }}
          />
        </div>
        <Button
          onClick={handleGenerateAll}
          disabled={loading || !context}
          style={{ width: "100%", background: "#1a5c3a", color: "white", fontWeight: 700 }}
        >
          {loading ? "جاري التوليد..." : "✨ توليد محتوى متكامل (منشور، قصة، نداء، فيديو)"}
        </Button>
        {!context && (
          <div style={{ fontSize: ".72rem", color: "#dc2626", marginTop: 6, textAlign: "center" }}>
            ⚠️ يجب رفع ملف الجمعية أولاً في صفحة "ملف الجمعية" لتوفير السياق للذكاء الاصطناعي.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#fcfdfc" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: ".82rem",
              fontWeight: activeTab === t ? 700 : 500,
              color: activeTab === t ? "#1a5c3a" : "#6b7280",
              border: "none",
              borderBottom: activeTab === t ? "3px solid #2d7a52" : "3px solid transparent",
              background: activeTab === t ? "white" : "transparent",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Result Content */}
      <div style={{ padding: 20 }}>
        {hasContent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <div
                style={{
                  fontSize: ".78rem",
                  fontWeight: 700,
                  color: "#1a5c3a",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>📝</span> النص المقترح
              </div>
              <div
                style={{
                  background: "#f2faf6",
                  borderRadius: 12,
                  padding: 20,
                  border: "1px solid rgba(45,122,82,.1)",
                  fontSize: ".92rem",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  color: "#111827",
                }}
              >
                {content[activeTab].text}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: ".78rem",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>🖼️</span> الوصف البصري (AI)
              </div>
              <div
                style={{
                  background: "#fffbeb",
                  borderRadius: 12,
                  padding: 15,
                  border: "1px solid rgba(245,158,11,.15)",
                  fontSize: ".8rem",
                  lineHeight: 1.6,
                  color: "#92400e",
                  fontStyle: "italic",
                }}
              >
                {content[activeTab].visualDesc || "جاري إعداد التوصية البصرية..."}
              </div>
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(content[activeTab].text)}
                style={{ width: "100%", marginTop: 15, fontSize: ".75rem", height: 36 }}
              >
                📋 نسخ النص الكامل
              </Button>
              <Button
                variant="ghost"
                onClick={handleRegenerateTab}
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: 8,
                  fontSize: ".75rem",
                  height: 36,
                  color: "#2d7a52",
                }}
              >
                🔄 إعادة التوليد
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: "3rem", marginBottom: 15 }}>✨</div>
            <div style={{ fontSize: ".9rem", fontWeight: 500 }}>
              ابدأ بتوليد المحتوى التسويقي المخصص
            </div>
            <div style={{ fontSize: ".78rem", marginTop: 5 }}>
              سيقوم الذكاء الاصطناعي بتحليل بيانات جمعيتك لإنشاء محتوى فريد
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
