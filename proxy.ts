import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = ["/dashboard", "/discover", "/events", "/assistant", "/guides", "/connections", "/profile", "/settings", "/onboarding"];

export async function proxy(request: NextRequest) {
  const shouldProtect = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  const hasSupabaseEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!shouldProtect || !hasSupabaseEnv) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  // getClaims verifies the JWT locally using the project's signing key, so a
  // page change costs no network round trip. getUser() called the Supabase auth
  // server on every single navigation, which is what made each tab feel slow.
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Only the protected app routes need an auth check. Everything else (static
  // assets, API routes, the public marketing pages) skips the middleware.
  matcher: [
    "/dashboard/:path*",
    "/discover/:path*",
    "/events/:path*",
    "/assistant/:path*",
    "/guides/:path*",
    "/connections/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*"
  ]
};
