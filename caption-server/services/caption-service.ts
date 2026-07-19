import { randomUUID } from "crypto";
import { buildCaptionPages } from "../../src/types/captions.js";
import type { CaptionWord, CaptionGrouping, OpenAIWord } from "../types.js";

// ─── Normalization ────────────────────────────────────────────────────────────

export function normalizeOpenAIWords(
  words: OpenAIWord[],
  offsetMs: number,
  videoDurationMs: number,
): CaptionWord[] {
  return words
    .filter((w) => w.word.trim().length > 0)
    .filter((w) => w.start >= 0 && w.end >= w.start)
    .map((w) => {
      const startMs = Math.round(w.start * 1000) + offsetMs;
      const endMs = Math.max(Math.round(w.end * 1000) + offsetMs, startMs + 50);
      return {
        id: randomUUID(),
        text: w.word,
        startMs: Math.min(startMs, videoDurationMs - 50),
        endMs: Math.min(endMs, videoDurationMs),
        timestampMs: startMs,
        confidence: null,
      } satisfies CaptionWord;
    })
    .filter((w) => w.startMs >= 0 && w.endMs > w.startMs && w.startMs < videoDurationMs)
    .sort((a, b) => a.startMs - b.startMs);
}

export function mergeChunkCaptions(
  chunks: Array<{ captions: CaptionWord[] }>,
): CaptionWord[] {
  const all = chunks.flatMap((c) => c.captions);
  const sorted = all.sort((a, b) => a.startMs - b.startMs);

  // Remove duplicate boundary words (same text at nearly same timestamp from adjacent chunks)
  const deduped: CaptionWord[] = [];
  for (const word of sorted) {
    const prev = deduped.at(-1);
    if (
      prev &&
      prev.text.trim().toLowerCase() === word.text.trim().toLowerCase() &&
      Math.abs(word.startMs - prev.startMs) < 200
    ) {
      continue;
    }
    deduped.push(word);
  }
  return deduped;
}

// ─── SRT export ──────────────────────────────────────────────────────────────

function msToSRTTime(ms: number): string {
  const safeMs = Math.max(0, ms);
  const h = Math.floor(safeMs / 3_600_000);
  const m = Math.floor((safeMs % 3_600_000) / 60_000);
  const s = Math.floor((safeMs % 60_000) / 1_000);
  const ms_ = safeMs % 1_000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms_).padStart(3, "0")}`;
}

export function exportSRT(captions: CaptionWord[], grouping: CaptionGrouping): string {
  if (captions.length === 0) return "";

  // Same paging as the on-screen captions, so the SRT matches the video
  const pages = buildCaptionPages(captions, grouping);

  const blocks: string[] = [];
  let cueIndex = 1;

  for (const page of pages) {
    if (!page.text.trim()) continue;
    if (page.endMs <= page.startMs) continue;
    blocks.push(
      `${cueIndex}\n${msToSRTTime(page.startMs)} --> ${msToSRTTime(page.endMs)}\n${page.text.trim()}`,
    );
    cueIndex++;
  }

  return blocks.join("\n\n") + "\n";
}

// ─── RTL detection ────────────────────────────────────────────────────────────

export function detectDirection(text: string): "ltr" | "rtl" {
  const rtlChars = /[؀-ۿݐ-ݿ֐-׿ࢠ-ࣿ]/;
  return rtlChars.test(text) ? "rtl" : "ltr";
}
