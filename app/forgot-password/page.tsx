import Link from "next/link";
import { forgotPasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <p className="text-sm text-muted-foreground">Enter your account email and UniBridge will send you a reset link.</p>
          </CardHeader>
          <CardContent>
            <form action={forgotPasswordAction} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-navy">
                University email
                <Input name="email" type="email" autoComplete="email" required placeholder="you@stonybrook.edu" />
              </label>
              {params.error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
              <Button type="submit">Send reset link</Button>
              <Link className="text-sm text-muted-foreground hover:text-navy" href="/sign-in">
                Back to sign in
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
