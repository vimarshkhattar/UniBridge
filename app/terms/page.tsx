import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <Card className="mt-8">
          <CardHeader><CardTitle className="text-2xl">Terms of Use Placeholder</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-muted-foreground">
            <p>UniBridge is a student connection and adjustment MVP. It is not affiliated with or endorsed by Stony Brook University or other universities.</p>
            <p>Students are responsible for confirming official policies, academic requirements, immigration or employment rules, and safety-sensitive arrangements with official sources.</p>
            <p>Replace this placeholder with reviewed terms before public launch.</p>
            <Link href="/" className="text-sm font-semibold text-primary">Back to UniBridge</Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
