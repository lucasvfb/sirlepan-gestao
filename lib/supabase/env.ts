const FALLBACK_PROJECT_URL = "https://popbipbawdgqoyqptehe.supabase.co";

export function getSupabasePublicConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    FALLBACK_PROJECT_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return {
    url: url.trim(),
    key: key.trim(),
    configured: Boolean(url.trim() && key.trim())
  };
}
