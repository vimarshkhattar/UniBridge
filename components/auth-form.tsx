import Link from "next/link";
import { signInAction, signUpAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({
  mode,
  error,
  message,
  next
}: {
  mode: "sign-in" | "sign-up";
  error?: string;
  message?: string;
  next?: string;
}) {
  const isSignUp = mode === "sign-up";

  return (
    <form action={isSignUp ? signUpAction : signInAction} className="grid gap-4">
      {isSignUp && (
        <label className="grid gap-2 text-sm font-medium text-navy">
          Full name
          <Input name="fullName" autoComplete="name" required placeholder="Maya Iyer" />
        </label>
      )}
      <label className="grid gap-2 text-sm font-medium text-navy">
        Stony Brook email
        <Input name="email" type="email" autoComplete="email" required placeholder="you@stonybrook.edu" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Password
        <Input name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required minLength={8} />
      </label>
      {next && <input type="hidden" name="next" value={next} />}
      {error && <p className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm font-medium text-primary">{error}</p>}
      {message && <p className="rounded-md border border-primary/30 bg-black p-3 text-sm font-medium text-foreground">{message}</p>}
      <Button type="submit">{isSignUp ? "Create account" : "Sign in"}</Button>
      <div className="text-sm text-muted-foreground">
        <Link className="focus-ring rounded-sm hover:text-navy" href={isSignUp ? "/sign-in" : "/sign-up"}>
          {isSignUp ? "Already have an account?" : "Need an account?"}
        </Link>
      </div>
    </form>
  );
}
