import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./env";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, key, configured } = getSupabasePublicConfig();

  if (!configured) {
    throw new Error(
      "A chave pública do Supabase não foi configurada na Vercel."
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // A escrita de cookies não está disponível em todos os Server Components.
        }
      }
    }
  });
}
