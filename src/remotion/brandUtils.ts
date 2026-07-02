// Brand color + mood utilities — driven by ai_brand field from associations table

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

const DEFAULTS: BrandColors = {
  primary:   "#1a5c3a",
  secondary: "#c9a84c",
  accent:    "#ffffff",
  text:      "#ffffff",
};

/** Extract up to 3 hex colours from the AI-generated brand string */
export function parseBrandColors(aiBrand: string | null | undefined): BrandColors {
  const raw   = aiBrand ?? "";
  const hexes = raw.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  return {
    primary:   hexes[0] ?? DEFAULTS.primary,
    secondary: hexes[1] ?? DEFAULTS.secondary,
    accent:    hexes[2] ?? DEFAULTS.accent,
    text:      DEFAULTS.text,
  };
}

export type BrandMood = "warm" | "formal" | "vibrant" | "minimal";

const WARM_WORDS    = /دافئ|خيري|أسرة|مجتمع|warm|community|family/i;
const FORMAL_WORDS  = /رسمي|حكومي|مؤسسي|formal|official|institutional/i;
const VIBRANT_WORDS = /حيوي|شباب|نشاط|vibrant|youth|energetic/i;

export function parseBrandMood(aiBrand: string | null | undefined): BrandMood {
  const raw = aiBrand ?? "";
  if (VIBRANT_WORDS.test(raw)) return "vibrant";
  if (FORMAL_WORDS.test(raw))  return "formal";
  if (WARM_WORDS.test(raw))    return "warm";
  return "warm"; // charity default
}

export type TransitionStyle = "slide" | "wipe" | "fade";

export function moodToTransition(mood: BrandMood): TransitionStyle {
  if (mood === "vibrant") return "wipe";
  if (mood === "formal")  return "fade";
  return "slide";
}

// ── Duration math ─────────────────────────────────────────────
export const INTRO_DUR      = 45;
export const OUTRO_DUR      = 60;
export const TRANSITION_DUR = 30;

export function computeBrandedVideoDuration(slideFrames: number[]): number {
  const n         = Math.max(slideFrames.length, 1);
  const slidesDur = slideFrames.reduce((a, b) => a + b, 0)
    - Math.max(0, n - 1) * TRANSITION_DUR;
  return INTRO_DUR + Math.max(slidesDur, 60) + OUTRO_DUR;
}
