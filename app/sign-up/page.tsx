import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card>
          <CardHeader>
            <CardTitle>Create your UniBridge account</CardTitle>
            <p className="text-sm text-muted-foreground">Use your university email to create your account.</p>
          </CardHeader>
          <CardContent>
            <AuthForm mode="sign-up" error={params.error} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
