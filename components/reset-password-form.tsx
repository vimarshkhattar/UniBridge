"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [recoveryTokenHash, setRecoveryTokenHash] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
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
      const tokenHash = url.searchParams.get("token_hash");
      const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

      if (providerError) {
        setError("This reset link is invalid or expired. Please request a new reset email and use the newest link.");
        return;
      }

      if (tokenHash) {
        setRecoveryTokenHash(tokenHash);
        setError("");
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

  async function handleContinueReset() {
    setError("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    setIsPreparing(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: recoveryTokenHash,
      type: "recovery"
    });
    setIsPreparing(false);

    if (verifyError) {
      setError("This reset link is invalid or expired. Please request a new reset email and use the newest link.");
      return;
    }

    window.history.replaceState({}, document.title, "/reset-password");
    setRecoveryTokenHash("");
    setIsReady(true);
  }

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
    <div className="auth-dialog">
      <div className="auth-head">
        <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#140a0d] text-sm font-black text-white shadow-glow">
          <span className="absolute inset-0 bg-brand-gradient opacity-85" />
          <span className="relative">UB</span>
        </span>
        <h1 className="auth-title">Choose a new password</h1>
        <p className="auth-blurb">Pick something at least 8 characters long that you have not used here before.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {recoveryTokenHash && !isReady && (
          <div className="auth-note" data-tone="info">
            <p className="mb-3">Your reset link is ready. Continue to choose a new password.</p>
            <button type="button" className="auth-btn auth-btn-ghost" onClick={handleContinueReset} disabled={isPreparing}>
              {isPreparing ? "Preparing…" : "Continue reset"}
            </button>
          </div>
        )}

        <div className="field">
          <div className="field-label-row">
            <label htmlFor="reset-password">New password</label>
          </div>
          <input
            id="reset-password"
            className="field-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            disabled={!isReady}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="field">
          <div className="field-label-row">
            <label htmlFor="reset-confirm">Confirm new password</label>
          </div>
          <input
            id="reset-confirm"
            className="field-input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            disabled={!isReady}
            placeholder="Type it once more"
          />
        </div>

        {error && (
          <p className="auth-note" role="alert">
            {error}
          </p>
        )}
        {!error && !isReady && !recoveryTokenHash && (
          <p className="auth-note" data-tone="info" role="status">
            Preparing your reset link…
          </p>
        )}

        <button className="auth-btn auth-btn-primary" type="submit" disabled={!isReady || isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </button>

        <p className="auth-swap">
          <Link href="/sign-in" className="link">
            Back to log in
          </Link>
        </p>
      </form>
    </div>
  );
}
