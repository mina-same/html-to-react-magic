import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  adminOrgsDb,
  adminRequestsDb,
  influencersDb,
  employeesDb,
  tasksDb,
  campaignsDb,
  donationsDb,
  requestsDb,
  type AdminOrg,
} from "@/lib/db";
import { toast } from "sonner";
import type { Influencer, Employee, Task, Donation } from "@/components/association/types";
import type { AdminInfluencerRow, AdminOrgRow } from "./queries";
import { keys } from "./keys";

/**
 * Mutation hooks.
 *
 * Each hook owns its cache-invalidating `onSuccess` so components never have
 * to remember which keys to refresh. Components pass their own `onSuccess`
 * (for toasts / closing modals) to `mutate(...)` — React Query runs both.
 */

// ── Admin: Orgs ──────────────────────────────────────────────────

export interface SaveOrgInput {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  license?: string;
  region?: string;
  phone?: string;
  notes?: string;
  status?: AdminOrg["status"];
}

export function useSaveOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveOrgInput) => {
      // Create path: provision the auth account via the edge function.
      if (!data.id) {
        const { error } = await supabase.functions.invoke("create-user", {
          body: {
            email: data.email ?? "",
            password: data.password ?? "",
            assocName: data.name ?? "",
            license: data.license ?? "",
            region: data.region ?? "",
            phone: data.phone ?? "",
            status: data.status ?? "new",
          },
        });
        if (error) throw new Error(error.message);
        return null;
      }
      // Update path: upsert profile + association row.
      await adminOrgsDb.upsert(data.id, data.name ?? "", {
        license: data.license ?? "",
        region: data.region ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        description: data.notes ?? "",
        status: data.status ?? "active",
      });
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.orgs() }),
  });
}

export function useSuspendOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminOrgsDb.setStatus(id, "suspended"),
    // Optimistic flip for snappy UX.
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: keys.orgs() });
      const prev = qc.getQueryData<AdminOrgRow[]>(keys.orgs());
      qc.setQueryData<AdminOrgRow[]>(keys.orgs(), (old) =>
        (old ?? []).map((o) => (o.id === id ? { ...o, status: "suspended" } : o)),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => ctx?.prev && qc.setQueryData(keys.orgs(), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.orgs() }),
  });
}

// ── Admin: Influencers ───────────────────────────────────────────

export type SaveInfluencerInput = Partial<Omit<AdminInfluencerRow, "platform" | "id">> & {
  id?: number;
  platform?: string;
};

export function useSaveInfluencer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveInfluencerInput) => {
      if (data.id) {
        await influencersDb.update(data.id, {
          name: data.name,
          platform: data.platform as Influencer["platform"] | undefined,
          followers: data.followers,
          engagement: data.engagement,
          status: data.status as Influencer["status"] | undefined,
          niche: data.niche,
          notes: data.notes,
          basePrice: data.price,
        });
        return data.id;
      }
      const created = await influencersDb.create({
        name: data.name ?? "",
        platform: (data.platform ?? "Instagram") as Influencer["platform"],
        followers: data.followers ?? 0,
        engagement: data.engagement ?? 0,
        status: (data.status ?? "active") as Influencer["status"],
        campaigns: 0,
        niche: data.niche ?? "",
        notes: data.notes ?? "",
        basePrice: data.price ?? 0,
        bio: data.bio ?? "",
        location: data.location ?? "",
        audience: data.audience ?? "",
        instagramHandle: data.instagramHandle ?? "",
        xHandle: data.xHandle ?? "",
        tiktokHandle: data.tiktokHandle ?? "",
        youtubeHandle: data.youtubeHandle ?? "",
        snapchatHandle: data.snapchatHandle ?? "",
        website: data.website ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
      });
      return created?.id ?? null;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.adminInfluencers() });
      qc.invalidateQueries({ queryKey: keys.influencers() });
    },
  });
}

export function useDeleteInfluencer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => influencersDb.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.adminInfluencers() });
      qc.invalidateQueries({ queryKey: keys.influencers() });
    },
  });
}

// ── Admin: Requests ──────────────────────────────────────────────

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      fields,
    }: {
      id: number;
      fields: Parameters<typeof adminRequestsDb.update>[1];
    }) => adminRequestsDb.update(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.requests() }),
  });
}

// ── Association: Tasks ───────────────────────────────────────────

export function useSaveTask(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: Omit<Task, "id"> }) => {
      if (id) {
        await tasksDb.update(id, data);
        return { ...data, id };
      }
      const created = await tasksDb.create(assocId as string, data);
      return created ?? null;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.tasks(assocId ?? "") }),
  });
}

export function useDeleteTask(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksDb.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.tasks(assocId ?? "") }),
  });
}

export function useUpdateTaskStatus(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Task["status"] }) =>
      tasksDb.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: keys.tasks(assocId ?? "") });
      const prev = qc.getQueryData<Task[]>(keys.tasks(assocId ?? ""));
      qc.setQueryData<Task[]>(keys.tasks(assocId ?? ""), (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, status } : t)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(keys.tasks(assocId ?? ""), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.tasks(assocId ?? "") }),
  });
}

// ── Association: Employees ───────────────────────────────────────

const EMP_COLORS = ["#7c3aed", "#be185d", "#0369a1", "#b91c1c", "#166534", "#92400e", "#0f766e"];

export function useSaveEmployee(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ employee, count }: { employee: Employee; count: number }) => {
      if (employee.id) {
        await employeesDb.update(employee.id, {
          name: employee.name,
          role: employee.role,
          status: employee.status,
          color: employee.color,
        });
        return employee;
      }
      const color = EMP_COLORS[count % EMP_COLORS.length];
      const created = await employeesDb.create(assocId as string, {
        name: employee.name,
        role: employee.role,
        status: employee.status,
        color,
      });
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.employees(assocId ?? "") }),
  });
}

export function useDeleteEmployee(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesDb.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.employees(assocId ?? "") }),
  });
}

export function useUpdateEmployeeStatus(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Employee["status"] }) =>
      employeesDb.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.employees(assocId ?? "") }),
  });
}

// ── Association: Donations ───────────────────────────────────────

export function useCreateDonation(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Donation, "id">) => donationsDb.create(assocId as string, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.donations(assocId ?? "") }),
  });
}

// ── Association: Campaign Request ────────────────────────────────

export function useSubmitCampaignRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      assocId,
      influencerId,
      payload,
    }: {
      assocId: string;
      influencerId: number;
      payload: {
        type: string;
        budget: number;
        startDate: string;
        duration: string;
        message: string;
      };
    }) => requestsDb.create(assocId, influencerId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.requests() }),
  });
}

// ── Association: Campaigns ───────────────────────────────────────

export function useCreateCampaign(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Parameters<typeof campaignsDb.create>[1], never>) =>
      campaignsDb.create(assocId as string, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.campaigns(assocId ?? "") }),
  });
}

/**
 * Convenience wrapper: runs a mutation and surfaces a toast for both
 * success and error outcomes. Keeps route components free of try/catch.
 */
export function withToast<T, V>(
  mutation: { mutateAsync: (vars: V) => Promise<T>; isPending: boolean },
  messages: { success: string; error: string },
) {
  return async (vars: V): Promise<T | undefined> => {
    try {
      const result = await mutation.mutateAsync(vars);
      toast.success(messages.success);
      return result;
    } catch (err) {
      toast.error(`${messages.error}: ${err instanceof Error ? err.message : String(err)}`);
      return undefined;
    }
  };
}
