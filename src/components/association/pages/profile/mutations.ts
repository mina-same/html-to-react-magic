import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assocProfileDb } from "@/lib/db";
import { keys } from "@/api/keys";
import type { AnalysisResult } from "./constants";

/**
 * Local mutation hooks for the association profile page.
 *
 * Each hook wraps a single `assocProfileDb` write and invalidates the
 * `["assoc", assocId, "profile"]` cache so `useAssocProfile` refetches.
 * Components call `mutateAsync` (or `mutate`) and pass their own
 * `onSuccess` / `onError` callbacks to `mutate(...)` — React Query runs
 * both the cache-invalidation `onSuccess` defined here and the per-call one.
 */

export interface UpdateProfileInput {
  id: string;
  description: string;
  aiResult?: AnalysisResult;
}

export function useUpdateAssocProfile(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, description, aiResult }: UpdateProfileInput) =>
      assocProfileDb.update(id, description, aiResult),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.assocProfile(assocId ?? "") }),
  });
}

export function useSavePdfUrl(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pdfUrl }: { id: string; pdfUrl: string }) =>
      assocProfileDb.savePdfUrl(id, pdfUrl),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.assocProfile(assocId ?? "") }),
  });
}

export function useSaveBrand(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, brand }: { id: string; brand: string }) =>
      assocProfileDb.saveBrand(id, brand),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.assocProfile(assocId ?? "") }),
  });
}

export function useSaveOpenAiFileId(assocId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fileId }: { id: string; fileId: string }) =>
      assocProfileDb.saveOpenAiFileId(id, fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.assocProfile(assocId ?? "") }),
  });
}
