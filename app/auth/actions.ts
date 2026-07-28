"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAppOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/onboarding");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await getAppOrigin()}/auth/callback?next=/dashboard`
    }
  });

  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  redirect("/onboarding");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect(next);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  if (!email) {
    redirect("/forgot-password?error=Enter your email address.");
  }

  if (!supabase) {
    redirect("/forgot-password?error=Authentication is not configured.");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getAppOrigin()}/auth/callback?next=/reset-password`
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/sign-in?message=Check your email for a password reset link.");
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const supabase = await createSupabaseServerClient();

  if (password.length < 8) {
    redirect("/reset-password?error=Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=Passwords do not match.");
  }

  if (!supabase) {
    redirect("/reset-password?error=Authentication is not configured.");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/sign-in?message=Password updated. Please sign in with your new password.");
}
