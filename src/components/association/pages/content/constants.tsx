import type { GeneratedContent, GeneratedContentItem } from "@/lib/db";

// ── Types ────────────────────────────────────────────────────
export type Tab = "post" | "story" | "donation" | "video" | "logo";

/** Keys that actually exist in `GeneratedContent` (i.e. everything except "logo"). */
export type ContentKey = "post" | "story" | "donation" | "video";

export const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "post", label: "منشور", icon: "📱" },
  { key: "story", label: "قصة", icon: "✨" },
  { key: "donation", label: "نداء تبرع", icon: "💚" },
  { key: "video", label: "سيناريو", icon: "🎬" },
  { key: "logo", label: "شعار", icon: "🏷" },
];

export const IMAGE_TABS: Tab[] = ["post", "story", "donation"];

export const EMPTY: GeneratedContent = {
  post: { text: "" },
  story: { text: "" },
  donation: { text: "" },
  video: { text: "" },
};

export const PROMPTS: Record<Tab, string> = {
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

export const LS_KEY = "saaid_content_v2";
export const TEMP_ID = -1;

// ── Step tracker ─────────────────────────────────────────────
export type StepStatus = "waiting" | "loading" | "ok" | "warn" | "error";
export interface Step {
  label: string;
  status: StepStatus;
  detail?: string;
}

// ── Spinner ──────────────────────────────────────────────────
export function Spin({ size = 15, light = true }: { size?: number; light?: boolean }) {
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
export function StepIcon({ status }: { status: StepStatus }) {
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
export function StepTracker({ steps }: { steps: Step[] }) {
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
export function Skeleton() {
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

// ── Date / content helpers ───────────────────────────────────
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDisplayableImage(item: GeneratedContentItem): string | undefined {
  if (item.imageUrl) {
    return item.imageUrl;
  }
  if (item.imageBase64) {
    return `data:image/png;base64,${item.imageBase64}`;
  }
  return undefined;
}

export function textToSlides(text: string): { line: string; icon: string }[] {
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

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] {
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

/**
 * Safely index `GeneratedContent` by a `Tab`. Returns `undefined` for the
 * "logo" tab (which has no entry in `GeneratedContent`) — this is the
 * narrowing guard that replaces the old unsafe `content[tab]` lookups.
 */
export function contentItem(content: GeneratedContent, tab: Tab): GeneratedContentItem | undefined {
  return tab === "logo" ? undefined : content[tab];
}

// Generate ambient background music using Web Audio API synthesis
export function generateAmbientMusic(audioCtx: AudioContext, duration: number): AudioBuffer {
  const sr = audioCtx.sampleRate;
  const buf = audioCtx.createBuffer(2, Math.ceil(duration * sr), sr);

  // E minor pentatonic — calm, emotional, universal
  const melody = [164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 246.94, 220.0];
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
      const padFreqs =
        chordBeat === 0
          ? [164.81, 196.0, 246.94] // Em chord
          : [174.61, 220.0, 261.63]; // Am chord
      padFreqs.forEach((f, pi) => {
        const v = [0.038, 0.03, 0.025][pi];
        const lfo = 0.96 + 0.04 * Math.sin(2 * Math.PI * 0.18 * t + pi);
        s += v * Math.sin(2 * Math.PI * f * t) * lfo;
      });

      // ── Melodic plucks — one note every 2 beats ──────────────
      const noteIdx = Math.floor(t / (beat * 2)) % melody.length;
      const notePos = (t % (beat * 2)) / (beat * 2);
      const pluckEnv = notePos < 0.015 ? notePos / 0.015 : Math.exp(-6 * (notePos - 0.015));
      const freq = melody[noteIdx];
      s += 0.055 * Math.sin(2 * Math.PI * freq * t) * pluckEnv;
      s += 0.018 * Math.sin(2 * Math.PI * freq * 2 * t) * pluckEnv; // octave harmonic

      // ── Light shimmer — high freq at low vol ─────────────────
      const shimmer =
        Math.sin(2 * Math.PI * 659.25 * t) * 0.008 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.07 * t));
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
