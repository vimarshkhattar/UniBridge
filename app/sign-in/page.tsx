import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell>
      <AuthForm mode="sign-in" error={params.error} message={params.message} next={params.next} />
    </AuthShell>
  );
}
