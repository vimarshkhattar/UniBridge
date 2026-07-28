"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError("Authentication is not configured.");
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

      if (providerError) {
        setError(providerError);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!isMounted) return;

        if (exchangeError) {
          setError("This reset link could not be used. Please request a new password reset email and open the newest link.");
          return;
        }

        window.history.replaceState({}, document.title, "/reset-password");
        setIsReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data.session) {
        setIsReady(true);
        return;
      }

      setError("Please open the newest reset link from your email before choosing a new password.");
    }

    prepareRecoverySession();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/sign-in?message=Password updated. Please sign in with your new password.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-navy">
        New password
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={!isReady}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Confirm new password
        <Input
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={!isReady}
        />
      </label>
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!error && !isReady && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">Preparing your reset link...</p>}
      <Button type="submit" disabled={!isReady || isSubmitting}>
        {isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
