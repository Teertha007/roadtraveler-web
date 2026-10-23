import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "@/lib/env";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!supabaseConfigured()) return null;
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
