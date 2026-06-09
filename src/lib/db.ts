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
    name: row.name as string,
    amount: row.amount as number,
    channel: row.channel as string,
    date: row.date as string,
    status: row.status as Donation["status"],
    org: (row.org as string) ?? "",
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
    const { data } = await supabase
      .from("donations")
      .select("*")
      .eq("assoc_id", assocId)
      .order("date", { ascending: false });
    return (data ?? []).map(mapDonation);
  },
  async create(assocId: string, data: Omit<Donation, "id">): Promise<Donation | null> {
    const { data: row } = await supabase
      .from("donations")
      .insert({ assoc_id: assocId, ...data })
      .select()
      .single();
    return row ? mapDonation(row as Record<string, unknown>) : null;
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

// ── Association Profile Context ──────────────────────────────
export const assocProfileDb = {
  async get(id: string) {
    const { data } = await supabase
      .from("associations")
      .select("description")
      .eq("id", id)
      .single();
    return data;
  },
  async update(id: string, description: string) {
    const { error } = await supabase
      .from("associations")
      .update({ description, updated_at: new Date().toISOString() })
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
