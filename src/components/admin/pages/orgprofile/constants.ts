import type { CSSProperties } from "react";

export type TabId = "overview" | "employees" | "content" | "requests" | "donations";
export const PAGE_SIZE = 10;

export const btnPg: CSSProperties = {
  padding: "5px 11px",
  border: "1.5px solid rgba(45,122,82,.15)",
  borderRadius: 7,
  background: "white",
  fontFamily: "'Tajawal',sans-serif",
  fontSize: ".76rem",
  cursor: "pointer",
  color: "#374151",
  transition: "all .15s",
};

export function empStatusLabel(s: string) {
  if (s === "active") return { bg: "#dcfce7", color: "#166534", label: "نشط" };
  if (s === "away") return { bg: "#fef9c3", color: "#92400e", label: "متغيب" };
  return { bg: "#f3f4f6", color: "#6b7280", label: "إجازة" };
}

export function getDisplayableImage(item: { imageUrl?: string; imageBase64?: string }) {
  if (item.imageUrl) {
    return item.imageUrl;
  }
  if (item.imageBase64) {
    return `data:image/png;base64,${item.imageBase64}`;
  }
  return undefined;
}

export function pagSlice<T>(items: T[], page: number) {
  return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

export const CONTENT_TYPES = ["post", "story", "donation", "video"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  post: "منشور",
  story: "ستوري",
  donation: "تبرع",
  video: "فيديو",
};

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  post: "📝",
  story: "📷",
  donation: "💝",
  video: "🎬",
};
