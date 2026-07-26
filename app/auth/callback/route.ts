import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const redirectTo = new URL(next, requestUrl.origin);

  if (!code) {
    redirectTo.pathname = "/sign-in";
    redirectTo.searchParams.set("error", "Authentication link is missing a code.");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectTo.pathname = "/sign-in";
    redirectTo.searchParams.set("error", "Authentication is not configured.");
    return NextResponse.redirect(redirectTo);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectTo.pathname = "/sign-in";
    redirectTo.searchParams.set("error", error.message);
    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.redirect(redirectTo);
}
