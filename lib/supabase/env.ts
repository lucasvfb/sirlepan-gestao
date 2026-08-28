const ERP_PROJECT_REF = "vkbkjwbsfrxqocyltbzi";
const ERP_URL = `https://${ERP_PROJECT_REF}.supabase.co`;
const ERP_PUBLISHABLE_KEY = "sb_publishable_oUD6SoPxPrT2x-PLne-7aA_pTUAohxK";

function normalizePublicKey(rawValue?: string) {
  return (rawValue || "").trim().replace(/^["']|["']$/g, "");
}

export function getSupabasePublicConfig() {
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().toLowerCase();
  const envPointsToErp = rawUrl.includes(ERP_PROJECT_REF);
  const envKey = normalizePublicKey(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return {
    url: ERP_URL,
    key: envPointsToErp && envKey ? envKey : ERP_PUBLISHABLE_KEY,
    configured: true
  };
}
