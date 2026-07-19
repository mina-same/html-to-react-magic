// ─── Caption word ────────────────────────────────────────────────────────────

export type CaptionWord = {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
};

// ─── Caption style ────────────────────────────────────────────────────────────

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
  maxWidth: number; // 0–100 (% of composition width)
  animation: "none" | "pop" | "fade" | "slide";
  direction: "ltr" | "rtl" | "auto";
  videoFit: "cover" | "contain";
};

// ─── Caption grouping ─────────────────────────────────────────────────────────

export type CaptionGroupingPreset = "fast" | "balanced" | "readable";

export type CaptionGrouping = {
  combineTokensWithinMilliseconds: number;
  maxWordsPerPage: number;
  maxCharactersPerLine: number;
  maxLines: number;
  preset: CaptionGroupingPreset;
};

// ─── Video project ────────────────────────────────────────────────────────────

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

// ─── Video metadata ───────────────────────────────────────────────────────────

export type VideoMetadata = {
  durationMs: number;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  codec: string;
  sizeBytes: number;
};

// ─── Audio chunk (for large files) ───────────────────────────────────────────

export type AudioChunk = {
  index: number;
  path: string;
  startMs: number;
  endMs: number;
  sizeBytes: number;
};

// ─── Render job ───────────────────────────────────────────────────────────────

export type RenderJobStatus = "queued" | "rendering" | "completed" | "failed" | "cancelled";

export type RenderJob = {
  id: string;
  projectId: string;
  status: RenderJobStatus;
  progress: number; // 0–1
  outputPath?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Transcription options ────────────────────────────────────────────────────

export type TranscribeOptions = {
  language?: string;
  prompt?: string;
};

// ─── Raw OpenAI response types ────────────────────────────────────────────────

export type OpenAIWord = {
  word: string;
  start: number;
  end: number;
};

// ─── Defaults ────────────────────────────────────────────────────────────────

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
