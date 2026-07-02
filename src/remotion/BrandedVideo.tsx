import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { noise2D } from "@remotion/noise";
import { makeCircle, makeStar } from "@remotion/shapes";
import {
  parseBrandColors,
  type BrandColors,
  type TransitionStyle,
  INTRO_DUR,
  OUTRO_DUR,
  TRANSITION_DUR,
} from "./brandUtils";

// ─── Prop types ──────────────────────────────────────────────────────────────

export interface BrandedVideoProps {
  text: string;
  assocName: string;
  assocInitial?: string;
  assocRegion?: string;
  assocPhone?: string;
  assocEmail?: string;
  imageUrl?: string;
  audioUrl?: string;
  logoUrl?: string;
  aiBrand?: string;
  brandColors?: string[];          // [primary, secondary, accent] override
  transitionStyle?: TransitionStyle;
  slideFrames?: number[];
  showLogo?: boolean;
  showOutro?: boolean;
}

// ─── Slide parsing ────────────────────────────────────────────────────────────

interface Slide { line: string; icon: string }

function textToSlides(text: string): Slide[] {
  return text
    .replace(/([.؟!\n])\s*/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 4)
    .map((line) => {
      let icon = "✨";
      if (/\d/.test(line))                     icon = "📊";
      else if (/تبرع|هب|أعط|دعم/.test(line))  icon = "💚";
      else if (/صح|طب|علاج|دواء/.test(line))  icon = "🏥";
      else if (/أسرة|عائل|أطفال/.test(line))  icon = "❤️";
      else if (/ربيع|فصل|زهر/.test(line))     icon = "🌸";
      else if (/ريال|مال/.test(line))          icon = "💰";
      return { line, icon };
    });
}

function emojiUrl(emoji: string): string {
  const cp = [...emoji]
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((x) => parseInt(x, 16) !== 0xfe0f)
    .join("-");
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/svg/${cp}.svg`;
}

// ─── Branded gradient background ─────────────────────────────────────────────

function BrandBg({
  colors,
  imageUrl,
}: {
  colors: BrandColors;
  imageUrl?: string;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bg = interpolateColors(
    frame,
    [0, durationInFrames * 0.5, durationInFrames],
    [colors.primary, colors.secondary, colors.primary],
  );

  // noise-drifted decorative circles
  const c1x = 540 + noise2D("c1x", frame / 180, 0) * 260;
  const c1y = 540 + noise2D("c1y", 0, frame / 180) * 260;
  const c2x = 540 + noise2D("c2x", frame / 220, 1) * 300;
  const c2y = 540 + noise2D("c2y", 1, frame / 220) * 300;
  const starRot = noise2D("sr", frame / 300, 0) * 30;

  const { path: circlePath } = makeCircle({ radius: 200 });
  const { path: bigCircle }  = makeCircle({ radius: 340 });
  const { path: starPath }   = makeStar({ innerRadius: 60, outerRadius: 130, points: 6 });

  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      {imageUrl && (
        <Img
          src={imageUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.12 }}
        />
      )}

      {/* Noise-drifted decorative SVG shapes */}
      <svg
        style={{ position: "absolute", inset: 0, width: 1080, height: 1080, overflow: "visible" }}
        viewBox="0 0 1080 1080"
      >
        {/* Large ambient circle behind */}
        <path
          d={bigCircle}
          fill={colors.secondary}
          opacity={0.07}
          transform={`translate(${c2x - 340}, ${c2y - 340})`}
        />
        {/* Mid circle */}
        <path
          d={circlePath}
          fill={colors.accent}
          opacity={0.06}
          transform={`translate(${c1x - 200}, ${c1y - 200})`}
        />
        {/* Rotating star accent */}
        <path
          d={starPath}
          fill={colors.secondary}
          opacity={0.1}
          transform={`translate(900, 140) rotate(${starRot}, 65, 65)`}
        />
        {/* Corner ring */}
        <circle
          cx={100}
          cy={980}
          r={180}
          fill="none"
          stroke={colors.secondary}
          strokeWidth={2}
          opacity={0.15}
        />
      </svg>

      {/* Top brand bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 8,
          background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent}, ${colors.secondary})`,
        }}
      />
    </AbsoluteFill>
  );
}

// ─── Word-by-word spring reveal ───────────────────────────────────────────────

function WordReveal({ text, color = "white" }: { text: string; color?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.3em 0.5em",
        direction: "rtl",
      }}
    >
      {words.map((word, i) => {
        const delay = i * 4;
        const wordFrame = Math.max(0, frame - delay);
        const s = spring({ frame: wordFrame, fps, config: { damping: 14, stiffness: 120 } });
        const opacity = interpolate(wordFrame, [0, 10], [0, 1], {
          extrapolateRight: "clamp",
        });
        const y = interpolate(s, [0, 1], [22, 0]);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}px)`,
              color,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

// ─── Slide header (assocName + logo) ─────────────────────────────────────────

function SlideHeader({
  assocName,
  assocInitial,
  logoUrl,
  colors,
}: {
  assocName: string;
  assocInitial: string;
  logoUrl?: string;
  colors: BrandColors;
}) {
  const frame = useCurrentFrame();
  const headerIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 36, right: 60, left: 60,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: headerIn,
        transform: `translateY(${interpolate(headerIn, [0, 1], [-12, 0])}px)`,
      }}
    >
      {/* Logo or monogram */}
      <div
        style={{
          width: 60, height: 60, borderRadius: 14, flexShrink: 0,
          background: logoUrl
            ? "transparent"
            : `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          boxShadow: `0 0 0 2px ${colors.secondary}50`,
        }}
      >
        {logoUrl ? (
          <Img src={logoUrl} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
        ) : (
          <span style={{ fontSize: "1.5rem", fontWeight: 900, color: colors.primary }}>
            {assocInitial}
          </span>
        )}
      </div>

      <div>
        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", lineHeight: 1.1 }}>
          {assocName}
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: colors.secondary,
            letterSpacing: "0.16em",
            marginTop: 3,
          }}
        >
          ساعِد · SAAID PLATFORM
        </div>
      </div>
    </div>
  );
}

// ─── Full slide scene (bg + header + word reveal + icon) ─────────────────────

function SlideScene({
  slide,
  assocName,
  assocInitial,
  logoUrl,
  colors,
  imageUrl,
  slideIndex,
  totalSlides,
}: {
  slide: Slide;
  assocName: string;
  assocInitial: string;
  logoUrl?: string;
  colors: BrandColors;
  imageUrl?: string;
  slideIndex: number;
  totalSlides: number;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const FADE = 16;

  const fadeOut = interpolate(
    frame,
    [durationInFrames - FADE, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const iconSpr = spring({ frame, fps, config: { damping: 8, stiffness: 150, mass: 0.6 } });
  const iconScale = interpolate(iconSpr, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: "'Tajawal','Cairo',sans-serif",
        direction: "rtl",
        opacity: fadeOut,
      }}
    >
      <BrandBg colors={colors} imageUrl={imageUrl} />

      <SlideHeader
        assocName={assocName}
        assocInitial={assocInitial}
        logoUrl={logoUrl}
        colors={colors}
      />

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: 148, right: 60,
          width: 70, height: 3,
          background: colors.secondary,
          borderRadius: 2,
        }}
      />

      {/* Centre content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "180px 70px 130px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 110, height: 110, borderRadius: "50%",
            background: `${colors.secondary}22`,
            border: `2px solid ${colors.secondary}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 36,
            boxShadow: `0 0 50px ${colors.secondary}30`,
            transform: `scale(${iconScale})`,
          }}
        >
          <Img src={emojiUrl(slide.icon)} style={{ width: 68, height: 68 }} />
        </div>

        {/* Word-by-word text */}
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.9,
            textAlign: "center",
            maxWidth: 860,
            textShadow: "0 2px 16px rgba(0,0,0,.5)",
          }}
        >
          <WordReveal text={slide.line} color="white" />
        </div>
      </AbsoluteFill>

      {/* Slide dots */}
      <div
        style={{
          position: "absolute",
          bottom: 54, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 10,
        }}
      >
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideIndex ? 22 : 8,
              height: 8, borderRadius: 4,
              background: i === slideIndex ? colors.secondary : "rgba(255,255,255,.3)",
              transition: "width .3s",
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 20, right: 60,
          fontSize: ".75rem",
          color: "rgba(255,255,255,.3)",
          letterSpacing: "0.1em",
        }}
      >
        {slideIndex + 1} / {totalSlides}
      </div>
    </AbsoluteFill>
  );
}

// ─── Logo stinger intro ───────────────────────────────────────────────────────

function IntroStinger({
  assocName,
  assocInitial,
  assocRegion,
  logoUrl,
  colors,
}: {
  assocName: string;
  assocInitial: string;
  assocRegion?: string;
  logoUrl?: string;
  colors: BrandColors;
}) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const spr  = spring({ frame, fps, config: { damping: 6, stiffness: 160, mass: 0.5 } });
  const scale = interpolate(spr, [0, 1], [0, 1]);
  const idle  = interpolate(Math.sin(frame * 0.06), [-1, 1], [-6, 6]);

  const textIn = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 14, stiffness: 100 } });
  const textOp = interpolate(textIn, [0, 1], [0, 1]);
  const textY  = interpolate(textIn, [0, 1], [20, 0]);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ring1 = spring({ frame, fps, config: { damping: 20, stiffness: 50 } });
  const ring2 = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 20, stiffness: 45 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colors.primary} 0%, ${colors.secondary}40 50%, ${colors.primary} 100%)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: fadeOut, overflow: "hidden",
        fontFamily: "'Tajawal','Cairo',sans-serif",
      }}
    >
      {/* Expanding rings on entry */}
      {[ring1, ring2].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width:  interpolate(r, [0, 1], [0, 900 + i * 280]),
            height: interpolate(r, [0, 1], [0, 900 + i * 280]),
            borderRadius: "50%",
            border: `1.5px solid ${colors.secondary}`,
            opacity: interpolate(r, [0, 0.4, 1], [0.6, 0.2, 0]),
          }}
        />
      ))}

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 420, height: 420, borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}20, transparent 70%)`,
        }}
      />

      {/* Logo / monogram */}
      <div
        style={{
          transform: `scale(${scale}) translateY(${idle}px)`,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 28,
        }}
      >
        <div
          style={{
            width: 200, height: 200, borderRadius: 40,
            overflow: "hidden",
            background: logoUrl ? "rgba(255,255,255,.08)" : `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 24px 72px rgba(0,0,0,.5), 0 0 0 3px ${colors.secondary}50`,
          }}
        >
          {logoUrl ? (
            <Img src={logoUrl} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 20 }} />
          ) : (
            <span style={{ fontSize: "5rem", fontWeight: 900, color: colors.primary }}>
              {assocInitial}
            </span>
          )}
        </div>

        {/* Name + region */}
        <div
          style={{
            textAlign: "center", direction: "rtl",
            opacity: textOp, transform: `translateY(${textY}px)`,
          }}
        >
          <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "white", lineHeight: 1.1 }}>
            {assocName}
          </div>
          {assocRegion && (
            <div style={{ fontSize: "1rem", color: colors.secondary, marginTop: 8, letterSpacing: ".06em" }}>
              {assocRegion}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Outro / contact card ─────────────────────────────────────────────────────

function OutroCard({
  assocName,
  assocRegion,
  assocPhone,
  assocEmail,
  logoUrl,
  assocInitial,
  colors,
}: {
  assocName: string;
  assocRegion?: string;
  assocPhone?: string;
  assocEmail?: string;
  logoUrl?: string;
  assocInitial: string;
  colors: BrandColors;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgIn = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

  const items = [
    assocPhone && { icon: "📞", text: assocPhone },
    assocEmail && { icon: "✉️", text: assocEmail },
    assocRegion && { icon: "📍", text: assocRegion },
  ].filter(Boolean) as { icon: string; text: string }[];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colors.primary}, ${colors.secondary}60)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Tajawal','Cairo',sans-serif",
        direction: "rtl", overflow: "hidden",
      }}
    >
      <BrandBg colors={colors} />

      {/* Card */}
      <div
        style={{
          background: "rgba(255,255,255,.08)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${colors.secondary}40`,
          borderRadius: 32,
          padding: "56px 72px",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 28,
          transform: `scale(${interpolate(bgIn, [0, 1], [0.85, 1])})`,
          opacity: interpolate(bgIn, [0, 1], [0, 1]),
          maxWidth: 760,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 110, height: 110, borderRadius: 24,
            overflow: "hidden",
            background: logoUrl ? "rgba(255,255,255,.06)" : `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 0 3px ${colors.secondary}40`,
          }}
        >
          {logoUrl ? (
            <Img src={logoUrl} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }} />
          ) : (
            <span style={{ fontSize: "3rem", fontWeight: 900, color: colors.primary }}>
              {assocInitial}
            </span>
          )}
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: "2.4rem", fontWeight: 900, color: "white",
            textAlign: "center", lineHeight: 1.2,
          }}
        >
          تبرّع الآن وكن شريكاً في التغيير
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80, height: 3,
            background: colors.secondary,
            borderRadius: 2,
          }}
        />

        {/* Contact items */}
        {items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignSelf: "stretch" }}>
            {items.map(({ icon, text }, i) => {
              const itemIn = spring({
                frame: Math.max(0, frame - 12 - i * 6),
                fps,
                config: { damping: 14, stiffness: 100 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    opacity: interpolate(itemIn, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(itemIn, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                  <span style={{ fontSize: "1.2rem", color: "rgba(255,255,255,.85)", fontWeight: 500 }}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Assoc name footer */}
        <div style={{ fontSize: "1rem", color: colors.secondary, letterSpacing: ".08em", marginTop: 4 }}>
          {assocName}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Transition presentation selector ────────────────────────────────────────

function getPresentation(style: TransitionStyle) {
  if (style === "fade")  return fade({ shouldFadeOutExitingScene: true });
  if (style === "wipe")  return wipe({ direction: "from-right" });
  return slide({ direction: "from-right" }); // default RTL-friendly
}

// ─── Root composition ─────────────────────────────────────────────────────────

export function BrandedVideo({
  text,
  assocName,
  assocInitial,
  assocRegion,
  assocPhone,
  assocEmail,
  imageUrl,
  audioUrl,
  logoUrl,
  aiBrand,
  brandColors: brandColorsProp,
  transitionStyle = "slide",
  slideFrames: slideFramesProp,
  showLogo = true,
  showOutro = true,
}: BrandedVideoProps) {
  const { durationInFrames } = useVideoConfig();

  const initial = assocInitial ?? (assocName?.[0] ?? "ج");

  // Resolve brand colors — explicit override > ai_brand parse > defaults
  const colors: BrandColors = brandColorsProp && brandColorsProp.length >= 2
    ? {
        primary:   brandColorsProp[0],
        secondary: brandColorsProp[1],
        accent:    brandColorsProp[2] ?? "#ffffff",
        text:      "#ffffff",
      }
    : parseBrandColors(aiBrand);

  const slides     = textToSlides(text);
  const slideCount = Math.max(slides.length, 1);
  const slideFrames: number[] = Array.from(
    { length: slideCount },
    (_, i) => slideFramesProp?.[i] ?? 90,
  );

  const outroStart = durationInFrames - OUTRO_DUR;

  // Build flat TransitionSeries children: [Seq, Trans, Seq, Trans, ..., Seq]
  const tsChildren = slides.flatMap((sl, i) => {
    const dur  = slideFrames[i];
    const seq  = (
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={dur}>
        <SlideScene
          slide={sl}
          assocName={assocName}
          assocInitial={initial}
          logoUrl={showLogo ? logoUrl : undefined}
          colors={colors}
          imageUrl={imageUrl}
          slideIndex={i}
          totalSlides={slideCount}
        />
      </TransitionSeries.Sequence>
    );
    if (i < slides.length - 1) {
      const trans = (
        <TransitionSeries.Transition
          key={`t${i}`}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DUR })}
          presentation={getPresentation(transitionStyle)}
        />
      );
      return [seq, trans];
    }
    return [seq];
  });

  return (
    <AbsoluteFill style={{ fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}>

      {/* ── Intro stinger ── */}
      <Sequence from={0} durationInFrames={INTRO_DUR + TRANSITION_DUR} name="Intro">
        <IntroStinger
          assocName={assocName}
          assocInitial={initial}
          assocRegion={assocRegion}
          logoUrl={logoUrl}
          colors={colors}
        />
      </Sequence>

      {/* ── Slides with transitions ── */}
      <Sequence from={INTRO_DUR} durationInFrames={outroStart - INTRO_DUR + TRANSITION_DUR} name="Slides">
        <TransitionSeries>
          {tsChildren}
        </TransitionSeries>
      </Sequence>

      {/* ── Outro contact card ── */}
      {showOutro && (
        <Sequence from={outroStart} durationInFrames={OUTRO_DUR} name="Outro">
          <OutroCard
            assocName={assocName}
            assocRegion={assocRegion}
            assocPhone={assocPhone}
            assocEmail={assocEmail}
            logoUrl={logoUrl}
            assocInitial={initial}
            colors={colors}
          />
        </Sequence>
      )}

      {/* ── Audio ── */}
      {audioUrl && (
        <Sequence from={0} durationInFrames={durationInFrames} name="Audio">
          <Audio src={audioUrl} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
}
