import { supabase } from "./supabase";

export type AIFeature =
  | "content-generation"
  | "tts"
  | "image-generation"
  | "brand-extraction"
  | "profile-analysis"
  | "caption-transcription";

/**
 * Fire-and-forget log of a single AI call into the `ai_usage` table.
 * Never throws — usage tracking must not break the feature that used AI.
 * `tokensUsed` is 0 for services that don't report tokens (TTS, DALL-E, Whisper).
 */
export function trackAIUsage(feature: AIFeature, model: string, tokensUsed = 0): void {
  void (async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;
      const { error } = await supabase
        .from("ai_usage")
        .insert({ assoc_id: userId, feature, model, tokens_used: Math.max(0, tokensUsed | 0) });
      if (error) console.warn("[trackAIUsage] insert failed:", error.message);
    } catch (err) {
      console.warn("[trackAIUsage] failed:", err);
    }
  })();
}

export interface AIUsageStats {
  totalTokens: number;
  callCount: number;
  lastUsed: string | null;
}

export async function getAIUsageStats(assocId: string): Promise<AIUsageStats> {
  const { data, error } = await supabase
    .from("ai_usage")
    .select("tokens_used, created_at")
    .eq("assoc_id", assocId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return {
    totalTokens: rows.reduce((sum, r) => sum + (r.tokens_used ?? 0), 0),
    callCount: rows.length,
    lastUsed: rows[0]?.created_at ?? null,
  };
}
