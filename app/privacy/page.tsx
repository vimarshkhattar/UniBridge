import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <Card className="mt-8">
          <CardHeader><CardTitle className="text-2xl">Privacy Policy Placeholder</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-muted-foreground">
            <p>UniBridge stores profile details needed for student discovery, connection requests, events, reports, and assistant history when configured with Supabase.</p>
            <p>The MVP avoids displaying phone numbers or home addresses and includes profile visibility controls.</p>
            <p>Replace this placeholder with a reviewed policy before public launch.</p>
            <Link href="/" className="text-sm font-semibold text-primary">Back to UniBridge</Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
