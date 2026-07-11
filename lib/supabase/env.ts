const FALLBACK_PROJECT_REF = "popbipbawdgqoyqptehe";

function normalizeSupabaseUrl(rawValue?: string) {
  const raw = (rawValue || "").trim();

  if (!raw) {
    return `https://${FALLBACK_PROJECT_REF}.supabase.co`;
  }

  // Aceita URL completa, Project ID puro ou valor colado com caminhos extras.
  const refMatch = raw.match(/([a-z0-9]{15,30})\.supabase\.co/i);
  if (refMatch?.[1]) {
    return `https://${refMatch[1].toLowerCase()}.supabase.co`;
  }

  const cleanRef = raw
    .replace(/^https?:\/\//i, "")
    .replace(/\.supabase\.co.*$/i, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  if (/^[a-z0-9]{15,30}$/.test(cleanRef)) {
    return `https://${cleanRef}.supabase.co`;
  }

  return `https://${FALLBACK_PROJECT_REF}.supabase.co`;
}

function normalizePublicKey(rawValue?: string) {
  return (rawValue || "").trim().replace(/^["']|["']$/g, "");
}

export function getSupabasePublicConfig() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const key = normalizePublicKey(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return {
    url,
    key,
    configured: Boolean(url && key)
  };
}
