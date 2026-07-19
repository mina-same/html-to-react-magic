import { useMemo } from "react";
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from "remotion";
import { buildCaptionPages } from "../../types/captions";
import type { CaptionWord, CaptionStyle, CaptionGrouping } from "../../types/captions";

export type CaptionedVideoProps = {
  videoSrc: string;
  captions: CaptionWord[];
  captionStyle: CaptionStyle;
  captionGrouping: CaptionGrouping;
  width: number;
  height: number;
  durationInFrames: number;
  fps: number;
};

export function CaptionedVideo({
  videoSrc,
  captions,
  captionStyle,
  captionGrouping,
}: CaptionedVideoProps) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  // All size values in DEFAULT_CAPTION_STYLE are calibrated for 1080px wide.
  // Scale linearly so the same style looks correct at any resolution.
  const scale = width / 1080;

  const pages = useMemo(
    () => buildCaptionPages(captions, captionGrouping),
    [captions, captionGrouping],
  );

  const currentPage = pages.find((p) => currentMs >= p.startMs && currentMs < p.endMs);
  const currentPageTokens = currentPage?.tokens ?? [];

  const direction = resolveDirection(captionStyle.direction, captions);

  // verticalPosition is 0–100 (% from top). We pin the BOTTOM of the caption
  // block to that position so it grows upward — consistent with subtitle UX.
  const bottomPct = 100 - captionStyle.verticalPosition;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Source video */}
      <Video
        src={videoSrc}
        startFrom={0}
        pauseWhenBuffering
        style={{
          width: "100%",
          height: "100%",
          objectFit: captionStyle.videoFit,
        }}
      />

      {/* Caption overlay — bottom-anchored so block grows upward from target position */}
      {currentPage && currentPageTokens.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: Math.round(captionStyle.horizontalPadding * scale),
            right: Math.round(captionStyle.horizontalPadding * scale),
            bottom: `${bottomPct}%`,
            display: "flex",
            flexDirection: "column",
            alignItems:
              captionStyle.textAlign === "center"
                ? "center"
                : captionStyle.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
            pointerEvents: "none",
          }}
        >
          <CaptionPageRenderer
            tokens={currentPageTokens}
            currentMs={currentMs}
            style={captionStyle}
            direction={direction}
            scale={scale}
          />
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── Caption page renderer ────────────────────────────────────────────────────

type Token = { text: string; fromMs: number; toMs: number };

type CaptionPageRendererProps = {
  tokens: Token[];
  currentMs: number;
  style: CaptionStyle;
  direction: "ltr" | "rtl";
  scale: number;
};

function CaptionPageRenderer({ tokens, currentMs, style, direction, scale }: CaptionPageRendererProps) {
  // Most recent word that has started — stays highlighted through inter-word gaps
  let activeWord: Token | undefined;
  for (const t of tokens) {
    if (currentMs >= t.fromMs) activeWord = t;
  }

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent:
      style.textAlign === "center"
        ? "center"
        : style.textAlign === "right"
          ? "flex-end"
          : "flex-start",
    direction,
    maxWidth: `${style.maxWidth}%`,
    rowGap: Math.round(0.15 * scale * style.fontSize),
    columnGap: Math.round(0.25 * scale * style.fontSize) + Math.round(style.wordSpacing * scale),
    padding: `${Math.round(0.3 * scale * style.fontSize)}px ${Math.round(0.6 * scale * style.fontSize)}px`,
    borderRadius: Math.round(8 * scale),
    backgroundColor:
      style.backgroundOpacity > 0
        ? hexToRgba(style.backgroundColor, style.backgroundOpacity)
        : "transparent",
  };

  return (
    <div style={containerStyle}>
      {tokens.map((token, i) => (
        <WordSpan
          key={i}
          word={token.text}
          isActive={token === activeWord}
          style={style}
          scale={scale}
        />
      ))}
    </div>
  );
}

// ─── Word span ────────────────────────────────────────────────────────────────

type WordSpanProps = {
  word: string;
  isActive: boolean;
  style: CaptionStyle;
  scale: number;
};

function WordSpan({ word, isActive, style, scale }: WordSpanProps) {
  const text = style.textTransform === "uppercase" ? word.toUpperCase() : word;
  const color = isActive ? style.activeWordColor : style.textColor;
  const fontSize = Math.round(style.fontSize * scale);
  const strokeWidth = Math.round(style.strokeWidth * scale);
  const letterSpacing = Math.round(style.letterSpacing * scale * 10) / 10;

  const baseStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize,
    fontWeight: style.fontWeight,
    color,
    display: "inline-block",
    letterSpacing: letterSpacing !== 0 ? `${letterSpacing}px` : undefined,
    textShadow: style.shadowEnabled
      ? `0 ${Math.round(2 * scale)}px ${Math.round(8 * scale)}px rgba(0,0,0,0.9), 0 0 ${Math.round(4 * scale)}px rgba(0,0,0,0.8)`
      : undefined,
    WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${style.strokeColor}` : undefined,
    transform: isActive && style.animation === "pop" ? "scale(1.12)" : "scale(1)",
    transformOrigin: "center bottom",
  };

  return <span style={baseStyle}>{text}</span>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveDirection(
  dir: CaptionStyle["direction"],
  captions: CaptionWord[],
): "ltr" | "rtl" {
  if (dir === "ltr") return "ltr";
  if (dir === "rtl") return "rtl";
  const rtlRe = /[؀-ۿ]/;
  for (const c of captions) {
    if (rtlRe.test(c.text)) return "rtl";
  }
  return "ltr";
}

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}
