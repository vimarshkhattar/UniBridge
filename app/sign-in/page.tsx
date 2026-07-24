import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <p className="text-sm text-muted-foreground">Sign in with your university email.</p>
          </CardHeader>
          <CardContent>
            <AuthForm mode="sign-in" error={params.error} message={params.message} next={params.next} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
