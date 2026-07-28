import { Logo } from "@/components/logo";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
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
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
