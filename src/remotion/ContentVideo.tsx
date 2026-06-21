import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface ContentVideoProps {
  text: string;
  assocName: string;
  assocInitial?: string;
  imageUrl?: string;
  audioUrl?: string;
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
    else if (/تبرع|هب|أعط|دعم/.test(line)) icon = "💚";
    else if (/صح|طب|علاج|دواء|مجانية/.test(line)) icon = "🏥";
    else if (/أسرة|عائل|أطفال/.test(line)) icon = "❤️";
    else if (/ربيع|فصل|زهر|تتفتح/.test(line)) icon = "🌸";
    else if (/ريال|مال/.test(line)) icon = "💰";
    return { line, icon };
  });
}

function emojiToTwemojiUrl(emoji: string): string {
  const codepoints = [...emoji]
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((cp) => parseInt(cp, 16) !== 0xfe0f)
    .join("-");
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/svg/${codepoints}.svg`;
}

const SLIDE_FRAMES = 90; // 3s per slide at 30fps

export function ContentVideo({
  text,
  assocName,
  assocInitial = "ج",
  imageUrl,
  audioUrl,
}: ContentVideoProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const slides = textToSlides(text);
  const slideCount = Math.max(slides.length, 1);

  // Which slide are we on
  const slideIdx = Math.min(Math.floor(frame / SLIDE_FRAMES), slideCount - 1);
  const slideFrame = frame - slideIdx * SLIDE_FRAMES;

  // Per-slide fade + lift
  const fadeIn  = interpolate(slideFrame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(slideFrame, [72, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slideOp = Math.min(fadeIn, fadeOut);
  const slideY  = interpolate(slideFrame, [0, 18], [28, 0], { extrapolateRight: "clamp" });

  // Global header fade-in
  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Global exit fade
  const exitOp = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 4],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const slide = slides[slideIdx] ?? { line: text, icon: "✨" };

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0f3d26 0%, #1a5c3a 55%, #0d3322 100%)",
        fontFamily: "'Tajawal','Cairo',sans-serif",
        direction: "rtl",
        opacity: exitOp,
        overflow: "hidden",
      }}
    >
      {/* Voiceover */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* BG image */}
      {imageUrl && (
        <AbsoluteFill>
          <Img
            src={imageUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}
          />
        </AbsoluteFill>
      )}

      {/* Gold top bar */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 10,
          background: "linear-gradient(90deg,#c9a84c,#e8c96e,#c9a84c)",
          opacity: headerOp,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute", top: 36, right: 60, left: 60,
          display: "flex", alignItems: "center", gap: 18,
          opacity: headerOp,
        }}
      >
        <div
          style={{
            width: 62, height: 62, borderRadius: 15, flexShrink: 0,
            background: "linear-gradient(135deg,#c9a84c,#e8c96e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.7rem", fontWeight: 800, color: "#1a5c3a",
          }}
        >
          {assocInitial}
        </div>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>
            {assocName}
          </div>
          <div style={{ fontSize: ".8rem", color: "rgba(201,168,76,.65)", letterSpacing: "0.16em", marginTop: 3 }}>
            ساعِد · SAAID PLATFORM
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute", top: 148, right: 60, width: 70, height: 3,
          background: "#c9a84c", borderRadius: 2, opacity: headerOp,
        }}
      />

      {/* Slide content */}
      <AbsoluteFill
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "180px 70px 130px",
          opacity: slideOp,
          transform: `translateY(${slideY}px)`,
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 110, height: 110, borderRadius: "50%",
            background: "rgba(201,168,76,.15)",
            border: "2px solid rgba(201,168,76,.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 36,
            boxShadow: "0 0 40px rgba(201,168,76,.2)",
          }}
        >
          <Img
            src={emojiToTwemojiUrl(slide.icon)}
            style={{ width: 68, height: 68 }}
          />
        </div>

        {/* Sentence */}
        <div
          style={{
            fontSize: "2rem", fontWeight: 700, color: "white",
            textAlign: "center", lineHeight: 1.8,
            textShadow: "0 2px 12px rgba(0,0,0,.5)",
            maxWidth: 860,
          }}
        >
          {slide.line}
        </div>
      </AbsoluteFill>

      {/* Slide dots */}
      <div
        style={{
          position: "absolute", bottom: 54, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 10,
          opacity: headerOp,
        }}
      >
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideIdx ? 22 : 8,
              height: 8, borderRadius: 4,
              background: i === slideIdx ? "#c9a84c" : "rgba(255,255,255,.3)",
              transition: "all .3s",
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute", bottom: 20, right: 60,
          fontSize: ".75rem", color: "rgba(255,255,255,.3)",
          letterSpacing: "0.1em", opacity: headerOp,
        }}
      >
        {slideIdx + 1} / {slideCount}
      </div>
    </AbsoluteFill>
  );
}
