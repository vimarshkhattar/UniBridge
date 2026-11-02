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
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/onboarding");

  if (!email.endsWith(STONY_BROOK_EMAIL_DOMAIN)) {
    redirect(`/sign-up?error=${encodeURIComponent("Please use your Stony Brook email address.")}`);
  }

  // Re-checked here as well as in the browser: the client check can be skipped.
  if (password !== confirmPassword) {
    redirect(`/sign-up?error=${encodeURIComponent("Both password fields must match.")}`);
  }

  if (password.length < 8) {
    redirect(`/sign-up?error=${encodeURIComponent("Use a password of at least 8 characters.")}`);
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

  redirect(
    `/sign-in?message=${encodeURIComponent(
      "Account created. Open the confirmation link we emailed to your Stony Brook address, then sign in. You only need to do this once."
    )}&next=/onboarding`
  );
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect(next);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);

  // Checked only at sign-in, never in middleware. email_confirmed_at is set
  // permanently once the student opens the link, so this gate passes silently
  // from then on and the session is never interrupted mid-use.
  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    redirect(
      `/sign-in?error=${encodeURIComponent(
        "Please open the confirmation link we emailed to your Stony Brook address, then sign in again."
      )}`
    );
  }

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
