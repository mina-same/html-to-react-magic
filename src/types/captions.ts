// Shared types used by both the browser (React) and the Remotion composition.
// Keep these free of browser-only or Node-only imports.

export type CaptionWord = {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
};

export type CaptionStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  activeWordColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  shadowEnabled: boolean;
  textTransform: "none" | "uppercase";
  textAlign: "left" | "center" | "right";
  letterSpacing: number; // px, calibrated for 1080px wide
  wordSpacing: number; // px, extra gap between words, calibrated for 1080px wide
  verticalPosition: number; // 0–100 (% from top)
  horizontalPadding: number;
  maxWidth: number; // 0–100 (% of width)
  animation: "none" | "pop" | "fade" | "slide";
  direction: "ltr" | "rtl" | "auto";
  videoFit: "cover" | "contain";
};

export type CaptionGroupingPreset = "fast" | "balanced" | "readable";

// ─── Paging ──────────────────────────────────────────────────────────────────

export type CaptionPageToken = { text: string; fromMs: number; toMs: number };

export type CaptionPage = {
  startMs: number;
  endMs: number;
  text: string;
  tokens: CaptionPageToken[];
};

// Groups words into short pages (TikTok/Shorts style): at most maxWordsPerPage
// words, breaking early on silence gaps. Each page stays visible until the
// next page starts (or its own end + a short hold), so captions never flicker
// between words.
export function buildCaptionPages(
  captions: CaptionWord[],
  grouping: CaptionGrouping,
): CaptionPage[] {
  const maxWords = Math.max(1, grouping.maxWordsPerPage || 5);
  const gapBreakMs = Math.max(200, grouping.combineTokensWithinMilliseconds || 500);
  const maxCharsPerPage =
    Math.max(10, grouping.maxCharactersPerLine || 40) * Math.max(1, grouping.maxLines || 2);

  const sorted = [...captions]
    .filter((w) => w.text.trim().length > 0)
    .sort((a, b) => a.startMs - b.startMs);

  const pages: CaptionPage[] = [];
  let tokens: CaptionPageToken[] = [];
  let chars = 0;

  const flush = () => {
    if (tokens.length === 0) return;
    pages.push({
      startMs: tokens[0].fromMs,
      endMs: tokens[tokens.length - 1].toMs,
      text: tokens.map((t) => t.text).join(" "),
      tokens,
    });
    tokens = [];
    chars = 0;
  };

  for (const w of sorted) {
    const text = w.text.trim();
    const prev = tokens[tokens.length - 1];
    const wouldBreak =
      tokens.length >= maxWords ||
      chars + text.length + 1 > maxCharsPerPage ||
      (prev && w.startMs - prev.toMs > gapBreakMs);
    if (wouldBreak) flush();
    tokens.push({ text, fromMs: w.startMs, toMs: w.endMs });
    chars += text.length + 1;
  }
  flush();

  // Extend each page to the start of the next one (capped) so there is no
  // flash of empty screen between pages during continuous speech.
  const MAX_HOLD_MS = 1500;
  for (let i = 0; i < pages.length; i++) {
    const next = pages[i + 1];
    const cap = pages[i].endMs + MAX_HOLD_MS;
    pages[i].endMs = next ? Math.min(next.startMs, cap) : cap;
  }

  return pages;
}

export type CaptionGrouping = {
  combineTokensWithinMilliseconds: number;
  maxWordsPerPage: number;
  maxCharactersPerLine: number;
  maxLines: number;
  preset: CaptionGroupingPreset;
};

export type ProjectStatus =
  | "uploaded"
  | "extracting-audio"
  | "transcribing"
  | "ready"
  | "rendering"
  | "completed"
  | "failed";

export type VideoProject = {
  id: string;
  status: ProjectStatus;
  sourceVideoPath: string;
  sourceVideoExt: string;
  durationMs: number;
  width: number;
  height: number;
  fps: number;
  language?: string;
  transcriptionPrompt?: string;
  captions: CaptionWord[];
  captionStyle: CaptionStyle;
  captionGrouping: CaptionGrouping;
  createdAt: string;
  updatedAt: string;
  error?: string;
  hasRender?: boolean; // computed at list time, not persisted
};

export type RenderJob = {
  id: string;
  projectId: string;
  status: "queued" | "rendering" | "completed" | "failed" | "cancelled";
  progress: number;
  outputPath?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type TranscribeOptions = {
  language?: string;
  prompt?: string;
};

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: 72,
  fontWeight: 800,
  textColor: "#FFFFFF",
  activeWordColor: "#FFD700",
  backgroundColor: "#000000",
  backgroundOpacity: 0.6,
  strokeColor: "#000000",
  strokeWidth: 0,
  shadowEnabled: true,
  textTransform: "none",
  textAlign: "center",
  letterSpacing: 0,
  wordSpacing: 0,
  verticalPosition: 75,
  horizontalPadding: 24,
  maxWidth: 85,
  animation: "pop",
  direction: "auto",
  videoFit: "contain",
};

export const DEFAULT_CAPTION_GROUPING: CaptionGrouping = {
  combineTokensWithinMilliseconds: 500,
  maxWordsPerPage: 5,
  maxCharactersPerLine: 40,
  maxLines: 2,
  preset: "balanced",
};

export const GROUPING_PRESETS: Record<CaptionGroupingPreset, Omit<CaptionGrouping, "preset">> = {
  fast: {
    combineTokensWithinMilliseconds: 300,
    maxWordsPerPage: 3,
    maxCharactersPerLine: 25,
    maxLines: 1,
  },
  balanced: {
    combineTokensWithinMilliseconds: 500,
    maxWordsPerPage: 5,
    maxCharactersPerLine: 40,
    maxLines: 2,
  },
  readable: {
    combineTokensWithinMilliseconds: 800,
    maxWordsPerPage: 8,
    maxCharactersPerLine: 55,
    maxLines: 2,
  },
};

export const LANGUAGE_OPTIONS = [
  { label: "Auto-detect", value: "" },
  { label: "Arabic", value: "ar" },
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
] as const;

export const FONT_OPTIONS = [
  "Arial, sans-serif",
  "Cairo, sans-serif",
  "Tajawal, sans-serif",
  "Impact, sans-serif",
  "Georgia, serif",
  "Courier New, monospace",
] as const;

export const STYLE_PRESETS: Array<{ name: string; style: Partial<CaptionStyle> }> = [
  {
    name: "Classic",
    style: {
      fontFamily: "Arial, sans-serif",
      textColor: "#FFFFFF",
      activeWordColor: "#FFD700",
      backgroundColor: "#000000",
      backgroundOpacity: 0.6,
      strokeWidth: 0,
      fontSize: 72,
    },
  },
  {
    name: "Bold Reels",
    style: {
      fontFamily: "Impact, sans-serif",
      textColor: "#FFFFFF",
      activeWordColor: "#FF4500",
      backgroundColor: "#000000",
      backgroundOpacity: 0,
      strokeWidth: 0,
      fontSize: 80,
      textTransform: "uppercase",
    },
  },
  {
    name: "Minimal",
    style: {
      fontFamily: "Arial, sans-serif",
      textColor: "#FFFFFF",
      activeWordColor: "#FFFFFF",
      backgroundColor: "#000000",
      backgroundOpacity: 0,
      strokeWidth: 0,
      fontSize: 60,
      shadowEnabled: true,
    },
  },
  {
    name: "Boxed",
    style: {
      fontFamily: "Arial, sans-serif",
      textColor: "#FFFFFF",
      activeWordColor: "#000000",
      backgroundColor: "#FFD700",
      backgroundOpacity: 1,
      strokeWidth: 0,
      fontSize: 64,
    },
  },
  {
    name: "Arabic Bold",
    style: {
      fontFamily: "Cairo, sans-serif",
      textColor: "#FFFFFF",
      activeWordColor: "#FFD700",
      backgroundColor: "#1a1a2e",
      backgroundOpacity: 0.8,
      strokeWidth: 0,
      fontSize: 76,
      direction: "rtl",
    },
  },
  {
    name: "Creator Pop",
    style: {
      fontFamily: "Arial, sans-serif",
      fontWeight: 800,
      textColor: "#FFFFFF",
      activeWordColor: "#CCFF33",
      backgroundColor: "#000000",
      backgroundOpacity: 0,
      strokeWidth: 0,
      shadowEnabled: true,
      fontSize: 68,
      textTransform: "none",
      animation: "pop",
    },
  },
];
