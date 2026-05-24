export type UserRole = "admin" | "association";
export type EmployeeStatus = "active" | "away" | "off";
export type TaskStatus = "todo" | "doing" | "done";
export type TaskUrgency = "urgent" | "high" | "normal" | "low";
export type DonationStatus = "completed" | "pending";
export type InfluencerStatus = "active" | "pending" | "ended";
export type CampaignStatus = "draft" | "active" | "paused" | "ended";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          assoc_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          assoc_name?: string | null;
          created_at?: string;
        };
        Update: {
          role?: UserRole;
          assoc_name?: string | null;
        };
      };
      influencers: {
        Row: {
          id: number;
          name: string;
          platform: string;
          followers: number;
          engagement: number;
          status: InfluencerStatus;
          campaigns: number;
          niche: string;
          notes: string;
          base_price: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["influencers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["influencers"]["Insert"]>;
      };
      employees: {
        Row: {
          id: number;
          assoc_id: string;
          name: string;
          role: string;
          status: EmployeeStatus;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: number;
          assoc_id: string;
          title: string;
          status: TaskStatus;
          urgency: TaskUrgency;
          deadline: string | null;
          assignee: number | null;
          category: string;
          notes: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tasks"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      donations: {
        Row: {
          id: number;
          assoc_id: string;
          name: string;
          amount: number;
          channel: string;
          date: string;
          status: DonationStatus;
          org: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["donations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["donations"]["Insert"]>;
      };
      campaigns: {
        Row: {
          id: number;
          assoc_id: string;
          title: string;
          status: CampaignStatus;
          budget: number;
          reach: string;
          start_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["campaigns"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
      };
      campaign_requests: {
        Row: {
          id: number;
          assoc_id: string;
          influencer_id: number;
          type: string;
          budget: number;
          start_date: string;
          duration: string;
          message: string;
          status: RequestStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["campaign_requests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["campaign_requests"]["Insert"]>;
      };
    };
  };
}
