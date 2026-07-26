import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <Card className="mt-8">
          <CardHeader><CardTitle className="text-2xl">Privacy Policy</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-muted-foreground">
            <p>UniBridge collects account email, profile details, preferences, connection activity, event activity, saved profiles, messages, reports, and settings needed to operate the service.</p>
            <p>Profile details may be visible to other authenticated students according to your privacy controls. Messages are visible to the students who participate in that conversation.</p>
            <p>UniBridge does not ask students to publish phone numbers or home addresses. Avoid sharing sensitive personal, financial, immigration, or academic account information in messages.</p>
            <p>Reports and safety actions may be reviewed to help keep the community respectful. UniBridge is not an official university service, so students should confirm official policies with the relevant university office.</p>
            <Link href="/" className="text-sm font-semibold text-primary">Back to UniBridge</Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
