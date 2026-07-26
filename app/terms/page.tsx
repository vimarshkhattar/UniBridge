import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <Card className="mt-8">
          <CardHeader><CardTitle className="text-2xl">Terms of Use</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-muted-foreground">
            <p>By using UniBridge, students agree to use the platform respectfully, honestly, and safely.</p>
            <p>UniBridge helps students find connections, event buddies, study partners, and practical campus guidance. It is not affiliated with or endorsed by Stony Brook University or any other university.</p>
            <p>Do not use UniBridge for harassment, scams, impersonation, illegal activity, unsafe requests, academic dishonesty, or sharing another person&apos;s private information without permission.</p>
            <p>Students are responsible for confirming official policies, academic requirements, immigration or employment rules, and safety-sensitive arrangements with official university sources.</p>
            <p>Reports, blocks, or unsafe behavior may result in restricted access. Meet new people in public campus spaces and use good judgment when making plans.</p>
            <Link href="/" className="text-sm font-semibold text-primary">Back to UniBridge</Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
