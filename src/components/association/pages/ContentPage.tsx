import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { assocProfileDb, contentGenerationsDb } from "@/lib/db";
import type { GeneratedContent, ContentGeneration } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
// ── Types ────────────────────────────────────────────────────
type Tab = "post" | "story" | "donation" | "video";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "post", label: "منشور", icon: "📱" },
  { key: "story", label: "قصة", icon: "✨" },
  { key: "donation", label: "نداء تبرع", icon: "💚" },
  { key: "video", label: "سيناريو", icon: "🎬" },
];

const IMAGE_TABS: Tab[] = ["post", "story", "donation"];

const EMPTY: GeneratedContent = {
  post: { text: "" },
  story: { text: "" },
  donation: { text: "" },
  video: { text: "" },
};

const PROMPTS: Record<Tab, string> = {
  post: "اكتب منشوراً احترافياً (3-4 أسطر) يعرّف بالجمعية ويدعو للتبرع. hook قوي، CTA في النهاية. أضف وصف الصورة بالإنجليزية فقط.",
  story:
    "اكتب نص قصة (5-6 أسطر) لـ Instagram Stories عن أثر الجمعية. أضف وصف الخلفية بالإنجليزية فقط.",
  donation: "اكتب نداء تبرع مقنع (4-5 أسطر) مع CTA واضح. أضف وصف صورة مؤثرة بالإنجليزية فقط.",
  video: "اكتب سيناريو فيديو (30-60 ثانية) بالمشاهد والتعليق الصوتي. ركز على إنجازات الجمعية.",
};

const LS_KEY = "saaid_content_v2";
const TEMP_ID = -1;

// ── Step tracker ─────────────────────────────────────────────
type StepStatus = "waiting" | "loading" | "ok" | "warn" | "error";
interface Step {
  label: string;
  status: StepStatus;
  detail?: string;
}

// ── Spinner ──────────────────────────────────────────────────
function Spin({ size = 15, light = true }: { size?: number; light?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${size <= 16 ? 2 : 3}px solid ${light ? "rgba(255,255,255,.25)" : "rgba(22,163,74,.18)"}`,
        borderTopColor: light ? "white" : "#16a34a",
        animation: "cgSpin .55s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ── Step icon ─────────────────────────────────────────────────
function StepIcon({ status }: { status: StepStatus }) {
  const cfg: Record<StepStatus, { bg: string; border: string }> = {
    waiting: { bg: "#f8fafc", border: "#e2e8f0" },
    loading: { bg: "white", border: "#16a34a" },
    ok: { bg: "#16a34a", border: "#16a34a" },
    warn: { bg: "#f59e0b", border: "#f59e0b" },
    error: { bg: "#ef4444", border: "#ef4444" },
  };
  const { bg, border } = cfg[status];
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        flexShrink: 0,
        zIndex: 1,
        background: bg,
        border: `2px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .3s ease",
        boxShadow: status === "loading" ? "0 0 0 4px rgba(22,163,74,.1)" : "none",
      }}
    >
      {status === "loading" && <Spin size={10} light={false} />}
      {status === "ok" && (
        <span style={{ color: "white", fontSize: ".62rem", fontWeight: 900 }}>✓</span>
      )}
      {status === "warn" && (
        <span style={{ color: "white", fontSize: ".6rem", fontWeight: 900 }}>!</span>
      )}
      {status === "error" && (
        <span style={{ color: "white", fontSize: ".6rem", fontWeight: 900 }}>✕</span>
      )}
      {status === "waiting" && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#cbd5e1",
            display: "block",
          }}
        />
      )}
    </div>
  );
}

// ── Step tracker panel ────────────────────────────────────────
function StepTracker({ steps }: { steps: Step[] }) {
  if (!steps.length) return null;

  const done = steps.every((s) => ["ok", "warn", "error"].includes(s.status));
  const hasError = steps.some((s) => s.status === "error");
  const hasWarn = steps.some((s) => s.status === "warn");
  const okCount = steps.filter((s) => s.status === "ok").length;

  const stripe = hasError
    ? { bg: "#fef2f2", border: "#fecaca", color: "#ef4444", label: "حدث خطأ" }
    : hasWarn
      ? { bg: "#fffbeb", border: "#fde68a", color: "#b45309", label: "اكتمل مع تنبيهات" }
      : done
        ? { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a", label: "اكتمل بنجاح" }
        : { bg: "#f8fafc", border: "#e8ecef", color: "#475569", label: "جاري التوليد..." };

  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 12,
        overflow: "hidden",
        border: `1.5px solid ${stripe.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "9px 16px",
          background: stripe.bg,
          borderBottom: `1px solid ${stripe.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {!done && <Spin size={12} light={false} />}
          {done && !hasError && (
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: stripe.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: ".55rem", fontWeight: 900 }}>
                {hasWarn ? "!" : "✓"}
              </span>
            </span>
          )}
          <span style={{ fontSize: ".75rem", fontWeight: 700, color: stripe.color }}>
            {stripe.label}
          </span>
        </div>
        <span style={{ fontSize: ".66rem", color: "#94a3b8", fontFamily: "monospace" }}>
          {okCount}/{steps.length}
        </span>
      </div>

      {/* Steps list */}
      <div style={{ padding: "14px 16px 10px", background: "white" }}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const lineClr =
            step.status === "ok"
              ? "#dcfce7"
              : step.status === "warn"
                ? "#fef3c7"
                : step.status === "error"
                  ? "#fee2e2"
                  : "#f1f5f9";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                position: "relative",
                paddingBottom: isLast ? 0 : 18,
              }}
            >
              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 28,
                    bottom: 0,
                    width: 2,
                    background: lineClr,
                    borderRadius: 1,
                    transition: "background .4s",
                  }}
                />
              )}
              <StepIcon status={step.status} />
              <div style={{ paddingTop: 3, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: ".79rem",
                    fontWeight: step.status !== "waiting" ? 600 : 400,
                    color:
                      step.status === "waiting"
                        ? "#94a3b8"
                        : step.status === "error"
                          ? "#dc2626"
                          : step.status === "warn"
                            ? "#92400e"
                            : "#0f172a",
                    lineHeight: 1.4,
                    transition: "color .2s",
                  }}
                >
                  {step.label}
                </div>
                {step.detail && (
                  <div
                    style={{
                      fontSize: ".68rem",
                      color: "#94a3b8",
                      marginTop: 3,
                      fontFamily: "'Courier New',monospace",
                    }}
                  >
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton() {
  return (
    <div
      style={{
        padding: "22px 24px",
        background: "white",
        borderRadius: 13,
        border: "1.5px solid #e8ecef",
      }}
    >
      {[80, 95, 72, 88, 55].map((w, i) => (
        <div
          key={i}
          style={{
            height: 13,
            borderRadius: 5,
            marginBottom: i < 4 ? 11 : 0,
            background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
            backgroundSize: "200% 100%",
            animation: `cgShimmer 1.4s infinite linear ${i * 0.1}s`,
            width: `${w}%`,
          }}
        />
      ))}
    </div>
  );
}

// ── AI helpers ───────────────────────────────────────────────
async function callAI(
  assocName: string,
  context: string,
  tab: Tab,
  extra: string,
): Promise<{ text: string; visualDesc?: string }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY غير موجود");

  const system =
    `أنت خبير تسويق رقمي للمنظمات الخيرية. الجمعية: ${assocName}.\n${context}\n` +
    `القواعد: عربية فصيحة خليجية، لا تخترع أرقاماً، hook قوي في البداية.\n` +
    `التنسيق الإلزامي:\n[النص العربي]\nVisual: [English image description only, max 80 words]`;

  const userMsg = extra ? `تعليمات: ${extra}\nنوع المحتوى: ${PROMPTS[tab]}` : PROMPTS[tab];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
      temperature: 0.75,
      max_tokens: 650,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `OpenAI error ${res.status}`);
  }
  const full: string = (await res.json()).choices[0]?.message?.content ?? "";
  const idx = full.lastIndexOf("Visual:");
  if (idx === -1) return { text: full.trim() };
  return {
    text: full.slice(0, idx).trim(),
    visualDesc: full
      .slice(idx + 7)
      .trim()
      .slice(0, 600),
  };
}

async function callDalle(
  visualDesc: string,
  assocName: string,
  setImgStep: (s: StepStatus, detail: string) => void,
): Promise<{ url: string; base64?: string }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY غير موجود");

  const clean = visualDesc
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
  const prompt = clean
    ? `Charity organization marketing photo: ${clean}. Professional, warm Gulf atmosphere, no text.`
    : `Charity organization professional marketing photo. Community, warmth, Gulf region, no text.`;

  for (const model of ["gpt-image-1", "dall-e-3", "dall-e-2"] as const) {
    setImgStep("loading", `إرسال الطلب إلى ${model}...`);
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, prompt, n: 1, size: "1024x1024", response_format: "b64_json" }),
    });
    if (res.ok) {
      const json = (await res.json()) as { data: { url?: string; b64_json?: string }[] };
      const item = json.data[0];

      let finalUrl = item.url || "";
      let finalBase64 = item.b64_json || "";

      if (item.b64_json) {
        try {
          setImgStep("loading", "جاري رفع الصورة إلى التخزين الدائم...");

          // Convert base64 to Blob
          const res = await fetch(`data:image/png;base64,${item.b64_json}`);
          const blob = await res.blob();

          const safeName = assocName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
          const fileName = `generated/${safeName}_${Date.now()}.png`;

          const { error } = await supabase.storage
            .from("images")
            .upload(fileName, blob, { contentType: "image/png" });

          if (!error) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("images").getPublicUrl(fileName);
            finalUrl = publicUrl;
          } else {
            console.warn("فشل رفع الصورة إلى Storage، جاري استخدام رابط مؤقت:", error);
            finalUrl = `data:image/png;base64,${item.b64_json}`;
          }
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          finalUrl = `data:image/png;base64,${item.b64_json}`;
        }
      }

      setImgStep("ok", model);
      return { url: finalUrl, base64: finalBase64 };
    }
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string };
    };
    const msg = err.error?.message ?? "";
    console.error(`[DALL-E ${model}] Error ${res.status}:`, err);

    if (
      msg.includes("does not exist") ||
      res.status === 404 ||
      (res.status === 400 && (model === "dall-e-3" || model === "gpt-image-1"))
    ) {
      setImgStep("loading", `${model} غير متاح، جاري المحاولة بنموذج آخر...`);
      continue;
    }

    if (msg.toLowerCase().includes("billing") || err.error?.code === "insufficient_quota") {
      throw new Error("رصيد OpenAI غير كافٍ. يرجى إضافة رصيد (Credits) لحسابك.");
    }

    throw new Error(msg || `خطأ في الصورة (${res.status})`);
  }
  throw new Error("توليد الصور غير متاح في حسابك (تأكد من إضافة رصيد لمفتاح OpenAI)");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayableImage(item: GeneratedContentItem): string | undefined {
  if (item.imageUrl) {
    return item.imageUrl;
  }
  if (item.imageBase64) {
    return `data:image/png;base64,${item.imageBase64}`;
  }
  return undefined;
}

// ── Component ────────────────────────────────────────────────
interface Props {
  assocName?: string;
}

export default function ContentPage({ assocName = "الجمعية" }: Props) {
  console.log("[ContentPage] Mounted");

  const { user } = useAuth();
  console.log("[ContentPage] User from useAuth:", user);

  const [tab, setTab] = useState<Tab>("post");
  const [content, setContent] = useState<GeneratedContent>(EMPTY);
  const [loading, setLoading] = useState<Tab | "all" | null>(null);
  const [context, setContext] = useState("");
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<ContentGeneration[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [imgLoading, setImgLoading] = useState<Tab | null>(null);
  const [images, setImages] = useState<Partial<Record<Tab, string>>>({});
  const [sidebar, setSidebar] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);

  // Track last loaded user id
  const lastLoadedUserIdRef = useRef<string | null>(null);

  // ── Step helpers ──────────────────────────────────────────
  const initSteps = useCallback((labels: string[]) => {
    setSteps(
      labels.map((label, i) => ({
        label,
        status: (i === 0 ? "loading" : "waiting") as StepStatus,
      })),
    );
  }, []);

  const markStep = useCallback((index: number, status: StepStatus, detail?: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, status, detail } : s)));
  }, []);

  // Mark step[i] ok and step[i+1] loading in one update
  const advanceStep = useCallback((index: number, detail?: string) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === index) return { ...s, status: "ok", detail };
        if (i === index + 1) return { ...s, status: "loading" };
        return s;
      }),
    );
  }, []);

  // ── Restore from localStorage ──────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const {
        content: c,
        prompt: p,
        id,
      } = JSON.parse(raw) as {
        content?: GeneratedContent;
        prompt?: string;
        id?: number;
      };
      if (c) {
        setContent(c);
        const imgs: Partial<Record<Tab, string>> = {};
        (Object.keys(c) as Tab[]).forEach((k) => {
          const img = getDisplayableImage(c[k]);
          if (img) imgs[k] = img;
        });
        setImages(imgs);
      }
      if (p) setPrompt(p);
      if (id && id > 0) setActiveId(id);
    } catch {
      /* corrupt cache */
    }
  }, []);

  // ── Load from DB ───────────────────────────────────────────
  useEffect(() => {
    console.log("[ContentPage] Data loading useEffect triggered. User:", user);

    const loadData = async () => {
      console.log("[ContentPage] loadData() called");

      if (!user) {
        console.log("[ContentPage] No user, setting histLoading to false");
        setHistLoading(false);
        return;
      }

      // If we already loaded for this user, skip
      if (user.id === lastLoadedUserIdRef.current) {
        console.log("[ContentPage] Already loaded data for this user, skipping");
        setHistLoading(false);
        return;
      }

      try {
        console.log("[ContentPage] Starting data load, setting histLoading to true");
        setHistLoading(true);

        // Load profile data
        console.log("[ContentPage] Loading profile data for user.id:", user.id);
        const profileData = await assocProfileDb.get(user.id);
        console.log("[ContentPage] Profile data loaded:", profileData);

        if (profileData?.description) {
          console.log("[ContentPage] Setting context from profile data");
          setContext(profileData.description);
        } else {
          console.log("[ContentPage] No description in profile data");
        }

        // Load content history
        console.log("[ContentPage] Loading content history for user.id:", user.id);
        const hist = await contentGenerationsDb.list(user.id);
        console.log("[ContentPage] Content history loaded, length:", hist.length);
        setHistory(hist);

        if (hist.length > 0 && !localStorage.getItem(LS_KEY)) {
          console.log("[ContentPage] History exists and no LS_KEY, loading first item");
          const item = hist[0];
          setActiveId(item.id);
          setPrompt(item.prompt);
          setContent(item.content);
          const imgs: Partial<Record<Tab, string>> = {};
          (Object.keys(item.content) as Tab[]).forEach((k) => {
            const img = getDisplayableImage(item.content[k]);
            if (img) imgs[k] = img;
          });
          setImages(imgs);
        } else {
          console.log("[ContentPage] Either no history or LS_KEY exists");
        }

        lastLoadedUserIdRef.current = user.id;
      } catch (err) {
        console.error("[ContentPage] Error loading content page data:", err);
      } finally {
        console.log("[ContentPage] Finally block, setting histLoading to false");
        setHistLoading(false);
      }
    };

    loadData();
  }, [user]);

  const persist = useCallback((c: GeneratedContent, p: string, id: number | null) => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ content: c, prompt: p, id: id && id > 0 ? id : null }),
    );
  }, []);

  const startNew = () => {
    setContent(EMPTY);
    setPrompt("");
    setActiveId(null);
    setImages({});
    setSteps([]);
    localStorage.removeItem(LS_KEY);
  };

  const loadItem = (item: ContentGeneration) => {
    setActiveId(item.id);
    setPrompt(item.prompt);
    setContent(item.content);
    setSteps([]);
    const imgs: Partial<Record<Tab, string>> = {};
    (Object.keys(item.content) as Tab[]).forEach((k) => {
      const img = getDisplayableImage(item.content[k]);
      if (img) imgs[k] = img;
    });
    setImages(imgs);
    persist(item.content, item.prompt, item.id);
  };

  // ── Generate ──────────────────────────────────────────────
  async function generate(which: Tab | "all", regen = false) {
    if (!context) {
      toast.error("أكمل ملف الجمعية أولاً");
      return;
    }

    const startingId = activeId;
    const isNew = startingId === null || startingId === TEMP_ID;
    const tabLabel = which === "all" ? "4 أنواع" : (TABS.find((t) => t.key === which)?.label ?? "");

    initSteps([
      isNew && !regen ? "إنشاء سجل فارغ" : "إعداد الطلب",
      `توليد ${tabLabel} بالذكاء الاصطناعي`,
      "حفظ في قاعدة البيانات",
      "اكتمل التوليد",
    ]);
    setLoading(which);

    let currentId = startingId;

    try {
      // Step 0: Create DB record first (if new)
      if (isNew && !regen) {
        let saved = null;
        try {
          saved = await contentGenerationsDb.create(user!.id, prompt.trim() || "توليد عام", EMPTY);
        } catch (dbErr) {
          console.warn("DB Create failed/timeout, continuing locally", dbErr);
        }

        if (saved) {
          currentId = saved.id;
          setHistory((prev) => [saved, ...prev.filter((h) => h.id !== TEMP_ID)]);
          setActiveId(saved.id);
          persist(EMPTY, prompt, saved.id);
          advanceStep(0, `سجل #${saved.id}`);
        } else {
          // fallback to local UI temp
          const opt: ContentGeneration = {
            id: TEMP_ID,
            prompt: prompt.trim(),
            content: EMPTY,
            createdAt: new Date().toISOString(),
          };
          setHistory((prev) => [opt, ...prev.filter((h) => h.id !== TEMP_ID)]);
          setActiveId(TEMP_ID);
          currentId = TEMP_ID;
          advanceStep(0, "محفوظ محلياً (DB لا يستجيب)");
        }
      } else {
        advanceStep(0, "الطلب جاهز");
      }

      // Step 1: AI call
      let next: GeneratedContent;
      if (which === "all") {
        const keys: Tab[] = ["post", "story", "donation", "video"];
        const results = await Promise.all(keys.map((k) => callAI(assocName, context, k, prompt)));
        next = { ...EMPTY };
        keys.forEach((k, i) => {
          next[k] = {
            ...results[i],
            imageUrl: content[k]?.imageUrl,
            imageBase64: content[k]?.imageBase64,
          };
        });
        setImages({});
      } else {
        const result = await callAI(assocName, context, which, prompt);
        next = {
          ...content,
          [which]: {
            ...result,
            imageUrl: content[which]?.imageUrl,
            imageBase64: content[which]?.imageBase64,
          },
        };
        setImages((prev) => {
          const n = { ...prev };
          delete n[which];
          return n;
        });
      }
      setContent(next);
      advanceStep(1, "تم التوليد");

      // Step 2: DB Update
      if (currentId && currentId > 0) {
        try {
          await contentGenerationsDb.update(currentId, next);
          setHistory((prev) => prev.map((h) => (h.id === currentId ? { ...h, content: next } : h)));
          persist(next, prompt, currentId);
          advanceStep(2, "تم الحفظ");
        } catch (dbErr) {
          console.warn("DB Update failed/timeout, continuing locally", dbErr);
          setHistory((prev) => prev.map((h) => (h.id === currentId ? { ...h, content: next } : h)));
          persist(next, prompt, currentId);
          markStep(2, "warn", "فشل الحفظ - محفوظ محلياً");
        }
      } else {
        persist(next, prompt, null);
        markStep(2, "warn", "محفوظ محلياً فقط");
      }

      // Step 3: complete
      markStep(3, "ok");
      toast.success(which === "all" ? "تم توليد المحتوى الكامل!" : `تم توليد ${tabLabel}!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ غير معروف";
      setSteps((prev) =>
        prev.map((s) => (s.status === "loading" ? { ...s, status: "error", detail: msg } : s)),
      );
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  // ── Generate image ─────────────────────────────────────────
  async function genImage() {
    const desc = content[tab].visualDesc;
    if (!desc) {
      toast.error("لا يوجد وصف بصري — ولّد المحتوى النصي أولاً");
      return;
    }

    initSteps(["إعداد الوصف", "توليد الصورة", "حفظ في السجل"]);
    setImgLoading(tab);

    try {
      advanceStep(0, "الوصف جاهز");

      const { url, base64 } = await callDalle(desc, assocName, (status, detail) => {
        setSteps((prev) => prev.map((s, i) => (i === 1 ? { ...s, status, detail } : s)));
      });

      console.log("✅ تم توليد الصورة بنجاح! الرابط:", url);

      const next: GeneratedContent = {
        ...content,
        [tab]: { ...content[tab], imageUrl: url, imageBase64: base64 },
      };
      setContent(next);
      setImages((prev) => ({ ...prev, [tab]: url }));
      advanceStep(1);

      if (activeId && activeId > 0) {
        try {
          await contentGenerationsDb.update(activeId, next);
          setHistory((prev) => prev.map((h) => (h.id === activeId ? { ...h, content: next } : h)));
          persist(next, prompt, activeId);
          markStep(2, "ok", `السجل #${activeId}`);
        } catch (dbErr) {
          console.warn("DB Update failed/timeout on genImage", dbErr);
          setHistory((prev) => prev.map((h) => (h.id === activeId ? { ...h, content: next } : h)));
          persist(next, prompt, activeId);
          markStep(2, "warn", "تم التوليد لكن الحفظ محلي فقط");
        }
      } else {
        persist(next, prompt, null);
        markStep(2, "warn", "محفوظة محلياً فقط");
      }

      toast.success("تم توليد الصورة وحفظها!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ في الصورة";
      setSteps((prev) =>
        prev.map((s) => (s.status === "loading" ? { ...s, status: "error", detail: msg } : s)),
      );
      toast.error(msg);
    } finally {
      setImgLoading(null);
    }
  }

  // ── Derived ──────────────────────────────────────────────
  const anyTabHasContent = Object.values(content).some((v) => !!v.text);
  const showTabsPanel = anyTabHasContent || loading !== null;
  const tabContent = content[tab];
  const tabLoading = loading === tab || loading === "all";
  const anyLoading = loading !== null;
  const isImgTab = IMAGE_TABS.includes(tab);
  const currentLabel = TABS.find((t) => t.key === tab)?.label ?? "";

  console.log("[ContentPage] Rendering, histLoading:", histLoading, "user:", user);

  return (
    <>
      <style>{`
        @keyframes cgSpin    { to { transform: rotate(360deg); } }
        @keyframes cgShimmer { to { background-position: -200% 0; } }
        .cg-si:hover:not([data-sel=true]):not([data-tmp=true]) { background:#f8fafc !important; }
        .cg-tab:hover:not([data-active=true]) { color:#166534 !important; background:#e7f5ec !important; }
        .cg-ghost:hover:not(:disabled) { background:#f0fdf4 !important; border-color:#bbf7d0 !important; color:#166534 !important; }
        .cg-outline:hover:not(:disabled) { background:#f8fafc !important; }
        .cg-imgbtn:hover:not(:disabled) { background:#e7f5ec !important; border-color:#86efac !important; }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 110px)",
          minHeight: 560,
          background: "#f1f5f9",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 28px rgba(0,0,0,.08)",
          fontFamily: "'Tajawal','Cairo',sans-serif",
        }}
      >
        {/* ══ SIDEBAR ══ */}
        {sidebar && (
          <div
            style={{
              width: 240,
              flexShrink: 0,
              background: "#fff",
              borderLeft: "1px solid #e8ecef",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "15px 14px 12px",
                borderBottom: "1px solid #f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#0f172a" }}>السجل</div>
                <div style={{ fontSize: ".66rem", color: "#94a3b8", marginTop: 1 }}>
                  {histLoading
                    ? "يُحمَّل..."
                    : `${history.filter((h) => h.id !== TEMP_ID).length} جلسة`}
                </div>
              </div>
              <button
                onClick={startNew}
                style={{
                  fontSize: ".71rem",
                  padding: "5px 11px",
                  borderRadius: 8,
                  border: "1.5px solid #16a34a",
                  background: "transparent",
                  color: "#16a34a",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Tajawal',sans-serif",
                }}
              >
                + جديد
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {histLoading ? (
                <div style={{ padding: "28px 0", display: "flex", justifyContent: "center" }}>
                  <Spin size={20} light={false} />
                </div>
              ) : history.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.4rem", opacity: 0.15, marginBottom: 8 }}>✦</div>
                  <div style={{ fontSize: ".71rem", color: "#94a3b8", lineHeight: 1.7 }}>
                    لا يوجد سجل
                    <br />
                    ابدأ بتوليد أول محتوى
                  </div>
                </div>
              ) : (
                history.map((item) => {
                  const isSel = activeId === item.id;
                  const isTmp = item.id === TEMP_ID;
                  return (
                    <div
                      key={item.id}
                      className="cg-si"
                      data-sel={isSel}
                      data-tmp={isTmp}
                      onClick={() => {
                        if (!isTmp && !isSel) loadItem(item);
                      }}
                      style={{
                        padding: "10px 13px",
                        borderBottom: "1px solid #f8fafc",
                        background: isSel ? "#f0fdf4" : "transparent",
                        borderRight: `3px solid ${isSel ? "#16a34a" : "transparent"}`,
                        cursor: isTmp ? "default" : isSel ? "default" : "pointer",
                        transition: "background .14s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            flexShrink: 0,
                            marginTop: 1,
                            background: isSel ? "#dcfce7" : isTmp ? "#fef9c3" : "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isSel ? "#16a34a" : isTmp ? "#ca8a04" : "#94a3b8",
                          }}
                        >
                          {isTmp ? (
                            <Spin size={11} light={false} />
                          ) : (
                            <span style={{ fontSize: ".8rem" }}>✦</span>
                          )}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: ".75rem",
                              fontWeight: 600,
                              color: isSel ? "#166534" : isTmp ? "#92400e" : "#334155",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginBottom: 2,
                            }}
                          >
                            {item.prompt.trim() || (isTmp ? "جاري التوليد..." : "توليد عام")}
                          </div>
                          {isSel && anyLoading && !isTmp ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Spin size={9} light={false} />
                              <span
                                style={{ fontSize: ".62rem", color: "#16a34a", fontWeight: 600 }}
                              >
                                جاري التوليد...
                              </span>
                            </div>
                          ) : (
                            <div style={{ fontSize: ".62rem", color: "#94a3b8" }}>
                              {isTmp ? "يُحفظ فور الانتهاء" : fmtDate(item.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ══ MAIN ══ */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              padding: "12px 20px",
              background: "#fff",
              borderBottom: "1px solid #e8ecef",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setSidebar((s) => !s)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: "1.5px solid #e2e8f0",
                background: sidebar ? "#f0fdf4" : "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: ".95rem",
              }}
            >
              ☰
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: ".9rem", fontWeight: 800, color: "#0f172a" }}>
                توليد المحتوى الذكي
              </div>
              <div
                style={{
                  fontSize: ".7rem",
                  color: "#64748b",
                  marginTop: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{assocName}</span>
                <span style={{ color: context ? "#16a34a" : "#ef4444", fontWeight: 600 }}>
                  ● {context ? "السياق متصل" : "أكمل ملف الجمعية"}
                </span>
              </div>
            </div>
            {activeId !== null && activeId > 0 && (
              <div
                style={{
                  padding: "4px 11px",
                  borderRadius: 20,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#16a34a",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: ".66rem", color: "#166534", fontWeight: 700 }}>
                  جلسة #{activeId}
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* ── Prompt + step tracker ── */}
            <div
              style={{
                padding: "16px 22px 14px",
                background: "#fff",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <div style={{ maxWidth: 720 }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="تعليمات مخصصة… مثال: ركّز على حملة الشتاء، أو اجعل الأسلوب عاطفياً"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontFamily: "'Tajawal',Cairo,sans-serif",
                    fontSize: ".87rem",
                    resize: "none",
                    outline: "none",
                    color: "#1e293b",
                    background: "#f8fafc",
                    lineHeight: 1.7,
                    boxSizing: "border-box",
                    transition: "border-color .2s, background .2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#16a34a";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.background = "#f8fafc";
                  }}
                />

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => generate(tab)}
                    disabled={anyLoading || !context}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 10,
                      border: "none",
                      background:
                        anyLoading || !context
                          ? "#cbd5e1"
                          : "linear-gradient(135deg,#166534,#16a34a)",
                      color: "white",
                      fontSize: ".87rem",
                      fontWeight: 800,
                      fontFamily: "'Tajawal',Cairo,sans-serif",
                      cursor: anyLoading || !context ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: anyLoading || !context ? "none" : "0 3px 14px rgba(22,163,74,.28)",
                      transition: "all .2s",
                    }}
                  >
                    {loading === tab ? (
                      <>
                        <Spin /> جاري توليد {currentLabel}...
                      </>
                    ) : (
                      `✦ توليد ${currentLabel}`
                    )}
                  </button>

                  <button
                    onClick={() => generate("all")}
                    disabled={anyLoading || !context}
                    className="cg-outline"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #e2e8f0",
                      background: "white",
                      color: "#475569",
                      fontSize: ".81rem",
                      fontWeight: 700,
                      fontFamily: "'Tajawal',Cairo,sans-serif",
                      cursor: anyLoading || !context ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      opacity: anyLoading ? 0.5 : 1,
                      transition: "all .2s",
                    }}
                  >
                    {loading === "all" ? (
                      <>
                        <Spin size={13} light={false} /> جاري...
                      </>
                    ) : (
                      "✨ توليد الكل"
                    )}
                  </button>

                  {anyTabHasContent && (
                    <button
                      onClick={startNew}
                      style={{
                        padding: "10px 13px",
                        borderRadius: 10,
                        border: "1.5px solid #e2e8f0",
                        background: "white",
                        color: "#94a3b8",
                        fontSize: ".78rem",
                        fontFamily: "'Tajawal',sans-serif",
                        cursor: "pointer",
                      }}
                    >
                      مسح
                    </button>
                  )}
                </div>

                {!context && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 13px",
                      borderRadius: 9,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      fontSize: ".73rem",
                      color: "#b91c1c",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ⚠️ أكمل ملف الجمعية أولاً لتوفير سياق التوليد
                  </div>
                )}

                {/* Step tracker replaces old log panel */}
                <StepTracker steps={steps} />
              </div>
            </div>

            {/* ── Content area ── */}
            <div style={{ padding: "20px 22px" }}>
              {!showTabsPanel ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 36,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: 18,
                      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      marginBottom: 16,
                      boxShadow: "0 4px 20px rgba(22,163,74,.12)",
                    }}
                  >
                    ✨
                  </div>
                  <div
                    style={{
                      fontSize: ".96rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: 5,
                    }}
                  >
                    ابدأ بتوليد محتواك
                  </div>
                  <div
                    style={{
                      fontSize: ".8rem",
                      color: "#94a3b8",
                      lineHeight: 1.75,
                      maxWidth: 280,
                      marginBottom: history.filter((h) => h.id !== TEMP_ID).length > 0 ? 30 : 0,
                    }}
                  >
                    اكتب تعليمات اختيارية واضغط توليد
                  </div>
                  {history.filter((h) => h.id !== TEMP_ID).length > 0 && !histLoading && (
                    <div style={{ width: "100%", maxWidth: 460 }}>
                      <div
                        style={{
                          fontSize: ".7rem",
                          fontWeight: 700,
                          color: "#cbd5e1",
                          textTransform: "uppercase",
                          letterSpacing: ".07em",
                          marginBottom: 12,
                        }}
                      >
                        جلسات سابقة
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {history
                          .filter((h) => h.id !== TEMP_ID)
                          .slice(0, 4)
                          .map((item) => (
                            <button
                              key={item.id}
                              className="cg-ghost"
                              onClick={() => loadItem(item)}
                              style={{
                                width: "100%",
                                textAlign: "right",
                                padding: "12px 15px",
                                borderRadius: 11,
                                border: "1.5px solid #e8ecef",
                                background: "white",
                                cursor: "pointer",
                                fontFamily: "'Tajawal',sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                transition: "all .15s",
                                boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 9,
                                  background: "#f0fdf4",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: ".85rem",
                                  color: "#16a34a",
                                  flexShrink: 0,
                                }}
                              >
                                ✦
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: ".81rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.prompt || "توليد عام"}
                                </div>
                                <div style={{ fontSize: ".67rem", color: "#94a3b8", marginTop: 2 }}>
                                  {fmtDate(item.createdAt)}
                                </div>
                              </div>
                              <span style={{ color: "#cbd5e1", flexShrink: 0 }}>←</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ maxWidth: 740 }}>
                  {/* Tab bar */}
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginBottom: 18,
                      padding: 5,
                      background: "#e8ecef",
                      borderRadius: 13,
                      width: "fit-content",
                    }}
                  >
                    {TABS.map(({ key, label, icon }) => {
                      const isActive = tab === key;
                      const hasTabContent = !!content[key].text;
                      const isThisLoading = loading === key || loading === "all";
                      return (
                        <button
                          key={key}
                          className="cg-tab"
                          data-active={isActive}
                          onClick={() => setTab(key)}
                          style={{
                            padding: "7px 14px",
                            borderRadius: 9,
                            border: "none",
                            background: isActive ? "white" : "transparent",
                            color: isActive ? "#166534" : "#64748b",
                            fontWeight: isActive ? 700 : 500,
                            fontSize: ".8rem",
                            cursor: "pointer",
                            fontFamily: "'Tajawal',Cairo,sans-serif",
                            boxShadow: isActive ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                            transition: "all .16s",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {isThisLoading ? <Spin size={11} light={false} /> : <span>{icon}</span>}
                          {label}
                          {hasTabContent && !isThisLoading && (
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "#16a34a",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {tabLoading && !tabContent.text && <Skeleton />}

                  {tabLoading && !!tabContent.text && (
                    <div
                      style={{
                        padding: "9px 14px",
                        borderRadius: 10,
                        marginBottom: 14,
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Spin size={13} light={false} />
                      <span style={{ fontSize: ".77rem", color: "#166534", fontWeight: 600 }}>
                        جاري توليد {currentLabel} جديد...
                      </span>
                    </div>
                  )}

                  {!tabLoading && !tabContent.text && (
                    <div
                      style={{
                        padding: "32px 0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "1.6rem", marginBottom: 10, opacity: 0.3 }}>
                        {TABS.find((t) => t.key === tab)?.icon}
                      </div>
                      <div
                        style={{
                          fontSize: ".84rem",
                          fontWeight: 700,
                          color: "#475569",
                          marginBottom: 5,
                        }}
                      >
                        لم يُولَّد {currentLabel} بعد
                      </div>
                      <div style={{ fontSize: ".75rem", color: "#94a3b8", marginBottom: 18 }}>
                        اضغط لإضافته لهذه الجلسة
                      </div>
                      <button
                        onClick={() => generate(tab, true)}
                        disabled={anyLoading}
                        style={{
                          padding: "9px 24px",
                          borderRadius: 10,
                          border: "none",
                          background: anyLoading
                            ? "#cbd5e1"
                            : "linear-gradient(135deg,#166534,#16a34a)",
                          color: "white",
                          fontSize: ".84rem",
                          fontWeight: 700,
                          fontFamily: "'Tajawal',Cairo,sans-serif",
                          cursor: anyLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          boxShadow: anyLoading ? "none" : "0 3px 14px rgba(22,163,74,.28)",
                        }}
                      >
                        {tabLoading ? (
                          <>
                            <Spin /> جاري...
                          </>
                        ) : (
                          `✦ توليد ${currentLabel}`
                        )}
                      </button>
                    </div>
                  )}

                  {!!tabContent.text && (
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
                              onClick={() => generate(tab, true)}
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
                              {loading === tab ? (
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
                            opacity: tabLoading ? 0.5 : 1,
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

                      {isImgTab && (
                        <div style={{ marginBottom: 16 }}>
                          <button
                            className="cg-imgbtn"
                            onClick={genImage}
                            disabled={imgLoading !== null || !tabContent.visualDesc}
                            style={{
                              width: "100%",
                              padding: "15px 0",
                              borderRadius: 13,
                              border: "2px dashed #bbf7d0",
                              background: "#f0fdf4",
                              color: "#16a34a",
                              fontSize: ".84rem",
                              fontWeight: 700,
                              cursor:
                                !tabContent.visualDesc || imgLoading !== null
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily: "'Tajawal',Cairo,sans-serif",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 9,
                              transition: "all .2s",
                              opacity: imgLoading !== null && imgLoading !== tab ? 0.4 : 1,
                              marginBottom: images[tab] ? 16 : 0,
                            }}
                          >
                            {imgLoading === tab ? (
                              <>
                                <Spin size={14} light={false} /> جاري توليد الصورة...
                              </>
                            ) : (
                              <>
                                <span>🎨</span> {images[tab] ? "إعادة توليد الصورة" : "توليد صورة"}
                              </>
                            )}
                          </button>

                          {images[tab] && (
                            <div>
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
                                الصورة المُولَّدة · محفوظة في السجل
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
                                  src={images[tab]}
                                  alt="Generated"
                                  style={{
                                    width: "100%",
                                    display: "block",
                                    minHeight: 200,
                                    background: "#f8fafc",
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
