import type { AdminOrg, AdminRequest } from "@/lib/db";

// Status types
export type OrgStatus = AdminOrg["status"];
export type Org = AdminOrg & { notes: string }; // notes = description alias for UI

export type InfStatus = "active" | "pending" | "ended";
export interface Influencer {
  id: number;
  name: string;
  platform: string;
  followers: number;
  engagement: number;
  status: InfStatus;
  niche: string;
  notes: string;
  price: number;
  bio?: string;
  location?: string;
  audience?: string;
  instagramHandle?: string;
  xHandle?: string;
  tiktokHandle?: string;
  youtubeHandle?: string;
  snapchatHandle?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export type ReqStatus = AdminRequest["status"];
export type CampaignRequest = AdminRequest;

// Page IDs & titles
export type PageId = "overview" | "orgs" | "influencers" | "requests" | "reports" | "settings";

export const PAGE_TITLES: Record<PageId, string> = {
  overview: "لوحة التحكم",
  orgs: "الجمعيات",
  influencers: "المؤثرون",
  requests: "الطلبات",
  reports: "التقارير المالية",
  settings: "الإعدادات",
};

export interface PageTagData {
  orgs: Org[];
  influencers: Influencer[];
  requests: CampaignRequest[];
}

export const PAGE_TAGS: Record<PageId, (data: PageTagData) => string> = {
  overview: () => "نظرة عامة",
  orgs: ({ orgs }) => `${orgs.length} جمعية`,
  influencers: ({ influencers }) => `${influencers.length} مؤثر`,
  requests: ({ requests }) => `${requests.length} طلب`,
  reports: () => "الإيرادات",
  settings: () => "الإعدادات العامة",
};

// Constants
export const INF_COLORS = [
  "#2d7a52",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
] as const;
export function infColor(id: number) {
  return INF_COLORS[(id - 1) % INF_COLORS.length];
}
