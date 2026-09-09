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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await getAppOrigin()}/auth/callback?next=/onboarding`
    }
  });

  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);

  // With email confirmation switched off in Supabase, sign-up returns a live
  // session and the student goes straight into onboarding.
  if (data.session) redirect("/onboarding");

  redirect(`/sign-in?message=${encodeURIComponent("Account created. Sign in to finish setting up your profile.")}&next=/onboarding`);
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect(next);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("major,academic_year")
    .eq("id", data.user.id)
    .maybeSingle();
  const needsProfileSetup = !profile?.major || !profile?.academic_year;

  redirect(needsProfileSetup ? "/onboarding" : next);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
