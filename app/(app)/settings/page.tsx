import { SettingsControls } from "@/components/settings-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="depth-scene grid gap-6">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1 text-3xl font-black text-navy">Settings</h1>
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
