import type { CSSProperties } from "react";
import { AI_ANALYSIS } from "../../data";
import type { AssocProfile, GeneratedContent } from "@/lib/db";

export type { GeneratedContent };

export interface AnalysisResult {
  summary: string;
  ideas: string[];
  painPoints: string[];
}

export interface AnalysisResultWithFileId extends AnalysisResult {
  _openaiFileId?: string;
}

export type ContentTab = "post" | "story" | "donation" | "video";
export type InputMode = "file" | "text";
export type LogStatus = "pending" | "done" | "error";

export interface LogEntry {
  text: string;
  time: string;
  status: LogStatus;
}

export interface FileInfo {
  name: string;
  size: string;
  content?: string;
}

export const CONTENT_TABS: { key: ContentTab; label: string; icon: string }[] = [
  { key: "post", label: "منشور", icon: "📱" },
  { key: "story", label: "قصة", icon: "✨" },
  { key: "donation", label: "تبرع", icon: "💚" },
  { key: "video", label: "سيناريو", icon: "🎬" },
];

export const FILE_TYPE_BADGES = ["PDF", "Word", "TXT", "JPG/PNG"];

export const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png";

// ── Shared card / input styles ─────────────────────────────────────
export const sc: CSSProperties = {
  background: "white",
  borderRadius: 13,
  border: "1px solid rgba(45,122,82,.12)",
  marginBottom: 18,
  overflow: "hidden",
};

export const scH: CSSProperties = {
  padding: "14px 18px",
  borderBottom: "1px solid rgba(45,122,82,.12)",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

export const inp: CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  borderRadius: 8,
  border: "1.5px solid rgba(45,122,82,.12)",
  fontFamily: "'Tajawal','Cairo',sans-serif",
  fontSize: ".93rem",
  color: "#111827",
  outline: "none",
  background: "white",
  transition: "border-color .2s",
};

export const editBtn: CSSProperties = {
  fontSize: ".78rem",
  padding: "5px 13px",
  borderRadius: 7,
  border: "1px solid rgba(45,122,82,.18)",
  background: "white",
  color: "#2d7a52",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Tajawal',sans-serif",
};

export const viewFileLink: CSSProperties = {
  fontSize: ".78rem",
  padding: "5px 13px",
  borderRadius: 7,
  border: "1px solid rgba(45,122,82,.18)",
  background: "linear-gradient(135deg,#e8f5ee,#d4eddf)",
  color: "#1a5c3a",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Tajawal',sans-serif",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};

export const iconBadge: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 7,
  background: "#e8f5ee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: ".95rem",
};

export const cardTitle: CSSProperties = {
  fontSize: ".92rem",
  fontWeight: 700,
  color: "#111827",
};

export const cardSubtitle: CSSProperties = {
  fontSize: ".76rem",
  color: "#6b7280",
  marginTop: 1,
};

export const SPIN_KEYFRAMES =
  "@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}";

// ── AI system prompt ───────────────────────────────────────────────
export const AI_SYSTEM_PROMPT = `أنت خليل، مساعد ذكاء اصطناعي متخصص في تحليل الجمعيات الخيرية.
              قم بتحليل النص المقدم أو الملف واستخرج:
              1. ملخص تنفيذي للجمعية (3-4 أسطر).
              2. 4 أفكار تسويقية مبتكرة.
              3. 3 نقاط ضعف أو تحديات إعلامية قد تواجهها الجمعية.
              يجب أن يكون الرد بتنسيق JSON حصراً كالتالي:
              {
                "summary": "...",
                "ideas": ["...", "..."],
                "painPoints": ["...", "..."]
              }`;

// ── Helpers ────────────────────────────────────────────────────────

/** Strip the `[وصف إضافي]:` / `[الوصف]:` prefix the analysis pipeline stores. */
export function parseDescription(description: string | null | undefined): string {
  if (!description) return "";
  const descMatch =
    description.match(/\[وصف إضافي\]:\s*([\s\S]*)$/) ||
    description.match(/\[الوصف\]:\s*([\s\S]*)$/);
  return descMatch ? descMatch[1].trim() : description;
}

/** Build an AnalysisResult from a saved profile, or null if AI fields are missing. */
export function deriveAiResult(profile: AssocProfile | null | undefined): AnalysisResult | null {
  if (profile?.ai_summary && profile?.ai_ideas && profile?.ai_pain_points) {
    return {
      summary: profile.ai_summary,
      ideas: profile.ai_ideas,
      painPoints: profile.ai_pain_points,
    };
  }
  return null;
}

/** Fallback used by the UI when no analysis has been saved yet. */
export function analysisOrFallback(ai: AnalysisResult | null | undefined): AnalysisResult {
  return ai ?? (AI_ANALYSIS as AnalysisResult);
}

export function nowTime(): string {
  return new Date().toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function humanFileSize(bytes: number): string {
  const kb = bytes / 1024;
  return kb > 1024 ? (kb / 1024).toFixed(1) + "MB" : kb.toFixed(0) + "KB";
}

export function sanitizeAssocName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
}
