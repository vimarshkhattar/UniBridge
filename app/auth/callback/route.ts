import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const redirectTo = new URL(next.startsWith("/") ? next : "/dashboard", requestUrl.origin);

  function redirectWithError(message: string) {
    const errorUrl = new URL("/sign-in", requestUrl.origin);
    errorUrl.searchParams.set("error", message);
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    return redirectWithError("Authentication link is missing a code.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return redirectWithError("Authentication is not configured.");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code).catch((exchangeError: unknown) => ({
    error: exchangeError instanceof Error ? exchangeError : new Error("Could not complete authentication.")
  }));

  if (error) {
    return redirectWithError(error.message);
  }

  return NextResponse.redirect(redirectTo);
}
