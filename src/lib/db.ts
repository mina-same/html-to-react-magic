import { supabase } from "./supabase";
import type { Employee, Task, Donation, Influencer, Campaign } from "@/components/association/types";

// ── Helpers ────────────────────────────────────────────────────
function mapEmployee(row: Record<string, unknown>): Employee {
  return { id: row.id as number, name: row.name as string, role: row.role as string, status: row.status as Employee["status"], color: row.color as string };
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
    platform: row.platform as string,
    followers: row.followers as number,
    engagement: row.engagement as number,
    status: row.status as Influencer["status"],
    campaigns: row.campaigns as number,
    niche: (row.niche as string) ?? "",
    notes: (row.notes as string) ?? "",
    basePrice: row.base_price as number,
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
    const { data } = await supabase.from("employees").select("*").eq("assoc_id", assocId).order("created_at");
    return (data ?? []).map(mapEmployee);
  },
  async create(assocId: string, data: Omit<Employee, "id">): Promise<Employee | null> {
    const { data: row } = await supabase.from("employees").insert({ assoc_id: assocId, ...data }).select().single();
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
    const { data } = await supabase.from("tasks").select("*").eq("assoc_id", assocId).order("created_at");
    return (data ?? []).map(mapTask);
  },
  async create(assocId: string, data: Omit<Task, "id">): Promise<Task | null> {
    const payload = { assoc_id: assocId, ...data, assignee: data.assignee || null, deadline: data.deadline || null };
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
    const { data } = await supabase.from("donations").select("*").eq("assoc_id", assocId).order("date", { ascending: false });
    return (data ?? []).map(mapDonation);
  },
  async create(assocId: string, data: Omit<Donation, "id">): Promise<Donation | null> {
    const { data: row } = await supabase.from("donations").insert({ assoc_id: assocId, ...data }).select().single();
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
    const payload = { ...data, base_price: data.basePrice };
    const { data: row } = await supabase.from("influencers").insert(payload).select().single();
    return row ? mapInfluencer(row as Record<string, unknown>) : null;
  },
  async update(id: number, data: Partial<Omit<Influencer, "id">>): Promise<void> {
    const payload: Record<string, unknown> = { ...data };
    if (data.basePrice !== undefined) { payload.base_price = data.basePrice; delete payload.basePrice; }
    await supabase.from("influencers").update(payload).eq("id", id);
  },
  async delete(id: number): Promise<void> {
    await supabase.from("influencers").delete().eq("id", id);
  },
};

// ── Campaigns ──────────────────────────────────────────────────
export const campaignsDb = {
  async list(assocId: string): Promise<Campaign[]> {
    const { data } = await supabase.from("campaigns").select("*").eq("assoc_id", assocId).order("created_at", { ascending: false });
    return (data ?? []).map(mapCampaign);
  },
  async create(assocId: string, data: Omit<Campaign, "id">): Promise<Campaign | null> {
    const { data: row } = await supabase.from("campaigns").insert({ assoc_id: assocId, ...data }).select().single();
    return row ? mapCampaign(row as Record<string, unknown>) : null;
  },
};

// ── Campaign Requests ──────────────────────────────────────────
export const requestsDb = {
  async create(assocId: string, influencerId: number, payload: { type: string; budget: number; startDate: string; duration: string; message: string }): Promise<void> {
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
