import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const ERP_PROJECT_REF = "vkbkjwbsfrxqocyltbzi";
const PROJECT_URL = `https://${ERP_PROJECT_REF}.supabase.co`;
const ERP_PUBLISHABLE_KEY = "sb_publishable_oUD6SoPxPrT2x-PLne-7aA_pTUAohxK";
const rawEnvUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").toLowerCase();
const envKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const PUBLIC_KEY = rawEnvUrl.includes(ERP_PROJECT_REF) && envKey ? envKey : ERP_PUBLISHABLE_KEY;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(PROJECT_URL, PUBLIC_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isConfig = pathname === "/configuracao";
  const isPublicAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".");

  if (isPublicAsset || isConfig) return response;
  if (!user && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (user && isLogin) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }
  return response;
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
