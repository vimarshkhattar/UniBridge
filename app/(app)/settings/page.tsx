import { SettingsControls } from "@/components/settings-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage account safety, profile visibility, blocked users, and account deletion.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Safety controls</CardTitle></CardHeader>
        <CardContent>
          <SettingsControls />
        </CardContent>
      </Card>
    </div>
  );
}
