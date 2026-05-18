export interface Influencer {
  id: number;
  name: string;
  platform: "Instagram" | "X" | "TikTok" | "YouTube" | "Snapchat";
  followers: number;
  engagement: number;
  status: "active" | "pending" | "ended";
  campaigns: number;
  niche: string;
  notes: string;
  basePrice: number;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  status: "active" | "away" | "off";
  color: string;
}

export interface Task {
  id: number;
  title: string;
  status: "todo" | "doing" | "done";
  urgency: "urgent" | "high" | "normal" | "low";
  deadline: string;
  assignee: number;
  category: string;
  notes: string;
}

export interface Donation {
  id: number;
  name: string;
  amount: number;
  channel: string;
  date: string;
  status: "completed" | "pending";
  org: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  desc: string;
  price: string;
}

export interface CampaignRequest {
  infId: number;
  type: string;
  budget: number;
  startDate: string;
  duration: string;
  message: string;
}

export type PageId =
  | "overview"
  | "profile"
  | "team"
  | "tasks"
  | "donations"
  | "content"
  | "campaigns"
  | "influencers"
  | "services"
  | "analytics"
  | "settings";

export const PAGE_TITLES: Record<PageId, string> = {
  overview: "نظرة عامة",
  profile: "ملف الجمعية",
  team: "الفريق",
  tasks: "لوحة المهام",
  donations: "التبرعات",
  content: "المحتوى التسويقي",
  campaigns: "الحملات",
  influencers: "المؤثرون",
  services: "خدماتنا",
  analytics: "التحليلات",
  settings: "الإعدادات",
};
