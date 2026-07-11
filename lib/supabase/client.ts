import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./env";

let browserClient: SupabaseClient | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, key, configured } = getSupabasePublicConfig();

  if (!configured) {
    throw new Error(
      "A chave pública do Supabase não foi encontrada. Na Vercel, cadastre NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY com a chave que começa por sb_publishable_."
    );
  }

  browserClient = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce"
    }
  });

  return browserClient;
}
