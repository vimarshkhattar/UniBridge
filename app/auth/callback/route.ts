import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl.clone();
  const code = requestUrl.searchParams.get("code");
  const providerError = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const redirectTo = new URL(next.startsWith("/") ? next : "/dashboard", requestUrl.origin);

  function redirectWithError(message: string, pathname = "/sign-in") {
    const errorUrl = new URL(pathname, requestUrl.origin);
    errorUrl.searchParams.set("error", message);
    return NextResponse.redirect(errorUrl);
  }

  if (providerError) {
    return redirectWithError(providerError, next === "/reset-password" ? "/forgot-password" : "/sign-in");
  }

  if (!code) {
    return redirectWithError("Authentication link is missing a code.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return redirectWithError("Authentication is not configured.", next === "/reset-password" ? "/forgot-password" : "/sign-in");
  }

  const response = NextResponse.redirect(redirectTo);
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code).catch((exchangeError: unknown) => ({
    error: exchangeError instanceof Error ? exchangeError : new Error("Could not complete authentication.")
  }));

  if (error) {
    return redirectWithError(error.message, next === "/reset-password" ? "/forgot-password" : "/sign-in");
  }

  return response;
}
