"use client";

import { FormEvent, useId, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    setIsSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
    });
    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="auth-dialog">
      <div className="auth-head">
        <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#140a0d] text-sm font-black text-white shadow-glow">
          <span className="absolute inset-0 bg-brand-gradient opacity-85" />
          <span className="relative">UB</span>
        </span>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-blurb">We&apos;ll send you a link to choose a new one.</p>
      </div>

      {sent ? (
        <div className="grid justify-items-center gap-4 py-2 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-[rgba(225,29,46,0.35)] bg-[var(--red-soft)] text-[var(--red-bright)]">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m20 6-11 11-5-5" />
            </svg>
          </span>
          <p className="max-w-[32ch] text-sm leading-6 text-muted-foreground">
            If {email.trim()} is registered, a reset link is on its way. Use the newest email only, because older reset
            links expire.
          </p>
          <Link href="/sign-in" className="auth-btn auth-btn-ghost">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="auth-note" role="alert">
              {error}
            </p>
          )}

          <div className="field">
            <div className="field-label-row">
              <label htmlFor={`${uid}-email`}>University email</label>
            </div>
            <input
              id={`${uid}-email`}
              className="field-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@stonybrook.edu"
            />
          </div>

          <button className="auth-btn auth-btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
                  <path d="M12 3a9 9 0 1 0 9 9" />
                </svg>
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </button>

          <p className="auth-swap">
            Remembered it?{" "}
            <Link href="/sign-in" className="link">
              Back to log in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
