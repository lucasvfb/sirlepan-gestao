import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function normalizeSupabaseUrl(rawValue?: string) {
  const fallbackRef = "popbipbawdgqoyqptehe";
  const raw = (rawValue || "").trim();

  const refMatch = raw.match(/([a-z0-9]{15,30})\.supabase\.co/i);
  if (refMatch?.[1]) {
    return `https://${refMatch[1].toLowerCase()}.supabase.co`;
  }

  const cleanRef = raw
    .replace(/^https?:\/\//i, "")
    .replace(/\.supabase\.co.*$/i, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  return /^[a-z0-9]{15,30}$/.test(cleanRef)
    ? `https://${cleanRef}.supabase.co`
    : `https://${fallbackRef}.supabase.co`;
}

const PROJECT_URL = normalizeSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

const PUBLIC_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!PUBLIC_KEY) {
    return response;
  }

  const supabase = createServerClient(PROJECT_URL, PUBLIC_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isConfig = pathname === "/configuracao";
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

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

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
