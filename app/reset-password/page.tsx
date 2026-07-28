import { updatePasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ResetPasswordPage({
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
            <CardTitle>Choose a new password</CardTitle>
            <p className="text-sm text-muted-foreground">Enter a new password for your UniBridge account.</p>
          </CardHeader>
          <CardContent>
            <form action={updatePasswordAction} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-navy">
                New password
                <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-navy">
                Confirm new password
                <Input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
              </label>
              {params.error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
              <Button type="submit">Update password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
