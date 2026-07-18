export type UserRole = "admin" | "association" | "employee";
export type EmployeeStatus = "active" | "away" | "off";
export type TaskStatus = "todo" | "doing" | "review" | "done";
export type TaskUrgency = "urgent" | "high" | "normal" | "low";
export type DonationStatus = "completed" | "pending";
export type InfluencerStatus = "active" | "pending" | "ended";
export type CampaignStatus = "draft" | "active" | "paused" | "ended";
export type RequestStatus = "pending" | "approved" | "rejected" | "matched" | "completed";
export type AssocStatus = "active" | "new" | "pending" | "suspended";
export type MatchStatus = "active" | "pending" | "completed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          assoc_name: string | null;
          assoc_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          assoc_name?: string | null;
          assoc_id?: string | null;
          created_at?: string;
        };
        Update: { role?: UserRole; assoc_name?: string | null; assoc_id?: string | null };
        Relationships: [];
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
          bio: string;
          location: string;
          audience: string;
          instagram_handle: string;
          x_handle: string;
          tiktok_handle: string;
          youtube_handle: string;
          snapchat_handle: string;
          website: string;
          email: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          name: string;
          platform: string;
          followers?: number;
          engagement?: number;
          status?: InfluencerStatus;
          campaigns?: number;
          niche?: string;
          notes?: string;
          base_price?: number;
          bio?: string;
          location?: string;
          audience?: string;
          instagram_handle?: string;
          x_handle?: string;
          tiktok_handle?: string;
          youtube_handle?: string;
          snapchat_handle?: string;
          website?: string;
          email?: string;
          phone?: string;
        };
        Update: {
          name?: string;
          platform?: string;
          followers?: number;
          engagement?: number;
          status?: InfluencerStatus;
          campaigns?: number;
          niche?: string;
          notes?: string;
          base_price?: number;
          bio?: string;
          location?: string;
          audience?: string;
          instagram_handle?: string;
          x_handle?: string;
          tiktok_handle?: string;
          youtube_handle?: string;
          snapchat_handle?: string;
          website?: string;
          email?: string;
          phone?: string;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          id: number;
          assoc_id: string;
          user_id: string | null;
          email: string | null;
          name: string;
          role: string;
          status: EmployeeStatus;
          color: string;
          created_at: string;
        };
        Insert: {
          assoc_id: string;
          user_id?: string | null;
          email?: string | null;
          name: string;
          role?: string;
          status?: EmployeeStatus;
          color?: string;
        };
        Update: {
          assoc_id?: string;
          name?: string;
          role?: string;
          status?: EmployeeStatus;
          color?: string;
        };
        Relationships: [];
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
        Insert: {
          assoc_id: string;
          title: string;
          status?: TaskStatus;
          urgency?: TaskUrgency;
          deadline?: string | null;
          assignee?: number | null;
          category?: string;
          notes?: string;
        };
        Update: {
          assoc_id?: string;
          title?: string;
          status?: TaskStatus;
          urgency?: TaskUrgency;
          deadline?: string | null;
          assignee?: number | null;
          category?: string;
          notes?: string;
        };
        Relationships: [];
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
          // Richer fields written by donationsDb.create (added via migration;
          // the create path tolerates these not yet existing on the DB).
          donation_number: string | null;
          phone: string | null;
          project_name: string | null;
          payment_method: string | null;
          bank: string | null;
          account_number: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          assoc_id: string;
          name: string;
          amount: number;
          channel?: string;
          date?: string;
          status?: DonationStatus;
          org?: string;
          donation_number?: string | null;
          phone?: string | null;
          project_name?: string | null;
          payment_method?: string | null;
          bank?: string | null;
          account_number?: string | null;
          source?: string | null;
        };
        Update: {
          assoc_id?: string;
          name?: string;
          amount?: number;
          channel?: string;
          date?: string;
          status?: DonationStatus;
          org?: string;
          donation_number?: string | null;
          phone?: string | null;
          project_name?: string | null;
          payment_method?: string | null;
          bank?: string | null;
          account_number?: string | null;
          source?: string | null;
        };
        Relationships: [];
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
        Insert: {
          assoc_id: string;
          title: string;
          status?: CampaignStatus;
          budget?: number;
          reach?: string;
          start_date?: string | null;
        };
        Update: {
          assoc_id?: string;
          title?: string;
          status?: CampaignStatus;
          budget?: number;
          reach?: string;
          start_date?: string | null;
        };
        Relationships: [];
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
        Insert: {
          assoc_id: string;
          influencer_id: number;
          type?: string;
          budget: number;
          start_date: string;
          duration?: string;
          message: string;
          status?: RequestStatus;
        };
        Update: {
          assoc_id?: string;
          influencer_id?: number;
          type?: string;
          budget?: number;
          start_date?: string;
          duration?: string;
          message?: string;
          status?: RequestStatus;
        };
        Relationships: [];
      };
      associations: {
        Row: {
          id: string;
          license: string;
          region: string;
          phone: string;
          email: string;
          description: string;
          status: AssocStatus;
          verified: boolean;
          updated_at: string;
          pdf_url: string | null;
          ai_brand: string | null;
          // AI profile fields (migration 009)
          ai_summary: string | null;
          ai_ideas: string[] | null;
          ai_pain_points: string[] | null;
          ai_content: Record<string, unknown> | null;
          openai_file_id: string | null;
        };
        Insert: {
          id: string;
          license?: string;
          region?: string;
          phone?: string;
          email?: string;
          description?: string;
          status?: AssocStatus;
          verified?: boolean;
          updated_at?: string;
          pdf_url?: string | null;
          ai_brand?: string | null;
          ai_summary?: string | null;
          ai_ideas?: string[] | null;
          ai_pain_points?: string[] | null;
          ai_content?: Record<string, unknown> | null;
          openai_file_id?: string | null;
        };
        Update: {
          license?: string;
          region?: string;
          phone?: string;
          email?: string;
          description?: string;
          status?: AssocStatus;
          verified?: boolean;
          updated_at?: string;
          pdf_url?: string | null;
          ai_brand?: string | null;
          ai_summary?: string | null;
          ai_ideas?: string[] | null;
          ai_pain_points?: string[] | null;
          ai_content?: Record<string, unknown> | null;
          openai_file_id?: string | null;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: number;
          assoc_id: string;
          influencer_id: number;
          status: MatchStatus;
          start_date: string;
          budget: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          assoc_id: string;
          influencer_id: number;
          status?: MatchStatus;
          start_date?: string;
          budget?: number;
          notes?: string;
        };
        Update: {
          assoc_id?: string;
          influencer_id?: number;
          status?: MatchStatus;
          start_date?: string;
          budget?: number;
          notes?: string;
        };
        Relationships: [];
      };
      content_generations: {
        Row: {
          id: number;
          assoc_id: string;
          prompt: string;
          content: Record<string, unknown>;
          created_at: string;
          tokens_used: number;
        };
        Insert: {
          assoc_id: string;
          prompt?: string;
          content?: Record<string, unknown>;
          tokens_used?: number;
        };
        Update: {
          prompt?: string;
          content?: Record<string, unknown>;
          tokens_used?: number;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: { key: string; value: string; updated_at: string };
        Insert: { key: string; value?: string; updated_at?: string };
        Update: { value?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
