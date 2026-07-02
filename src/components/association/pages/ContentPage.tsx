import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Player } from "@remotion/player";
import { assocProfileDb, associationsDb, contentGenerationsDb } from "@/lib/db";
import VideoEditorModal from "@/components/association/modals/VideoEditorModal";
import type { GeneratedContent, ContentGeneration, GeneratedContentItem } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { BrandedVideo } from "@/remotion/BrandedVideo";
import { computeBrandedVideoDuration, parseBrandColors, moodToTransition, parseBrandMood } from "@/remotion/brandUtils";
import type { TransitionStyle } from "@/remotion/brandUtils";
import LogoTab from "@/components/association/pages/LogoTab";
import type { LogoAnimation, LogoPosition } from "@/remotion/logoAnimations";
// ── Types ────────────────────────────────────────────────────
type Tab = "post" | "story" | "donation" | "video" | "logo";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "post",     label: "منشور",    icon: "📱" },
  { key: "story",    label: "قصة",      icon: "✨" },
  { key: "donation", label: "نداء تبرع", icon: "💚" },
  { key: "video",    label: "سيناريو",  icon: "🎬" },
  { key: "logo",     label: "شعار",     icon: "🏷" },
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
  logo: "", // logo tab has no AI generation
  video: `اكتب نصاً تسويقياً احترافياً للفيديو (5-6 أسطر فقط) مُهيأ للتحريك الاحترافي:
• السطر 1: hook عاطفي قوي يجذب الانتباه فوراً
• السطر 2-3: إنجازات الجمعية بأرقام حقيقية ملموسة
• السطر 4: رسالة إنسانية مؤثرة تلمس القلوب
• السطر 5-6: CTA مباشر وقوي يحفز التبرع
القواعد: كل سطر 6-10 كلمات فقط، أسلوب خطابي مؤثر، بدون عناوين أو ترقيم أو تنسيق، النص المباشر فقط.`,
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

// Generate ambient background music using Web Audio API synthesis
function generateAmbientMusic(audioCtx: AudioContext, duration: number): AudioBuffer {
  const sr = audioCtx.sampleRate;
  const buf = audioCtx.createBuffer(2, Math.ceil(duration * sr), sr);

  // E minor pentatonic — calm, emotional, universal
  const melody = [164.81, 196.00, 220.00, 246.94, 293.66, 329.63, 246.94, 220.00];
  const BPM = 62;
  const beat = 60 / BPM;

  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    const stereoOffset = ch === 1 ? 0.003 : 0; // tiny stereo spread

    for (let i = 0; i < d.length; i++) {
      const t = i / sr + stereoOffset;
      let s = 0;

      // ── Bass drone (E2 + B2) ─────────────────────────────────
      s += 0.045 * Math.sin(2 * Math.PI * 82.41 * t);
      s += 0.025 * Math.sin(2 * Math.PI * 123.47 * t);
      // subtle chorus
      s += 0.012 * Math.sin(2 * Math.PI * 82.52 * t);

      // ── Soft pad chords — change every 4 beats ───────────────
      const chordBeat = Math.floor(t / (beat * 4)) % 2;
      const padFreqs = chordBeat === 0
        ? [164.81, 196.00, 246.94]   // Em chord
        : [174.61, 220.00, 261.63];  // Am chord
      padFreqs.forEach((f, pi) => {
        const v = [0.038, 0.03, 0.025][pi];
        const lfo = 0.96 + 0.04 * Math.sin(2 * Math.PI * 0.18 * t + pi);
        s += v * Math.sin(2 * Math.PI * f * t) * lfo;
      });

      // ── Melodic plucks — one note every 2 beats ──────────────
      const noteIdx  = Math.floor(t / (beat * 2)) % melody.length;
      const notePos  = (t % (beat * 2)) / (beat * 2);
      const pluckEnv = notePos < 0.015
        ? notePos / 0.015
        : Math.exp(-6 * (notePos - 0.015));
      const freq = melody[noteIdx];
      s += 0.055 * Math.sin(2 * Math.PI * freq * t) * pluckEnv;
      s += 0.018 * Math.sin(2 * Math.PI * freq * 2 * t) * pluckEnv; // octave harmonic

      // ── Light shimmer — high freq at low vol ─────────────────
      const shimmer = Math.sin(2 * Math.PI * 659.25 * t) * 0.008
        * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.07 * t));
      s += shimmer;

      // ── Gentle tremolo ────────────────────────────────────────
      s *= 0.96 + 0.04 * Math.sin(2 * Math.PI * 3.8 * t);

      // ── Fade in / fade out ────────────────────────────────────
      const env = Math.min(1, t / 2.0) * Math.min(1, (duration - t) / 2.0);
      d[i] = Math.max(-1, Math.min(1, s * env * 0.72));
    }
  }
  return buf;
}

// Generate Arabic TTS via OpenAI — returns ArrayBuffer (MP3)
async function generateTTS(text: string, apiKey: string): Promise<ArrayBuffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "tts-1",
      voice: "alloy",   // works well with Arabic
      input: text,
      speed: 0.95,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `TTS error ${res.status}`);
  }
  return res.arrayBuffer();
}

async function extractBrandFromFileId(fileId: string, apiKey: string): Promise<string> {
  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v2",
      "Content-Type": "application/json",
    };

    const asstRes = await fetch("https://api.openai.com/v1/assistants", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Brand Extractor",
        model: "gpt-4o",
        instructions:
          "Analyze the attached charity organization brochure. Extract concisely in English: 1) primary brand colors (hex if visible), 2) logo style/shape description, 3) overall visual style and mood. Keep it under 80 words. This will be used as DALL-E context.",
        tools: [{ type: "file_search" }],
      }),
    });
    const assistantId = (await asstRes.json()).id;

    const thRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: "Extract brand identity from this file.",
          attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }],
        }],
      }),
    });
    const threadId = (await thRes.json()).id;

    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ assistant_id: assistantId }),
    });
    const runId = (await runRes.json()).id;

    let status = "queued";
    while (status === "queued" || status === "in_progress") {
      await new Promise((r) => setTimeout(r, 2000));
      const chk = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, { headers });
      status = (await chk.json()).status;
      if (status === "failed") throw new Error("failed");
    }

    const msgsRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, { headers });
    const msgs = await msgsRes.json();
    const brand = msgs.data[0]?.content[0]?.text?.value ?? "";

    fetch(`https://api.openai.com/v1/assistants/${assistantId}`, { method: "DELETE", headers }).catch(() => {});
    fetch(`https://api.openai.com/v1/threads/${threadId}`, { method: "DELETE", headers }).catch(() => {});

    return brand.replace(/【[^】]*】/g, "").trim().slice(0, 200);
  } catch (err) {
    console.warn("Brand extraction from file ID failed:", err);
    return "";
  }
}

async function extractBrandFromPdf(pdfUrl: string, apiKey: string): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    const pdfWorkerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

    const resp = await fetch(pdfUrl);
    const arrayBuffer = await resp.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this charity organization's brochure page. Extract concisely in English: 1) primary brand colors (hex if visible), 2) logo style/shape description, 3) overall visual style and mood. Keep it under 80 words. This will be used as DALL-E context.",
              },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}`, detail: "low" } },
            ],
          },
        ],
        max_tokens: 150,
      }),
    });
    if (!res.ok) throw new Error("vision failed");
    return (await res.json()).choices[0]?.message?.content ?? "";
  } catch (err) {
    console.warn("Brand extraction failed:", err);
    return "";
  }
}

async function callDalle(
  visualDesc: string,
  assocName: string,
  setImgStep: (s: StepStatus, detail: string) => void,
  brandContext?: string,
  onB64Ready?: (base64: string) => Promise<void>,
): Promise<{ url: string; base64?: string }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY غير موجود");

  const clean = visualDesc
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
  const brandNote = brandContext ? ` Brand identity: ${brandContext}.` : "";
  const prompt = clean
    ? `Charity organization marketing photo: ${clean}.${brandNote} Professional, warm Gulf atmosphere, no text.`
    : `Charity organization professional marketing photo.${brandNote} Community, warmth, Gulf region, no text.`;

  console.log("[callDalle] prompt length:", prompt.length, "| prompt:", prompt.slice(0, 120));

  for (const model of ["gpt-image-1", "dall-e-3", "dall-e-2"] as const) {
    console.log(`[callDalle] trying model: ${model}`);
    setImgStep("loading", `إرسال الطلب إلى ${model}...`);
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, prompt, n: 1, size: "1024x1024" }),
    });
    console.log(`[callDalle] ${model} → status ${res.status}`);

    if (res.ok) {
      const json = (await res.json()) as { data: { url?: string; b64_json?: string }[] };
      const item = json.data[0];
      console.log(`[callDalle] ${model} success — has b64_json: ${!!item.b64_json}, has url: ${!!item.url}`);

      let finalUrl = item.url || "";
      let finalBase64 = item.b64_json || "";

      if (item.b64_json) {
        // Save b64 to DB immediately before upload attempt
        if (onB64Ready) {
          setImgStep("loading", "حفظ الصورة مؤقتاً في قاعدة البيانات...");
          await onB64Ready(item.b64_json).catch((e) => console.warn("[callDalle] onB64Ready failed:", e));
        }
        setImgStep("loading", "جاري رفع الصورة إلى التخزين الدائم...");
        const blob = await fetch(`data:image/png;base64,${item.b64_json}`).then((r) => r.blob());
        const safeName = assocName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
        const fileName = `generated/${safeName}_${Date.now()}.png`;

        // Retry upload up to 3 times with backoff (Supabase may be cold)
        let uploaded = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            if (attempt > 1) {
              setImgStep("loading", `إعادة رفع الصورة... (محاولة ${attempt}/3)`);
              await new Promise((r) => setTimeout(r, attempt * 1500));
            }
            const { error } = await supabase.storage
              .from("images")
              .upload(fileName, blob, { contentType: "image/png" });
            if (!error) {
              const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
              finalUrl = publicUrl;
              uploaded = true;
              console.log("[callDalle] Supabase upload OK →", publicUrl);
              break;
            }
            console.warn(`[callDalle] upload attempt ${attempt} failed:`, error.message);
          } catch (uploadErr) {
            console.warn(`[callDalle] upload attempt ${attempt} threw:`, uploadErr);
          }
        }

        if (!uploaded) {
          // Keep finalUrl empty — caller will display from base64 and show warning
          console.warn("[callDalle] all upload attempts failed — b64 fallback only");
          finalUrl = "";
        }
      }

      console.log("[callDalle] returning finalUrl type:", finalUrl.startsWith("data:") ? "data URL" : "public URL");
      setImgStep("ok", model);
      return { url: finalUrl, base64: finalBase64 };
    }

    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string };
    };
    const msg = err.error?.message ?? "";
    console.error(`[callDalle] ${model} error ${res.status} — code: ${err.error?.code} — msg: ${msg}`);

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

function textToSlides(text: string): { line: string; icon: string }[] {
  const sentences = text
    .replace(/([.؟!\n])\s*/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 4);
  return sentences.map((line) => {
    let icon = "✨";
    if (/\d/.test(line)) icon = "📊";
    else if (/تبرع|تبرع|هب|أعط|دعم/.test(line)) icon = "💚";
    else if (/صح|طب|علاج|دواء|مجانية/.test(line)) icon = "🏥";
    else if (/أسرة|عائل|أطفال/.test(line)) icon = "❤️";
    else if (/ربيع|فصل|زهر|تتفتح/.test(line)) icon = "🌸";
    else if (/ريال|مال/.test(line)) icon = "💰";
    return { line, icon };
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font;
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines.slice(0, 10); // cap lines to fit canvas
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [brandContext, setBrandContext] = useState<string>("");
  const [openaiFileId, setOpenaiFileId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0); // 0-100
  const [audioDurationSec, setAudioDurationSec] = useState(0);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  // logo overlay state (persisted in localStorage via LogoTab)
  const [logoOverlayUrl, setLogoOverlayUrl]     = useState<string>(() => localStorage.getItem("saaid_logo_overlay_url") ?? "");
  const [logoAnimation,  setLogoAnimation]       = useState<LogoAnimation>(() => (localStorage.getItem("saaid_logo_animation") as LogoAnimation | null) ?? "bounce");
  const [logoPosition,   setLogoPosition]        = useState<LogoPosition>(() => (localStorage.getItem("saaid_logo_position") as LogoPosition | null) ?? "topRight");
  // association contact data for BrandedVideo
  const [assocRegion, setAssocRegion] = useState<string>("");
  const [assocPhone,  setAssocPhone]  = useState<string>("");
  const [assocEmail,  setAssocEmail]  = useState<string>("");

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
  useEffect(() => { setAudioDurationSec(0); }, [content.video.audioUrl]);

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

        if (profileData?.pdf_url) setPdfUrl(profileData.pdf_url);
        if (profileData?.ai_brand) setBrandContext(profileData.ai_brand);
        if (profileData?.openai_file_id) setOpenaiFileId(profileData.openai_file_id);

        // Load association contact fields (phone, email, region)
        const assocData = await associationsDb.get(user.id);
        if (assocData?.phone)  setAssocPhone(assocData.phone);
        if (assocData?.email)  setAssocEmail(assocData.email);
        if (assocData?.region) setAssocRegion(assocData.region);

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
    if (which === "logo") return; // logo tab has no AI generation
    if (!context) {
      toast.error("أكمل ملف الجمعية أولاً");
      return;
    }

    const startingId = activeId;
    const isNew = startingId === null || startingId === TEMP_ID;
    const tabLabel = which === "all" ? "4 أنواع" : (TABS.find((t) => t.key === which)?.label ?? "");

    initSteps([
      isNew && !regen ? "إنشاء سجل فارغ" : "حفظ البرومت",
      `توليد ${tabLabel} بالذكاء الاصطناعي`,
      "حفظ المحتوى في قاعدة البيانات",
      "اكتمل التوليد",
    ]);
    setLoading(which);

    let currentId = startingId;

    try {
      // Step 0: Create DB record first (if new)
      if (isNew && !regen) {
        console.log("[generate] creating DB record for user:", user!.id);
        let saved = null;
        let createErr: string | null = null;
        try {
          saved = await contentGenerationsDb.create(user!.id, prompt.trim() || "توليد عام", EMPTY);
        } catch (dbErr) {
          createErr = dbErr instanceof Error ? dbErr.message : String(dbErr);
          console.error("[generate] DB create failed:", createErr);
        }

        if (saved) {
          currentId = saved.id;
          setHistory((prev) => [saved, ...prev.filter((h) => h.id !== TEMP_ID)]);
          setActiveId(saved.id);
          persist(EMPTY, prompt, saved.id);
          advanceStep(0, `سجل #${saved.id}`);
        } else {
          markStep(0, "error", createErr ?? "فشل إنشاء السجل");
          toast.error(`فشل حفظ الجلسة في قاعدة البيانات: ${createErr ?? "خطأ غير معروف"}`);
          return;
        }
      } else {
        // Existing record: only update prompt in DB if it actually changed
        const promptToSave = prompt.trim() || "توليد عام";
        const savedPrompt = history.find((h) => h.id === currentId)?.prompt ?? "";
        if (promptToSave !== savedPrompt) {
          try {
            await Promise.race([
              contentGenerationsDb.updatePrompt(currentId as number, promptToSave),
              new Promise<void>((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000)),
            ]);
            setHistory((prev) =>
              prev.map((h) => (h.id === currentId ? { ...h, prompt: promptToSave } : h)),
            );
            advanceStep(0, "تم حفظ البرومت");
          } catch {
            // Don't block generation on prompt-save failure
            advanceStep(0, "البرومت محلي فقط");
          }
        } else {
          advanceStep(0, "البرومت لم يتغير");
        }
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

      // Step 2: DB Update (8s timeout — never blocks completion)
      if (currentId && currentId > 0) {
        try {
          await Promise.race([
            contentGenerationsDb.update(currentId, next),
            new Promise<void>((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
          ]);
          setHistory((prev) => prev.map((h) => (h.id === currentId ? { ...h, content: next } : h)));
          persist(next, prompt, currentId);
          advanceStep(2, "تم الحفظ");
        } catch (dbErr) {
          console.error("[generate] DB update failed:", dbErr instanceof Error ? dbErr.message : dbErr);
          setHistory((prev) => prev.map((h) => (h.id === currentId ? { ...h, content: next } : h)));
          persist(next, prompt, currentId);
          markStep(2, "warn", `فشل الحفظ - ${dbErr instanceof Error ? dbErr.message : "خطأ"}`);
        }
      } else {
        persist(next, prompt, null);
        markStep(2, "warn", "محفوظ محلياً فقط");
      }

      // Step 3: complete
      markStep(3, "ok");
      toast.success(which === "all" ? "تم توليد المحتوى الكامل!" : `تم توليد ${tabLabel}!`);

      // Auto-generate TTS in background for video tab
      const videoNeedsAudio =
        (which === "video" || which === "all") &&
        next.video?.text &&
        !next.video?.audioUrl &&
        currentId && currentId > 0;
      if (videoNeedsAudio) {
        generateTTSAndSave(next.video.text, currentId as number, next).catch(console.error);
      }
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

    const stepLabels = (openaiFileId || pdfUrl) && !brandContext
      ? ["إعداد الوصف", "استخراج الهوية البصرية من الملف", "توليد الصورة", "حفظ في السجل"]
      : ["إعداد الوصف", "توليد الصورة", "حفظ في السجل"];

    initSteps(stepLabels);
    setImgLoading(tab);

    try {
      // Wake up Supabase before long AI call
      supabase.from("content_generations").select("id").limit(1).then(() => {}).catch(() => {});
      advanceStep(0, "الوصف جاهز");

      let activeBrand = brandContext;
      if (!activeBrand && (openaiFileId || pdfUrl)) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
        if (apiKey) {
          // Prefer saved OpenAI file ID (no re-upload) over re-downloading from Supabase
          activeBrand = openaiFileId
            ? await extractBrandFromFileId(openaiFileId, apiKey)
            : await extractBrandFromPdf(pdfUrl!, apiKey);
          if (activeBrand) {
            setBrandContext(activeBrand);
            if (user) assocProfileDb.saveBrand(user.id, activeBrand).catch(console.error);
          }
        }
        advanceStep(1, activeBrand ? "تم استخراج الهوية البصرية" : "تعذّر الاستخراج، سيتم التوليد بدونه");
      }

      const imgStepIdx = stepLabels.length - 2;
      const { url, base64 } = await callDalle(
        desc,
        assocName,
        (status, detail) => {
          setSteps((prev) => prev.map((s, i) => (i === imgStepIdx ? { ...s, status, detail } : s)));
        },
        activeBrand,
        activeId && activeId > 0
          ? async (b64) => {
              const interim: GeneratedContent = {
                ...content,
                [tab]: { ...content[tab], imageUrl: "", imageBase64: b64 },
              };
              await contentGenerationsDb.update(activeId, interim);
              setContent(interim);
            }
          : undefined,
      );

      const uploadedToCloud = !!url;
      console.log("✅ image generated — cloud:", uploadedToCloud, "url:", url?.slice(0, 60));

      // If storage upload failed, display from base64 but don't store data URL in DB
      const displaySrc = url || (base64 ? `data:image/png;base64,${base64}` : "");
      const next: GeneratedContent = {
        ...content,
        [tab]: {
          ...content[tab],
          imageUrl: uploadedToCloud ? url : "",
          imageBase64: uploadedToCloud ? "" : (base64 || ""), // clear b64 once cloud URL exists
        },
      };
      setContent(next);
      if (displaySrc) setImages((prev) => ({ ...prev, [tab]: displaySrc }));
      advanceStep(imgStepIdx, uploadedToCloud ? "تم الرفع" : "محلي فقط — التحميل فشل");

      const dbStepIdx = imgStepIdx + 1;
      if (activeId && activeId > 0) {
        try {
          await contentGenerationsDb.update(activeId, next);
          setHistory((prev) => prev.map((h) => (h.id === activeId ? { ...h, content: next } : h)));
          persist(next, prompt, activeId);
          markStep(dbStepIdx, uploadedToCloud ? "ok" : "warn",
            uploadedToCloud ? `السجل #${activeId}` : "الصورة b64 محلياً — أعد التوليد لرفعها");
        } catch (dbErr) {
          console.warn("DB Update failed/timeout on genImage", dbErr);
          persist(next, prompt, activeId);
          markStep(dbStepIdx, "warn", "فشل الحفظ في DB — محفوظ محلياً");
        }
      } else {
        persist(next, prompt, null);
        markStep(dbStepIdx, "warn", "محفوظة محلياً فقط");
      }

      toast.success(uploadedToCloud ? "تم توليد الصورة وحفظها!" : "تم التوليد — الصورة مؤقتة (فشل الرفع)");
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

  // ── TTS: generate audio + upload to Supabase + save to DB ───
  async function generateTTSAndSave(
    text: string,
    recordId: number,
    currentContent: GeneratedContent,
  ) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
    console.log("[TTS] starting, apiKey present:", !!apiKey, "text length:", text.length, "recordId:", recordId);
    if (!apiKey) { console.error("[TTS] no API key"); return; }
    try {
      toast.info("جاري توليد الصوت...", { duration: 3000 });
      console.log("[TTS] calling OpenAI TTS...");
      const buffer = await generateTTS(text, apiKey);
      console.log("[TTS] got buffer size:", buffer.byteLength);
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const safeAssoc = (assocName ?? "assoc").replace(/\s+/g, "_").slice(0, 20);
      const fileName = `audio/${safeAssoc}_${recordId}_${Date.now()}.mp3`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(fileName, blob, { contentType: "audio/mpeg", upsert: true });
      if (upErr) { console.error("TTS upload failed:", upErr.message); return; }
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      const audioUrl = urlData?.publicUrl ?? "";
      if (!audioUrl) return;
      const next: GeneratedContent = {
        ...currentContent,
        video: { ...currentContent.video, audioUrl },
      };
      console.log("[TTS] saving to DB, recordId:", recordId);
      try {
        await Promise.race([
          contentGenerationsDb.update(recordId, next),
          new Promise<void>((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
        ]);
        console.log("[TTS] DB save ok");
      } catch (dbErr) {
        console.error("[TTS] DB save failed:", dbErr);
      }
      setContent(next);
      setHistory((prev) => prev.map((h) => (h.id === recordId ? { ...h, content: next } : h)));
      persist(next, prompt, recordId);
      toast.success("تم توليد الصوت وحفظه! 🔊");
    } catch (e) {
      console.error("[TTS] failed:", e instanceof Error ? e.message : e);
      toast.error("فشل توليد الصوت — تحقق من الـ console");
    }
  }

  // ── Save edited video text from VideoEditorModal ──────────
  async function handleVideoEditorSave(
    newText: string,
    slideFrames: number[],
    showLogo: boolean,
  ) {
    const textChanged = newText !== content.video.text;
    const next: GeneratedContent = {
      ...content,
      video: {
        ...content.video,
        text: newText,
        slideFrames,
        showLogo,
        // clear audio only if text changed (needs re-TTS)
        audioUrl: textChanged ? undefined : content.video.audioUrl,
      },
    };
    setContent(next);
    persist(next, prompt, activeId);
    if (activeId && activeId > 0) {
      contentGenerationsDb.update(activeId, next).catch(console.error);
      setHistory((prev) => prev.map((h) => (h.id === activeId ? { ...h, content: next } : h)));
      if (textChanged) {
        generateTTSAndSave(newText, activeId, next).catch(console.error);
      }
    }
    toast.success("تم حفظ التعديلات!");
  }

  // ── Download image ────────────────────────────────────────
  async function downloadImage(url: string, name = "generated-image.png") {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = obj;
      a.download = name;
      a.click();
      URL.revokeObjectURL(obj);
    } catch {
      toast.error("فشل تنزيل الصورة");
    }
  }

  // ── Render video (canvas + MediaRecorder) ─────────────────
  async function renderVideo() {
    if (!content.video.text) {
      toast.error("يجب توليد نص الفيديو أولاً");
      return;
    }
    if (!activeId || activeId <= 0) {
      toast.error("يجب حفظ المحتوى في قاعدة البيانات أولاً");
      return;
    }

    setVideoLoading(true);
    setVideoProgress(0);

    initSteps([
      "إنشاء الفيديو في المتصفح...",
      "رفع الفيديو للسحابة...",
      "حفظ في قاعدة البيانات...",
      "اكتمل",
    ]);

    try {
      const W = 1080, H = 1080, FPS = 30;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Pre-load background image
      let bgImg: HTMLImageElement | null = null;
      const bgUrl = images["video"] || images["post"] || images["story"] || images["donation"];
      if (bgUrl && !bgUrl.startsWith("data:")) {
        try {
          bgImg = new Image();
          bgImg.crossOrigin = "anonymous";
          await new Promise<void>((res) => {
            bgImg!.onload = () => res();
            bgImg!.onerror = () => { bgImg = null; res(); };
            bgImg!.src = bgUrl;
          });
        } catch { bgImg = null; }
      }

      // Load Arabic font
      const font = new FontFace("Tajawal", "url(https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1l7A.woff2)");
      try { await font.load(); document.fonts.add(font); } catch { /* fallback */ }

      // ── Load + setup audio (TTS + ambient music) ─────────────
      let audioCtx: AudioContext | null = null;
      let audioDuration = 0;
      let audioSource: AudioBufferSourceNode | null = null;
      let musicSource: AudioBufferSourceNode | null = null;
      var combinedStream: MediaStream | undefined;
      const audioUrl = content.video.audioUrl;

      const slides0 = textToSlides(content.video.text);
      const estimatedDuration = (slides0.length * 90 + 60) / FPS;

      try {
        audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();

        // TTS
        if (audioUrl) {
          try {
            const ab = await fetch(audioUrl).then((r) => r.arrayBuffer());
            const tsBuf = await audioCtx.decodeAudioData(ab);
            audioDuration = tsBuf.duration;
            audioSource = audioCtx.createBufferSource();
            audioSource.buffer = tsBuf;
            const ttsGain = audioCtx.createGain();
            ttsGain.gain.value = 1.0;
            audioSource.connect(ttsGain);
            ttsGain.connect(dest);
            ttsGain.connect(audioCtx.destination);
          } catch (e) {
            console.warn("TTS load failed:", e);
          }
        }

        // Ambient music
        const musicDuration = audioDuration > 0 ? audioDuration + 2 : estimatedDuration + 2;
        const musicBuf = generateAmbientMusic(audioCtx, musicDuration);
        musicSource = audioCtx.createBufferSource();
        musicSource.buffer = musicBuf;
        const musicGain = audioCtx.createGain();
        musicGain.gain.value = audioUrl ? 0.32 : 0.62;
        musicSource.connect(musicGain);
        musicGain.connect(dest);

        const videoTrack = canvas.captureStream(FPS).getVideoTracks()[0];
        const audioTrack = dest.stream.getAudioTracks()[0];
        combinedStream = new MediaStream([videoTrack, audioTrack]);
      } catch (e) {
        console.warn("Audio setup failed, recording without audio:", e);
        audioCtx = null;
        musicSource = null;
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recordStream = combinedStream ?? canvas.captureStream(FPS);
      const recorder = new MediaRecorder(recordStream, { mimeType, videoBitsPerSecond: 5_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      recorder.start(100);
      if (audioSource && audioCtx) audioSource.start(0);
      if (musicSource && audioCtx) musicSource.start(0);
      advanceStep(0);

      const name = assocName ?? "الجمعية";
      const initial = name[0] || "ج";
      const slides = textToSlides(content.video.text);
      const SLIDE_F = 90;
      const OUTRO_F = 60;
      const slidesTotal = slides.length * SLIDE_F;
      const dynamicTotal = audioCtx && audioDuration > 0
        ? Math.ceil(audioDuration * FPS) + 30
        : slidesTotal + OUTRO_F;
      const TOTAL = Math.max(dynamicTotal, 120);

      function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
      function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

      await new Promise<void>((resolve) => {
        let frame = 0;
        function drawFrame() {
          // ── Global alpha ──────────────────────────────────────
          const exitOp = frame > TOTAL - 20 ? clamp01((TOTAL - frame) / 20) : 1;
          const headerOp = clamp01(frame / 20);

          // ── Which slide ───────────────────────────────────────
          const rawSlideIdx = Math.floor(frame / SLIDE_F);
          const slideIdx = Math.min(rawSlideIdx, slides.length - 1);
          const slideFrame = frame - slideIdx * SLIDE_F;
          const fadeIn  = clamp01(slideFrame / 18);
          const fadeOut = slideFrame > 72 ? clamp01((90 - slideFrame) / 18) : 1;
          const slideOp = Math.min(fadeIn, fadeOut);
          const slideY  = (1 - easeInOut(clamp01(slideFrame / 18))) * 28;
          const slide   = slides[slideIdx] ?? { line: content.video.text, icon: "✨" };

          // ── Background ────────────────────────────────────────
          ctx.globalAlpha = exitOp;
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, "#0f3d26");
          grad.addColorStop(0.55, "#1a5c3a");
          grad.addColorStop(1, "#0d3322");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
          if (bgImg) {
            ctx.globalAlpha = exitOp * 0.18;
            ctx.drawImage(bgImg, 0, 0, W, H);
          }

          // ── Gold top bar ──────────────────────────────────────
          ctx.globalAlpha = headerOp * exitOp;
          const barG = ctx.createLinearGradient(0, 0, W, 0);
          barG.addColorStop(0, "#c9a84c"); barG.addColorStop(0.5, "#e8c96e"); barG.addColorStop(1, "#c9a84c");
          ctx.fillStyle = barG;
          ctx.fillRect(0, 0, W, 10);

          // ── Header: avatar + name ─────────────────────────────
          ctx.globalAlpha = headerOp * exitOp;
          // Avatar
          const avG = ctx.createLinearGradient(60, 36, 124, 100);
          avG.addColorStop(0, "#c9a84c"); avG.addColorStop(1, "#e8c96e");
          ctx.fillStyle = avG;
          ctx.beginPath(); ctx.roundRect(60, 36, 64, 64, 15); ctx.fill();
          ctx.fillStyle = "#1a5c3a";
          ctx.font = "bold 30px Tajawal, Cairo, sans-serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(initial, 92, 68);
          // Name
          ctx.fillStyle = "white";
          ctx.font = "bold 36px Tajawal, Cairo, sans-serif";
          ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
          ctx.fillText(name, W - 60, 82);
          ctx.fillStyle = "rgba(201,168,76,0.65)";
          ctx.font = "500 20px Tajawal, Cairo, sans-serif";
          ctx.fillText("ساعِد · SAAID PLATFORM", W - 60, 108);
          // Divider
          ctx.fillStyle = "#c9a84c";
          ctx.fillRect(W - 60 - 70, 148, 70, 3);

          // ── Slide content ─────────────────────────────────────
          ctx.globalAlpha = slideOp * exitOp;
          const cy = H / 2 + slideY;

          // Icon circle
          ctx.fillStyle = "rgba(201,168,76,0.15)";
          ctx.beginPath(); ctx.arc(W / 2, cy - 120, 80, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(201,168,76,0.35)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(W / 2, cy - 120, 80, 0, Math.PI * 2); ctx.stroke();
          ctx.font = "68px serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "white";
          ctx.fillText(slide.icon, W / 2, cy - 120);

          // Sentence text (wrapped)
          ctx.font = "700 44px Tajawal, Cairo, sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.93)";
          ctx.textAlign = "center"; ctx.textBaseline = "top";
          const wrapped = wrapText(ctx, slide.line, W - 160, "700 44px Tajawal, Cairo, sans-serif");
          const lineH = 64;
          const textTop = cy - 30;
          wrapped.forEach((ln, i) => ctx.fillText(ln, W / 2, textTop + i * lineH));

          // ── Slide dots ────────────────────────────────────────
          ctx.globalAlpha = headerOp * exitOp;
          const dotY = H - 55;
          const dotTotal = slides.length * 12 + (slides.length - 1) * 10;
          let dotX = (W - dotTotal) / 2;
          slides.forEach((_, i) => {
            const active = i === slideIdx;
            ctx.fillStyle = active ? "#c9a84c" : "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.roundRect(dotX, dotY, active ? 24 : 10, 10, 5);
            ctx.fill();
            dotX += (active ? 24 : 10) + 10;
          });

          // Counter
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.font = "500 22px Tajawal, Cairo, sans-serif";
          ctx.textAlign = "right"; ctx.textBaseline = "middle";
          ctx.fillText(`${slideIdx + 1} / ${slides.length}`, W - 60, H - 30);

          ctx.globalAlpha = 1;
          frame++;
          setVideoProgress(Math.round((frame / TOTAL) * 70));
          if (frame < TOTAL) {
            setTimeout(drawFrame, 1000 / FPS);
          } else {
            resolve();
          }
        }
        drawFrame();
      });

      recorder.stop();
      markStep(0, "ok", "تم إنشاء الفيديو");
      advanceStep(1);

      const blob = await done;

      // Upload to Supabase Storage
      const safeAssoc = (assocName ?? "assoc").replace(/\s+/g, "_").slice(0, 20);
      const fileName = `videos/${safeAssoc}_${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(fileName, blob, { contentType: mimeType, upsert: false });

      let videoUrl = "";
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
        videoUrl = urlData?.publicUrl ?? "";
        markStep(1, "ok", "تم الرفع");
      } else {
        markStep(1, "warn", "فشل الرفع — تنزيل محلي فقط");
        // Still let user download locally
        const obj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = obj;
        a.download = `video_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(obj);
      }

      advanceStep(2);

      // Save videoUrl to DB
      if (videoUrl && activeId && activeId > 0) {
        const next: GeneratedContent = {
          ...content,
          video: { ...content.video, videoUrl },
        };
        try {
          await contentGenerationsDb.update(activeId, next);
          setContent(next);
          setHistory((prev) => prev.map((h) => (h.id === activeId ? { ...h, content: next } : h)));
          persist(next, prompt, activeId);
          markStep(2, "ok", `#${activeId}`);
        } catch {
          markStep(2, "warn", "فشل الحفظ في DB");
        }
      } else {
        markStep(2, "warn", "لا رابط للحفظ");
      }

      markStep(3, "ok", "اكتمل");
      setVideoProgress(100);
      toast.success(videoUrl ? "تم إنشاء الفيديو وحفظه!" : "تم إنشاء الفيديو (محلي فقط)");

      // Trigger download if we have a cloud URL
      if (videoUrl) {
        await downloadImage(videoUrl, `video_${Date.now()}.webm`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ في توليد الفيديو";
      toast.error(msg);
      setSteps((prev) =>
        prev.map((s) => (s.status === "loading" ? { ...s, status: "error", detail: msg } : s)),
      );
    } finally {
      setVideoLoading(false);
    }
  }

  // ── Derived ──────────────────────────────────────────────
  const anyTabHasContent = Object.values(content).some((v) => !!v.text);
  const showTabsPanel = anyTabHasContent || loading !== null || tab === "logo";
  const isLogoTab = tab === "logo";
  const contentTab = isLogoTab ? "post" : tab; // safe fallback for content[tab]
  const tabContent = content[contentTab as keyof typeof content];
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

                  {/* ── Logo tab: full-width standalone UI ── */}
                  {isLogoTab && (
                    <LogoTab
                      assocId={String(activeId ?? "guest")}
                      assocName={assocName ?? "الجمعية"}
                      onLogoChange={(url, anim, pos) => {
                        setLogoOverlayUrl(url);
                        setLogoAnimation(anim);
                        setLogoPosition(pos);
                      }}
                    />
                  )}

                  {!isLogoTab && tabLoading && !tabContent.text && <Skeleton />}

                  {!isLogoTab && tabLoading && !!tabContent.text && (
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

                  {!isLogoTab && !tabLoading && !tabContent.text && (
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

                  {!isLogoTab && !!tabContent.text && (
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
                          {(!activeId || activeId <= 0) && tabContent.visualDesc && (
                            <div style={{
                              marginBottom: 10, padding: "8px 13px", borderRadius: 9,
                              background: "#fffbeb", border: "1px solid #fde68a",
                              fontSize: ".73rem", color: "#92400e",
                              display: "flex", alignItems: "center", gap: 6,
                            }}>
                              ⚠️ يجب حفظ المحتوى في قاعدة البيانات أولاً قبل توليد الصورة
                            </div>
                          )}
                          <button
                            className="cg-imgbtn"
                            onClick={genImage}
                            disabled={imgLoading !== null || !tabContent.visualDesc || !activeId || activeId <= 0}
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
                                !tabContent.visualDesc || imgLoading !== null || !activeId || activeId <= 0
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily: "'Tajawal',Cairo,sans-serif",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 9,
                              transition: "all .2s",
                              opacity: (imgLoading !== null && imgLoading !== tab) || !activeId || activeId <= 0 ? 0.4 : 1,
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

                          {/* No image yet: show visual desc hint */}
                          {!images[tab] && tabContent.visualDesc && activeId && activeId > 0 && imgLoading !== tab && (
                            <div style={{
                              marginTop: 10, padding: "10px 14px", borderRadius: 10,
                              background: "#f8fafc", border: "1.5px dashed #e2e8f0",
                              fontSize: ".75rem", color: "#64748b", lineHeight: 1.65,
                            }}>
                              <span style={{ fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>
                                وصف الصورة المقترح:
                              </span>
                              <span style={{ fontStyle: "italic" }}>{tabContent.visualDesc}</span>
                            </div>
                          )}

                          {/* Has image */}
                          {images[tab] && (
                            <div>
                              {/* b64-only warning */}
                              {images[tab].startsWith("data:") && (
                                <div style={{
                                  marginBottom: 8, padding: "7px 12px", borderRadius: 8,
                                  background: "#fffbeb", border: "1px solid #fde68a",
                                  fontSize: ".72rem", color: "#92400e",
                                  display: "flex", alignItems: "center", gap: 6,
                                }}>
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
                                الصورة المُولَّدة · {images[tab].startsWith("data:") ? "مؤقتة" : "محفوظة في السجل"}
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
                              {/* Download image button */}
                              <button
                                onClick={() => downloadImage(images[tab]!, `image_${tab}_${Date.now()}.png`)}
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
                      )}

                      {/* ── Video tab: Remotion preview + render ── */}
                      {tab === "video" && tabContent.text && (
                        <div style={{ marginTop: 8, marginBottom: 16 }}>
                          {/* Remotion Player preview */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                fontSize: ".7rem",
                                fontWeight: 700,
                                color: "#475569",
                                textTransform: "uppercase",
                                letterSpacing: ".05em",
                              }}
                            >
                              معاينة الفيديو (Remotion)
                            </div>
                            <button
                              onClick={() => setVideoEditorOpen(true)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 9,
                                border: "1.5px solid #c9a84c",
                                background: "linear-gradient(135deg,#78350f,#92400e)",
                                color: "#fde68a",
                                fontSize: ".78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "'Tajawal',Cairo,sans-serif",
                                boxShadow: "0 2px 10px rgba(201,168,76,.2)",
                                transition: "all .15s",
                              }}
                            >
                              <span>✏️</span> تعديل الفيديو
                            </button>
                          </div>
                          <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}>
                            {(() => {
                              const sf = content.video.slideFrames
                                ?? Array(textToSlides(tabContent.text).length).fill(90);
                              const dur = computeBrandedVideoDuration(sf);
                              const mood = parseBrandMood(brandContext);
                              const resolvedTransition: TransitionStyle =
                                (content.video.transitionStyle as TransitionStyle | undefined)
                                ?? moodToTransition(mood);
                              const brandCols = parseBrandColors(brandContext);
                              return (
                                <div dir="ltr" style={{ borderRadius: 14, overflow: "hidden" }}>
                                  <Player
                                    component={BrandedVideo}
                                    inputProps={{
                                      text: tabContent.text,
                                      assocName: assocName ?? "الجمعية",
                                      assocInitial: assocName ? assocName[0] : "ج",
                                      assocRegion,
                                      assocPhone,
                                      assocEmail,
                                      imageUrl: images["video"] || images["post"] || images["story"] || images["donation"],
                                      audioUrl: content.video.audioUrl,
                                      logoUrl: logoOverlayUrl || undefined,
                                      aiBrand: brandContext || undefined,
                                      brandColors: [brandCols.primary, brandCols.secondary, brandCols.accent],
                                      transitionStyle: resolvedTransition,
                                      slideFrames: sf,
                                      showLogo: content.video.showLogo ?? true,
                                      showOutro: content.video.showOutro ?? true,
                                    }}
                                    durationInFrames={dur}
                                    compositionWidth={1080}
                                    compositionHeight={1080}
                                    fps={30}
                                    numberOfSharedAudioTags={5}
                                    style={{ width: "100%", aspectRatio: "1" }}
                                    controls
                                  />
                                </div>
                              );
                            })()}
                          </div>

                          {/* Audio status */}
                          <div style={{
                            marginTop: 10, padding: "10px 14px", borderRadius: 10,
                            background: content.video.audioUrl ? "#f0fdf4" : "#fafafa",
                            border: `1.5px solid ${content.video.audioUrl ? "#bbf7d0" : "#e2e8f0"}`,
                            fontSize: ".76rem",
                            display: "flex", alignItems: "center", gap: 8,
                            color: content.video.audioUrl ? "#15803d" : "#94a3b8",
                          }}>
                            <span>{content.video.audioUrl ? "🔊" : "⏳"}</span>
                            {content.video.audioUrl ? (
                              <>
                                <span>صوت عربي جاهز · </span>
                                <audio
                                  controls
                                  src={content.video.audioUrl}
                                  style={{ height: 24, flex: 1 }}
                                  onLoadedMetadata={(e) => setAudioDurationSec((e.target as HTMLAudioElement).duration)}
                                />
                              </>
                            ) : (
                              <span>جاري توليد الصوت تلقائياً بعد توليد النص...</span>
                            )}
                          </div>

                          {/* Saved video link */}
                          {content.video.videoUrl && (
                            <div style={{
                              marginTop: 6, padding: "10px 14px", borderRadius: 10,
                              background: "#f0fdf4", border: "1.5px solid #bbf7d0",
                              fontSize: ".76rem", color: "#15803d",
                              display: "flex", alignItems: "center", gap: 8,
                            }}>
                              <span>✅</span>
                              <span>فيديو محفوظ · </span>
                              <a
                                href={content.video.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#16a34a", fontWeight: 700, textDecoration: "underline" }}
                              >
                                عرض / تنزيل
                              </a>
                            </div>
                          )}

                          {/* Progress bar */}
                          {videoLoading && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{
                                fontSize: ".72rem", color: "#64748b", marginBottom: 6,
                                display: "flex", justifyContent: "space-between",
                              }}>
                                <span>جاري إنشاء الفيديو...</span>
                                <span>{videoProgress}%</span>
                              </div>
                              <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{
                                  height: "100%",
                                  width: `${videoProgress}%`,
                                  background: "linear-gradient(90deg,#16a34a,#22c55e)",
                                  borderRadius: 3,
                                  transition: "width .3s",
                                }} />
                              </div>
                            </div>
                          )}

                          {/* Render button */}
                          <button
                            onClick={renderVideo}
                            disabled={videoLoading || !activeId || activeId <= 0}
                            style={{
                              marginTop: 12,
                              width: "100%",
                              padding: "14px 0",
                              borderRadius: 12,
                              border: "2px dashed #bbf7d0",
                              background: "#f0fdf4",
                              color: "#16a34a",
                              fontSize: ".84rem",
                              fontWeight: 700,
                              cursor: videoLoading || !activeId || activeId <= 0 ? "not-allowed" : "pointer",
                              fontFamily: "'Tajawal',Cairo,sans-serif",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 9,
                              opacity: videoLoading || !activeId || activeId <= 0 ? 0.5 : 1,
                              transition: "all .2s",
                            }}
                          >
                            {videoLoading ? (
                              <><Spin size={14} light={false} /> جاري إنشاء الفيديو...</>
                            ) : (
                              <><span>🎬</span> {content.video.videoUrl ? "إعادة توليد الفيديو" : "توليد الفيديو وتنزيله"}</>
                            )}
                          </button>
                          {(!activeId || activeId <= 0) && (
                            <div style={{
                              marginTop: 8, padding: "7px 12px", borderRadius: 8,
                              background: "#fffbeb", border: "1px solid #fde68a",
                              fontSize: ".71rem", color: "#92400e",
                            }}>
                              ⚠️ يجب حفظ المحتوى في قاعدة البيانات أولاً قبل توليد الفيديو
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

      {/* ── Video Editor Modal ── */}
      {videoEditorOpen && content.video.text && (
        <VideoEditorModal
          text={content.video.text}
          assocName={assocName ?? "الجمعية"}
          assocInitial={assocName ? assocName[0] : "ج"}
          assocRegion={assocRegion}
          assocPhone={assocPhone}
          assocEmail={assocEmail}
          imageUrl={images["video"] || images["post"] || images["story"] || images["donation"]}
          audioUrl={content.video.audioUrl}
          logoUrl={logoOverlayUrl || undefined}
          aiBrand={brandContext || undefined}
          initialSlideFrames={content.video.slideFrames}
          initialShowLogo={content.video.showLogo ?? true}
          initialTransitionStyle={(content.video.transitionStyle as TransitionStyle | undefined) ?? "slide"}
          initialShowOutro={content.video.showOutro ?? true}
          onSave={handleVideoEditorSave}
          onClose={() => setVideoEditorOpen(false)}
        />
      )}
    </>
  );
}
