import { forgotPasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <p className="text-sm text-muted-foreground">We will send a reset link if Supabase auth is configured.</p>
          </CardHeader>
          <CardContent>
            <form action={forgotPasswordAction} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-navy">
                University email
                <Input name="email" type="email" required placeholder="you@stonybrook.edu" />
              </label>
              <Button type="submit">Send reset link</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
