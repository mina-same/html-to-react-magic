import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  getLogoTransform,
  POSITION_OFFSETS,
  type LogoAnimation,
  type LogoPosition,
} from "./logoAnimations";

export interface ContentVideoProps {
  text: string;
  assocName: string;
  assocInitial?: string;
  imageUrl?: string;
  audioUrl?: string;
  slideFrames?: number[]; // per-slide duration in frames; defaults to 90 (3s)
  showLogo?: boolean;
  // custom logo overlay (uploaded by user)
  logoOverlayUrl?: string;
  logoAnimation?: LogoAnimation;
  logoPosition?: LogoPosition;
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

// ── Background layer ─────────────────────────────────────────
function BackgroundLayer({ imageUrl }: { imageUrl?: string }) {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0f3d26 0%, #1a5c3a 55%, #0d3322 100%)",
      }}
    >
      {imageUrl && (
        <Img
          src={imageUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}
        />
      )}
    </AbsoluteFill>
  );
}

// ── Logo / header layer ──────────────────────────────────────
function LogoLayer({
  assocName,
  assocInitial,
}: {
  assocName: string;
  assocInitial: string;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames - 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity: op }}>
      {/* Gold top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: "linear-gradient(90deg,#c9a84c,#e8c96e,#c9a84c)",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 60,
          left: 60,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 15,
            flexShrink: 0,
            background: "linear-gradient(135deg,#c9a84c,#e8c96e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.7rem",
            fontWeight: 800,
            color: "#1a5c3a",
          }}
        >
          {assocInitial}
        </div>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>
            {assocName}
          </div>
          <div
            style={{
              fontSize: ".8rem",
              color: "rgba(201,168,76,.65)",
              letterSpacing: "0.16em",
              marginTop: 3,
            }}
          >
            ساعِد · SAAID PLATFORM
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: 148,
          right: 60,
          width: 70,
          height: 3,
          background: "#c9a84c",
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
}

// ── Slide dots indicator ─────────────────────────────────────
function SlideDotsLayer({
  slideCount,
  slideIdx,
}: {
  slideCount: number;
  slideIdx: number;
}) {
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 54,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {Array.from({ length: slideCount }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideIdx ? 22 : 8,
              height: 8,
              borderRadius: 4,
              background: i === slideIdx ? "#c9a84c" : "rgba(255,255,255,.3)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 60,
          fontSize: ".75rem",
          color: "rgba(255,255,255,.3)",
          letterSpacing: "0.1em",
        }}
      >
        {slideIdx + 1} / {slideCount}
      </div>
    </AbsoluteFill>
  );
}

// ── Single slide content ─────────────────────────────────────
function SlideContent({
  line,
  icon,
  slideDuration,
}: {
  line: string;
  icon: string;
  slideDuration: number;
}) {
  const frame = useCurrentFrame();
  const FADE = 18;

  const fadeIn = interpolate(frame, [0, FADE], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [slideDuration - FADE, slideDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = Math.min(fadeIn, fadeOut);
  const slideY = interpolate(frame, [0, FADE], [28, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "180px 70px 130px",
        opacity: op,
        transform: `translateY(${slideY}px)`,
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "rgba(201,168,76,.15)",
          border: "2px solid rgba(201,168,76,.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
          boxShadow: "0 0 40px rgba(201,168,76,.2)",
        }}
      >
        <Img src={emojiToTwemojiUrl(icon)} style={{ width: 68, height: 68 }} />
      </div>

      {/* Text */}
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "white",
          textAlign: "center",
          lineHeight: 1.8,
          textShadow: "0 2px 12px rgba(0,0,0,.5)",
          maxWidth: 860,
          direction: "rtl",
          fontFamily: "'Tajawal','Cairo',sans-serif",
        }}
      >
        {line}
      </div>
    </AbsoluteFill>
  );
}

// ── Animated logo overlay (user-uploaded) ───────────────────
function AnimatedLogoOverlay({
  logoUrl,
  animation = "bounce",
  position = "topLeft",
}: {
  logoUrl: string;
  animation?: LogoAnimation;
  position?: LogoPosition;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { x, y, scale, rotate, opacity } = getLogoTransform(animation, frame, fps);

  // gentle idle float after spring settles
  const idle = interpolate(Math.sin(frame * 0.05), [-1, 1], [-4, 4]);

  const posStyle = POSITION_OFFSETS[position];
  // for center, adjust to account for logo size
  const centerAdj = position === "center" ? { marginTop: -60, marginLeft: -60 } : {};

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...posStyle,
          ...centerAdj,
          width: 120,
          height: 120,
          transform: `translate(${x}px, ${y + idle}px) scale(${scale}) rotate(${rotate}deg)`,
          opacity,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 6px 28px rgba(0,0,0,.45), 0 0 0 2px rgba(201,168,76,.3)",
            background: "rgba(255,255,255,.06)",
          }}
        >
          <Img
            src={logoUrl}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 10 }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Main composition ─────────────────────────────────────────
export function ContentVideo({
  text,
  assocName,
  assocInitial = "ج",
  imageUrl,
  audioUrl,
  slideFrames: slideFramesProp,
  showLogo = true,
  logoOverlayUrl,
  logoAnimation,
  logoPosition,
}: ContentVideoProps) {
  const slides = textToSlides(text);
  const slideCount = Math.max(slides.length, 1);

  // Build per-slide durations, defaulting to 90 frames (3s)
  const slideFrames: number[] = Array.from(
    { length: slideCount },
    (_, i) => slideFramesProp?.[i] ?? 90,
  );

  // Compute where each slide starts in the global timeline
  const slideStarts: number[] = slideFrames.reduce<number[]>((acc, dur, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + slideFrames[i - 1]);
    return acc;
  }, []);

  const totalSlideDur = slideFrames.reduce((a, b) => a + b, 0);
  const { durationInFrames } = useVideoConfig();

  // Which slide is active right now (for dots indicator)
  const frame = useCurrentFrame();
  let activeSlide = slideCount - 1;
  for (let i = 0; i < slideCount; i++) {
    if (frame < slideStarts[i] + slideFrames[i]) {
      activeSlide = i;
      break;
    }
  }

  return (
    <AbsoluteFill
      style={{
        fontFamily: "'Tajawal','Cairo',sans-serif",
        direction: "rtl",
        overflow: "hidden",
      }}
    >
      {/* ── Track 1: Background (full duration) ── */}
      <Sequence from={0} durationInFrames={durationInFrames} name="Background">
        <BackgroundLayer imageUrl={imageUrl} />
      </Sequence>

      {/* ── Track 2: Logo / header (full duration) ── */}
      {showLogo && (
        <Sequence from={0} durationInFrames={durationInFrames} name="Logo">
          <LogoLayer assocName={assocName} assocInitial={assocInitial} />
        </Sequence>
      )}

      {/* ── Track 3+: One Sequence per slide ── */}
      {slides.map((slide, i) => (
        <Sequence
          key={i}
          from={slideStarts[i]}
          durationInFrames={slideFrames[i]}
          name={`Slide ${i + 1}`}
        >
          <SlideContent
            line={slide.line}
            icon={slide.icon}
            slideDuration={slideFrames[i]}
          />
        </Sequence>
      ))}

      {/* ── Track: Slide dots indicator ── */}
      <Sequence from={0} durationInFrames={durationInFrames} name="Dots">
        <SlideDotsLayer slideCount={slideCount} slideIdx={activeSlide} />
      </Sequence>

      {/* ── Track: Custom logo overlay ── */}
      {logoOverlayUrl && (
        <Sequence from={0} durationInFrames={durationInFrames} name="Logo Overlay">
          <AnimatedLogoOverlay
            logoUrl={logoOverlayUrl}
            animation={logoAnimation}
            position={logoPosition}
          />
        </Sequence>
      )}

      {/* ── Track: Audio (full duration) ── */}
      {audioUrl && (
        <Sequence from={0} durationInFrames={durationInFrames} name="Audio">
          <Audio src={audioUrl} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
}
