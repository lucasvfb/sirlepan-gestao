import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

const { url, key } = getSupabasePublicConfig();

export const supabase = createClient(url, key);

export function supabaseConfigured() {
  return Boolean(url && key);
}
