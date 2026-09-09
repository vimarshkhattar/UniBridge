"use client";

import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { signInAction, signUpAction } from "@/app/auth/actions";

export type AuthMode = "sign-in" | "sign-up";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STONY_BROOK_DOMAIN = "@stonybrook.edu";

function scorePassword(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: "Too short", color: "#8a7a7e" },
  { label: "Weak", color: "#e14b4b" },
  { label: "Fair", color: "#e5952f" },
  { label: "Good", color: "#c7c02f" },
  { label: "Strong", color: "#3fbe7d" }
];

type Errors = Partial<Record<"fullName" | "email" | "password", string>>;

export function AuthForm({
  mode,
  error,
  message,
  next
}: {
  mode: AuthMode;
  error?: string;
  message?: string;
  next?: string;
}) {
  const uid = useId();
  const isSignUp = mode === "sign-up";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);

  function validate(): Errors {
    const next: Errors = {};

    if (isSignUp && fullName.trim().length < 2) {
      next.fullName = "Tell us what to call you";
    }
    if (!EMAIL_RE.test(email.trim())) {
      next.email = "That doesn't look like an email address";
    } else if (isSignUp && !email.trim().toLowerCase().endsWith(STONY_BROOK_DOMAIN)) {
      next.email = "Use your Stony Brook email address";
    }
    if (password.length < 8) {
      next.password = "Use at least 8 characters";
    } else if (isSignUp && strength < 2) {
      next.password = "Add a number or symbol to strengthen this";
    }

    return next;
  }

  // Validation runs before the browser hands the form to the server action, so
  // obvious mistakes never cost a round trip.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      event.preventDefault();
      return;
    }

    setSubmitting(true);
  }

  return (
    <div className="auth-dialog">
      <div className="auth-head">
        <BridgeMark />
        <h1 className="auth-title">{isSignUp ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-blurb">
          {isSignUp
            ? "Start building the profile that connects you with people on your campus."
            : "Pick up where you left off with your classmates and campus plans."}
        </p>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Account access">
        <span className="auth-tab-slider" data-mode={isSignUp ? "signup" : "login"} />
        <Link href="/sign-in" role="tab" aria-selected={!isSignUp} className="auth-tab" data-active={!isSignUp}>
          Log in
        </Link>
        <Link href="/sign-up" role="tab" aria-selected={isSignUp} className="auth-tab" data-active={isSignUp}>
          Sign up
        </Link>
      </div>

      {error && (
        <p className="auth-note" role="alert">
          {error}
        </p>
      )}
      {message && !error && (
        <p className="auth-note" data-tone="info" role="status">
          {message}
        </p>
      )}

      <form action={isSignUp ? signUpAction : signInAction} onSubmit={handleSubmit} noValidate>
        {isSignUp && (
          <Field id={`${uid}-name`} label="Full name" error={errors.fullName}>
            <input
              id={`${uid}-name`}
              name="fullName"
              className="field-input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
            />
          </Field>
        )}

        <Field id={`${uid}-email`} label="Stony Brook email" error={errors.email}>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            className="field-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@stonybrook.edu"
            autoComplete="email"
          />
        </Field>

        <Field
          id={`${uid}-password`}
          label="Password"
          error={errors.password}
          labelAside={
            isSignUp ? null : (
              <Link href="/forgot-password" className="link-quiet">
                Forgot password?
              </Link>
            )
          }
        >
          <div className="field-wrap">
            <input
              id={`${uid}-password`}
              name="password"
              type={showPassword ? "text" : "password"}
              className="field-input"
              style={{ paddingRight: "2.75rem" }}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className="field-eye"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </Field>

        {isSignUp && password.length > 0 && (
          <div className="strength">
            <div className="strength-track">
              {[0, 1, 2, 3].map((segment) => (
                <span
                  key={segment}
                  className="strength-seg"
                  style={{ background: segment < strength ? STRENGTH[strength].color : "var(--border)" }}
                />
              ))}
            </div>
            <span className="strength-label" style={{ color: STRENGTH[strength].color }}>
              {STRENGTH[strength].label}
            </span>
          </div>
        )}

        {!isSignUp && (
          <label className="remember">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            <span>Keep me signed in</span>
          </label>
        )}

        {next && <input type="hidden" name="next" value={next} />}

        <button className="auth-btn auth-btn-primary" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner /> Just a moment…
            </>
          ) : isSignUp ? (
            "Create account"
          ) : (
            "Log in"
          )}
        </button>

        <p className="auth-swap">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="link">
                Log in
              </Link>
            </>
          ) : (
            <>
              New to UniBridge?{" "}
              <Link href="/sign-up" className="link">
                Create an account
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

/* -------------------------------- fragments ------------------------------- */

function Field({
  id,
  label,
  children,
  error,
  labelAside
}: {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  labelAside?: ReactNode;
}) {
  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={id}>{label}</label>
        {labelAside}
      </div>
      {children}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function BridgeMark() {
  return (
    <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#140a0d] text-sm font-black text-white shadow-glow">
      <span className="absolute inset-0 bg-brand-gradient opacity-85" />
      <span className="absolute left-2 top-2 size-1.5 rounded-full bg-white/70" />
      <span className="absolute bottom-2 right-2 size-1.5 rounded-full bg-white/70" />
      <span className="relative">UB</span>
    </span>
  );
}

const Eye = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10.6 5.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.3-1M3 3l18 18" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

const Spinner = () => (
  <svg className="spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);
