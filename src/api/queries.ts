import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  adminOrgsDb,
  adminRequestsDb,
  adminMatchesDb,
  influencersDb,
  employeesDb,
  tasksDb,
  campaignsDb,
  donationsDb,
  contentGenerationsDb,
  assocProfileDb,
  type AdminOrg,
  type AdminRequest,
  type AdminMatch,
  type ContentGeneration,
  type AssocProfile,
} from "@/lib/db";
import type {
  Influencer,
  Employee,
  Task,
  Campaign,
  Donation,
} from "@/components/association/types";
import { keys } from "./keys";

/**
 * Shared defaults: stale data is shown instantly while refetching in the
 * background, refetches when the window regains focus, retries 3x on failure.
 * This is what eliminates the "stuck loading forever" UX — the UI renders
 * with cached data and revalidates transparently.
 */
const defaultOpts = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: 3,
  refetchOnWindowFocus: true as const,
};

// ── Admin / platform-wide ────────────────────────────────────────

/** Org list with the `notes` alias the admin UI expects. */
export interface AdminOrgRow extends AdminOrg {
  notes: string;
}

export function useAdminOrgs(enabled = true) {
  return useQuery<AdminOrgRow[]>({
    queryKey: keys.orgs(),
    queryFn: async () => {
      const rows = await adminOrgsDb.list();
      return rows.map((o) => ({ ...o, notes: o.description }));
    },
    enabled,
    ...defaultOpts,
  });
}

/** Influencer list with the `price` alias + narrowed status the admin UI expects. */
export interface AdminInfluencerRow extends Influencer {
  price: number;
  status: "active" | "pending" | "ended";
}

export function useAdminInfluencers(enabled = true) {
  return useQuery<AdminInfluencerRow[]>({
    queryKey: keys.adminInfluencers(),
    queryFn: async () => {
      const rows = await influencersDb.list();
      return rows.map((i) => ({
        ...i,
        price: i.basePrice,
        status: i.status as "active" | "pending" | "ended",
      }));
    },
    enabled,
    ...defaultOpts,
  });
}

export function useAdminRequests(enabled = true) {
  return useQuery<AdminRequest[]>({
    queryKey: keys.requests(),
    queryFn: () => adminRequestsDb.list(),
    enabled,
    ...defaultOpts,
  });
}

export function useAdminMatches(enabled = true) {
  return useQuery<AdminMatch[]>({
    queryKey: keys.matches(),
    queryFn: () => adminMatchesDb.list(),
    enabled,
    ...defaultOpts,
  });
}

// ── Association-scoped ───────────────────────────────────────────

export function useEmployees(assocId: string | undefined, enabled = true) {
  return useQuery<Employee[]>({
    queryKey: keys.employees(assocId ?? ""),
    queryFn: () => employeesDb.list(assocId as string),
    enabled: !!assocId && enabled,
    ...defaultOpts,
  });
}

export function useTasks(assocId: string | undefined, enabled = true) {
  return useQuery<Task[]>({
    queryKey: keys.tasks(assocId ?? ""),
    queryFn: () => tasksDb.list(assocId as string),
    enabled: !!assocId && enabled,
    ...defaultOpts,
  });
}

export function useCampaigns(assocId: string | undefined, enabled = true) {
  return useQuery<Campaign[]>({
    queryKey: keys.campaigns(assocId ?? ""),
    queryFn: () => campaignsDb.list(assocId as string),
    enabled: !!assocId && enabled,
    ...defaultOpts,
  });
}

export function useDonations(assocId: string | undefined, enabled = true) {
  return useQuery<Donation[]>({
    queryKey: keys.donations(assocId ?? ""),
    queryFn: () => donationsDb.list(assocId as string),
    enabled: !!assocId && enabled,
    ...defaultOpts,
  });
}

export function useContentGenerations(assocId: string | undefined, enabled = true) {
  return useQuery<ContentGeneration[]>({
    queryKey: keys.content(assocId ?? ""),
    queryFn: () => contentGenerationsDb.list(assocId as string),
    enabled: !!assocId && enabled,
    ...defaultOpts,
  });
}

export function useAssocProfile(assocId: string | undefined, enabled = true) {
  return useQuery<AssocProfile | null>({
    queryKey: keys.assocProfile(assocId ?? ""),
    queryFn: () => assocProfileDb.get(assocId as string),
    enabled: !!assocId && enabled,
    ...defaultOpts,
  });
}

// ── Global influencers (shared) ─────────────────────────────────

export function useInfluencers(enabled = true) {
  return useQuery<Influencer[]>({
    queryKey: keys.influencers(),
    queryFn: () => influencersDb.list(),
    enabled,
    ...defaultOpts,
  });
}

// ── Employee dashboard ───────────────────────────────────────────

/** The signed-in employee's own row within their association. */
export function useMyEmployeeRecord(
  assocId: string | undefined,
  userId: string | undefined,
  enabled = true,
) {
  return useQuery<Employee | null>({
    queryKey: keys.myEmployee(assocId ?? "", userId ?? ""),
    queryFn: async () => {
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("assoc_id", assocId as string)
        .eq("user_id", userId as string)
        .maybeSingle();
      if (!data) return null;
      const row = data as Record<string, unknown>;
      return {
        id: row.id as number,
        name: row.name as string,
        role: row.role as string,
        status: row.status as Employee["status"],
        color: row.color as string,
      };
    },
    enabled: !!assocId && !!userId && enabled,
    ...defaultOpts,
  });
}

/** The association owner's display name (for the employee header). */
export function useAssocOwnerName(assocId: string | undefined, enabled = true) {
  return useQuery<string>({
    queryKey: ["assoc", assocId ?? "", "owner-name"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("assoc_name")
        .eq("id", assocId as string)
        .single();
      return (data?.assoc_name as string) ?? "";
    },
    enabled: !!assocId && enabled,
    ...defaultOpts,
  });
}
