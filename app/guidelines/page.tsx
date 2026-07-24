import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuidelinesPage() {
  return <PolicyPage title="Community Guidelines" items={["Meet in public campus locations for first meetings.", "Avoid sharing financial details, identity documents, phone numbers, or home addresses.", "Be respectful across cultures, languages, religions, genders, and backgrounds.", "Report suspicious behavior, harassment, scams, or unsafe requests.", "Verify housing, ride-sharing, employment, and marketplace-style arrangements independently."]} />;
}

function PolicyPage({ title, items }: { title: string; items: string[] }) {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <Card className="mt-8">
          <CardHeader><CardTitle className="text-2xl">{title}</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-muted-foreground">{items.map((item) => <li key={item}>- {item}</li>)}</ul>
            <Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary">Back to UniBridge</Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
