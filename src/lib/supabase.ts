import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url  = import.meta.env.VITE_SUPABASE_URL  as string;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (input, init) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
      return fetch(input, { ...init, signal: controller.signal })
        .then((res) => {
          clearTimeout(timeoutId);
          return res;
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          throw err;
        });
    },
  },
});
