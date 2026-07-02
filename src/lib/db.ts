import { supabase } from "./supabase";
import type {
  Employee,
  Task,
  Donation,
  Influencer,
  Campaign,
} from "@/components/association/types";

// ── Helpers ────────────────────────────────────────────────────
function mapEmployee(row: Record<string, unknown>): Employee {
  return {
    id: row.id as number,
    name: row.name as string,
    role: row.role as string,
    status: row.status as Employee["status"],
    color: row.color as string,
  };
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    title: row.title as string,
    status: row.status as Task["status"],
    urgency: row.urgency as Task["urgency"],
    deadline: (row.deadline as string) ?? "",
    assignee: (row.assignee as number) ?? 0,
    category: (row.category as string) ?? "",
    notes: (row.notes as string) ?? "",
  };
}

function mapDonation(row: Record<string, unknown>): Donation {
  return {
    id: row.id as number,
    donationNumber: (row.donation_number as string) ?? "",
    name: row.name as string,
    phone: (row.phone as string) ?? "",
    projectName: (row.project_name as string) ?? "",
    amount: row.amount as number,
    paymentMethod: (row.payment_method as string) ?? "نقد",
    bank: (row.bank as string) ?? "",
    accountNumber: (row.account_number as string) ?? "",
    status: row.status as Donation["status"],
    source: (row.source as string) ?? "",
    date: row.date as string,
  };
}

function mapInfluencer(row: Record<string, unknown>): Influencer {
  return {
    id: row.id as number,
    name: row.name as string,
    platform: row.platform as Influencer["platform"],
    followers: row.followers as number,
    engagement: row.engagement as number,
    status: row.status as Influencer["status"],
    campaigns: row.campaigns as number,
    niche: (row.niche as string) ?? "",
    notes: (row.notes as string) ?? "",
    basePrice: row.base_price as number,
    bio: (row.bio as string) ?? "",
    location: (row.location as string) ?? "",
    audience: (row.audience as string) ?? "",
    instagramHandle: (row.instagram_handle as string) ?? "",
    xHandle: (row.x_handle as string) ?? "",
    tiktokHandle: (row.tiktok_handle as string) ?? "",
    youtubeHandle: (row.youtube_handle as string) ?? "",
    snapchatHandle: (row.snapchat_handle as string) ?? "",
    website: (row.website as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
  };
}

function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: row.id as number,
    title: row.title as string,
    status: row.status as Campaign["status"],
    budget: row.budget as number,
    reach: (row.reach as string) ?? "—",
  };
}

// ── Employees ──────────────────────────────────────────────────
export const employeesDb = {
  async list(assocId: string): Promise<Employee[]> {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("assoc_id", assocId)
      .order("created_at");
    return (data ?? []).map(mapEmployee);
  },
  async create(assocId: string, data: Omit<Employee, "id">): Promise<Employee | null> {
    const { data: row } = await supabase
      .from("employees")
      .insert({ assoc_id: assocId, ...data })
      .select()
      .single();
    return row ? mapEmployee(row as Record<string, unknown>) : null;
  },
  async update(id: number, data: Partial<Omit<Employee, "id">>): Promise<void> {
    await supabase.from("employees").update(data).eq("id", id);
  },
  async delete(id: number): Promise<void> {
    await supabase.from("employees").delete().eq("id", id);
  },
};

// ── Tasks ──────────────────────────────────────────────────────
export const tasksDb = {
  async list(assocId: string): Promise<Task[]> {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("assoc_id", assocId)
      .order("created_at");
    return (data ?? []).map(mapTask);
  },
  async create(assocId: string, data: Omit<Task, "id">): Promise<Task | null> {
    const payload = {
      assoc_id: assocId,
      ...data,
      assignee: data.assignee || null,
      deadline: data.deadline || null,
    };
    const { data: row } = await supabase.from("tasks").insert(payload).select().single();
    return row ? mapTask(row as Record<string, unknown>) : null;
  },
  async update(id: number, data: Partial<Omit<Task, "id">>): Promise<void> {
    const payload = { ...data, assignee: data.assignee || null, deadline: data.deadline || null };
    await supabase.from("tasks").update(payload).eq("id", id);
  },
  async delete(id: number): Promise<void> {
    await supabase.from("tasks").delete().eq("id", id);
  },
};

// ── Donations ──────────────────────────────────────────────────
export const donationsDb = {
  async list(assocId: string): Promise<Donation[]> {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("assoc_id", assocId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error loading donations:", error);
        return [];
      }

      return (data ?? []).map(mapDonation);
    } catch (e) {
      console.error("Error in donationsDb.list:", e);
      return [];
    }
  },
  async create(assocId: string, donationData: Omit<Donation, "id">): Promise<Donation | null> {
    try {
      console.log("Donation create data:", donationData);
      // First, try inserting only the basic fields that definitely exist
      const basicInsertData: Record<string, unknown> = {
        assoc_id: assocId,
        name: donationData.name,
        amount: donationData.amount,
        channel: donationData.paymentMethod || "نقد",
        status: donationData.status,
        date: donationData.date,
      };

      console.log("Basic insert data:", basicInsertData);

      const { data: row, error } = await supabase
        .from("donations")
        .insert(basicInsertData)
        .select()
        .single();

      if (error) {
        console.error("Basic insert failed, full error details:", JSON.stringify(error, null, 2));
        return null;
      }

      console.log("Inserted row:", row);

      // If basic insert worked, try to update with new fields if they exist
      if (row) {
        try {
          const updateData: Record<string, unknown> = {};
          if (donationData.donationNumber) updateData.donation_number = donationData.donationNumber;
          if (donationData.phone) updateData.phone = donationData.phone;
          if (donationData.projectName) updateData.project_name = donationData.projectName;
          if (donationData.paymentMethod) updateData.payment_method = donationData.paymentMethod;
          if (donationData.bank) updateData.bank = donationData.bank;
          if (donationData.accountNumber) updateData.account_number = donationData.accountNumber;
          if (donationData.source) updateData.source = donationData.source;

          if (Object.keys(updateData).length > 0) {
            console.log("Trying to update with new fields:", updateData);
            await supabase.from("donations").update(updateData).eq("id", row.id);
          }
        } catch (updateErr) {
          // Ignore update errors (columns might not exist yet)
          console.log("Update with new fields failed (columns might not exist yet):", updateErr);
        }
      }

      return row ? mapDonation(row as Record<string, unknown>) : null;
    } catch (e) {
      console.error("Error in donationsDb.create:", e);
      return null;
    }
  },
};

// ── Influencers (global) ───────────────────────────────────────
export const influencersDb = {
  async list(): Promise<Influencer[]> {
    const { data } = await supabase.from("influencers").select("*").order("name");
    return (data ?? []).map(mapInfluencer);
  },
  async create(data: Omit<Influencer, "id">): Promise<Influencer | null> {
    const {
      basePrice,
      instagramHandle,
      xHandle,
      tiktokHandle,
      youtubeHandle,
      snapchatHandle,
      ...rest
    } = data;
    const payload = {
      ...rest,
      base_price: basePrice,
      instagram_handle: instagramHandle,
      x_handle: xHandle,
      tiktok_handle: tiktokHandle,
      youtube_handle: youtubeHandle,
      snapchat_handle: snapchatHandle,
    };
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    const { data: row } = await supabase.from("influencers").insert(payload).select().single();
    return row ? mapInfluencer(row as Record<string, unknown>) : null;
  },
  async update(id: number, data: Partial<Omit<Influencer, "id">>): Promise<void> {
    const {
      basePrice,
      instagramHandle,
      xHandle,
      tiktokHandle,
      youtubeHandle,
      snapchatHandle,
      ...rest
    } = data;
    const payload: Record<string, unknown> = {
      ...rest,
      instagram_handle: instagramHandle,
      x_handle: xHandle,
      tiktok_handle: tiktokHandle,
      youtube_handle: youtubeHandle,
      snapchat_handle: snapchatHandle,
    };
    if (basePrice !== undefined) payload.base_price = basePrice;
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });
    await (supabase.from("influencers") as ReturnType<typeof supabase.from>)
      .update(payload)
      .eq("id", id);
  },
  async delete(id: number): Promise<void> {
    await supabase.from("influencers").delete().eq("id", id);
  },
};

// ── Campaigns ──────────────────────────────────────────────────
export const campaignsDb = {
  async list(assocId: string): Promise<Campaign[]> {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("assoc_id", assocId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapCampaign);
  },
  async create(assocId: string, data: Omit<Campaign, "id">): Promise<Campaign | null> {
    const { data: row } = await supabase
      .from("campaigns")
      .insert({ assoc_id: assocId, ...data })
      .select()
      .single();
    return row ? mapCampaign(row as Record<string, unknown>) : null;
  },
};

// ── Campaign Requests ──────────────────────────────────────────
export const requestsDb = {
  async create(
    assocId: string,
    influencerId: number,
    payload: { type: string; budget: number; startDate: string; duration: string; message: string },
  ): Promise<void> {
    await supabase.from("campaign_requests").insert({
      assoc_id: assocId,
      influencer_id: influencerId,
      type: payload.type,
      budget: payload.budget,
      start_date: payload.startDate,
      duration: payload.duration,
      message: payload.message,
    });
  },
};

// ── Admin: Orgs (profiles JOIN associations) ───────────────────
export type AdminOrg = {
  id: string;
  name: string;
  license: string;
  region: string;
  phone: string;
  email: string;
  description: string;
  status: "active" | "new" | "pending" | "suspended";
  verified: boolean;
  date: string;
};

export const adminOrgsDb = {
  async list(): Promise<AdminOrg[]> {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, assoc_name, created_at, associations(license, region, phone, email, description, status, verified)",
      )
      .eq("role", "association")
      .order("created_at", { ascending: false });
    return ((data ?? []) as Record<string, unknown>[]).map((row) => {
      const a = (row.associations as Record<string, unknown>) ?? {};
      return {
        id: row.id as string,
        name: (row.assoc_name as string) ?? "",
        license: (a.license as string) ?? "",
        region: (a.region as string) ?? "",
        phone: (a.phone as string) ?? "",
        email: (a.email as string) ?? "",
        description: (a.description as string) ?? "",
        status: ((a.status as string) ?? "active") as AdminOrg["status"],
        verified: (a.verified as boolean) ?? false,
        date: ((row.created_at as string) ?? "").slice(0, 10),
      };
    });
  },
  async upsert(
    id: string,
    name: string,
    fields: Omit<AdminOrg, "id" | "name" | "date" | "verified">,
  ): Promise<void> {
    await supabase.from("profiles").update({ assoc_name: name }).eq("id", id);
    await supabase
      .from("associations")
      .upsert({ id, ...fields, updated_at: new Date().toISOString() });
  },
  async setStatus(id: string, status: AdminOrg["status"]): Promise<void> {
    await supabase
      .from("associations")
      .upsert({ id, status, updated_at: new Date().toISOString() });
  },
};

// ── Associations (for onboarding and profile) ──────────────────────────────
export interface Association {
  id: string;
  license: string;
  region: string;
  phone: string;
  email: string;
  description: string;
  status: "active" | "new" | "pending" | "suspended";
  verified: boolean;
  updated_at: string;
}

export const associationsDb = {
  async get(id: string): Promise<Association | null> {
    const { data } = await supabase.from("associations").select("*").eq("id", id).maybeSingle();
    return data as Association | null;
  },
  async upsert(
    id: string,
    fields: Partial<Omit<Association, "id" | "updated_at" | "status" | "verified">>,
  ) {
    const { error } = await supabase.from("associations").upsert({
      id,
      ...fields,
      status: "new",
      verified: false,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`DB: ${error.message}`);
  },
};

// ── Association Profile Context ──────────────────────────────
export type GeneratedContentItem = {
  text: string;
  visualDesc?: string;
  imageUrl?: string;
  imageBase64?: string;
  videoUrl?: string;
  audioUrl?: string;
  slideFrames?: number[]; // per-slide duration in frames (video tab only)
  showLogo?: boolean;     // whether to show header watermark (video tab only)
  logoOverlayUrl?: string;  // user-uploaded logo URL (video tab only)
  logoAnimation?: string;   // LogoAnimation type
  logoPosition?: string;    // LogoPosition type
  // BrandedVideo fields
  brandColors?: string[];   // [primary, secondary, accent] hex
  transitionStyle?: string; // "slide" | "wipe" | "fade"
  showOutro?: boolean;
};
export type GeneratedContent = Record<
  "post" | "story" | "donation" | "video",
  GeneratedContentItem
>;

export interface ContentGeneration {
  id: number;
  prompt: string;
  content: GeneratedContent;
  createdAt: string;
  tokensUsed: number;
}

export const contentGenerationsDb = {
  async list(assocId: string): Promise<ContentGeneration[]> {
    console.log("[contentGenerationsDb.list] Called with assocId:", assocId);
    const { data, error } = await supabase
      .from("content_generations")
      .select("id, prompt, content, created_at, tokens_used")
      .eq("assoc_id", assocId)
      .order("created_at", { ascending: false })
      .limit(50);
    console.log("[contentGenerationsDb.list] Result data:", data, "error:", error);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: row.id as number,
      prompt: (row.prompt as string) ?? "",
      content: row.content as GeneratedContent,
      createdAt: row.created_at as string,
      tokensUsed: (row.tokens_used as number) ?? 0,
    }));
  },
  async create(
    assocId: string,
    prompt: string,
    content: GeneratedContent,
    tokensUsed = 0,
  ): Promise<ContentGeneration | null> {
    console.log("[contentGenerationsDb.create] assocId:", assocId, "prompt:", prompt.slice(0, 40));
    const { data: row, error } = await supabase
      .from("content_generations")
      .insert({ assoc_id: assocId, prompt, content, tokens_used: tokensUsed })
      .select("id, prompt, content, created_at, tokens_used")
      .single();
    if (error) {
      console.error("[contentGenerationsDb.create] Supabase error:", error.code, error.message, error.details, error.hint);
      throw new Error(`DB create failed: ${error.message}`);
    }
    if (!row) return null;
    const r = row as Record<string, unknown>;
    console.log("[contentGenerationsDb.create] created row id:", r.id);
    return {
      id: r.id as number,
      prompt: (r.prompt as string) ?? "",
      content: r.content as GeneratedContent,
      createdAt: r.created_at as string,
      tokensUsed: (r.tokens_used as number) ?? 0,
    };
  },
  async updatePrompt(id: number, prompt: string): Promise<void> {
    const { error } = await supabase.from("content_generations").update({ prompt }).eq("id", id);
    if (error) throw new Error(error.message);
  },
  async update(id: number, content: GeneratedContent, tokensUsed?: number, prompt?: string): Promise<void> {
    const payload: Record<string, unknown> = { content };
    if (tokensUsed !== undefined) payload.tokens_used = tokensUsed;
    if (prompt !== undefined) payload.prompt = prompt;
    const { error } = await supabase.from("content_generations").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export interface AssocProfile {
  description: string | null;
  ai_summary: string | null;
  ai_ideas: string[] | null;
  ai_pain_points: string[] | null;
  ai_content: GeneratedContent | null;
  pdf_url: string | null;
  ai_brand: string | null;
  openai_file_id: string | null;
}

export const assocProfileDb = {
  async get(id: string): Promise<AssocProfile | null> {
    console.log("[assocProfileDb.get] Called with id:", id);
    const { data, error } = await supabase
      .from("associations")
      .select("description, ai_summary, ai_ideas, ai_pain_points, ai_content, pdf_url, ai_brand, openai_file_id")
      .eq("id", id)
      .maybeSingle();
    console.log("[assocProfileDb.get] Result data:", data, "error:", error);
    return data as AssocProfile | null;
  },
  async update(
    id: string,
    description: string,
    aiResult?: { summary: string; ideas: string[]; painPoints: string[] },
  ) {
    const now = new Date().toISOString();

    // Always save description (column always exists)
    const { error: descErr } = await supabase
      .from("associations")
      .upsert({ id, description, updated_at: now }, { onConflict: "id" });
    if (descErr) throw new Error(`DB: ${descErr.message}`);

    // Save AI fields separately — columns added via migration 009
    if (aiResult) {
      const { error: aiErr } = await supabase
        .from("associations")
        .update({
          ai_summary: aiResult.summary,
          ai_ideas: aiResult.ideas,
          ai_pain_points: aiResult.painPoints,
          updated_at: now,
        })
        .eq("id", id);
      if (aiErr) throw new Error(`AI fields not saved (run migration 009): ${aiErr.message}`);
    }
  },
  async saveContent(id: string, content: GeneratedContent) {
    const { error } = await supabase
      .from("associations")
      .update({ ai_content: content, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`DB: ${error.message}`);
  },
  async savePdfUrl(id: string, pdf_url: string) {
    const { error } = await supabase
      .from("associations")
      .update({ pdf_url, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`DB: ${error.message}`);
  },
  async saveBrand(id: string, ai_brand: string) {
    const { error } = await supabase
      .from("associations")
      .update({ ai_brand, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`DB: ${error.message}`);
  },
  async saveOpenAiFileId(id: string, openai_file_id: string) {
    const { error } = await supabase
      .from("associations")
      .update({ openai_file_id, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`DB: ${error.message}`);
  },
};

// ── Admin: Campaign requests with joined names ─────────────────
export type AdminRequest = {
  id: number;
  orgId: string;
  infId: number;
  orgName: string;
  infName: string;
  type: string;
  budget: number;
  date: string;
  duration: string;
  message: string;
  status: "pending" | "matched" | "completed" | "rejected" | "approved";
};

export const adminRequestsDb = {
  async list(): Promise<AdminRequest[]> {
    const { data } = await supabase
      .from("campaign_requests")
      .select(
        "id, assoc_id, influencer_id, type, budget, start_date, duration, message, status, created_at, profiles!assoc_id(assoc_name), influencers!influencer_id(name)",
      )
      .order("created_at", { ascending: false });
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: row.id as number,
      orgId: row.assoc_id as string,
      infId: row.influencer_id as number,
      orgName: ((row.profiles as Record<string, unknown>)?.assoc_name as string) ?? "—",
      infName: ((row.influencers as Record<string, unknown>)?.name as string) ?? "—",
      type: (row.type as string) ?? "",
      budget: (row.budget as number) ?? 0,
      date: ((row.start_date ?? row.created_at) as string).slice(0, 10),
      duration: (row.duration as string) ?? "",
      message: (row.message as string) ?? "",
      status: row.status as AdminRequest["status"],
    }));
  },
  async update(
    id: number,
    fields: Partial<Pick<AdminRequest, "type" | "budget" | "duration" | "message" | "status">>,
  ): Promise<void> {
    await supabase.from("campaign_requests").update(fields).eq("id", id);
  },
};

// ── Admin: Matches with joined names ──────────────────────────
export type AdminMatch = {
  id: number;
  orgId: string;
  infId: number;
  orgName: string;
  infName: string;
  value: number;
  status: "active" | "pending" | "completed";
  notes: string;
  date: string;
};

export const adminMatchesDb = {
  async list(): Promise<AdminMatch[]> {
    const { data } = await supabase
      .from("matches")
      .select(
        "id, assoc_id, influencer_id, status, start_date, budget, notes, created_at, profiles!assoc_id(assoc_name), influencers!influencer_id(name)",
      )
      .order("created_at", { ascending: false });
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: row.id as number,
      orgId: row.assoc_id as string,
      infId: row.influencer_id as number,
      orgName: ((row.profiles as Record<string, unknown>)?.assoc_name as string) ?? "—",
      infName: ((row.influencers as Record<string, unknown>)?.name as string) ?? "—",
      value: (row.budget as number) ?? 0,
      status: (row.status as AdminMatch["status"]) ?? "active",
      notes: (row.notes as string) ?? "",
      date: ((row.start_date ?? row.created_at) as string).slice(0, 10),
    }));
  },
  async create(fields: {
    assocId: string;
    infId: number;
    budget: number;
    notes: string;
    startDate: string;
  }): Promise<number | null> {
    const { data } = await supabase
      .from("matches")
      .insert({
        assoc_id: fields.assocId,
        influencer_id: fields.infId,
        budget: fields.budget,
        notes: fields.notes,
        start_date: fields.startDate,
        status: "active",
      })
      .select("id")
      .single();
    return data ? (data.id as number) : null;
  },
  async update(
    id: number,
    fields: Partial<Pick<AdminMatch, "status" | "value" | "notes">>,
  ): Promise<void> {
    const payload: Record<string, unknown> = { ...fields };
    if (fields.value !== undefined) {
      payload.budget = fields.value;
      delete payload.value;
    }
    await (supabase.from("matches") as ReturnType<typeof supabase.from>)
      .update(payload)
      .eq("id", id);
  },
};
