"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STONY_BROOK_EMAIL_DOMAIN = "@stonybrook.edu";

async function getAppOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/onboarding");

  if (!email.endsWith(STONY_BROOK_EMAIL_DOMAIN)) {
    redirect(`/sign-up?error=${encodeURIComponent("Please use your Stony Brook email address.")}`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await getAppOrigin()}/auth/callback?next=/dashboard`
    }
  });

  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  await supabase.auth.signOut();
  redirect(`/sign-in?message=${encodeURIComponent("Account created. Check your Stony Brook email for the confirmation code or link before signing in.")}`);
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect(next);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    redirect(`/sign-in?error=${encodeURIComponent("Please confirm your Stony Brook email before signing in.")}`);
  }

  redirect(next);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
