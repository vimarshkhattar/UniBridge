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

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
