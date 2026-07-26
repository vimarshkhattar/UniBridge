"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { defaultStoredProfile, listFromInput, saveStoredProfile } from "@/lib/profile-store";
import { upsertCurrentUserProfile } from "@/lib/supabase/user-sync";
import type { ConnectionType } from "@/lib/types";

const connectionTypes: ConnectionType[] = [
  "Study partner",
  "Friend",
  "Gym partner",
  "Event buddy",
  "Roommate search",
  "English practice partner",
  "Same-country connection"
];

export default function OnboardingPage() {
  const router = useRouter();

  async function handleFinish(formData: FormData) {
    const selectedConnectionTypes = connectionTypes.filter((type) => formData.getAll("connectionTypes").includes(type));

    const nextProfile = {
      ...defaultStoredProfile,
      fullName: String(formData.get("fullName") || defaultStoredProfile.fullName),
      university: String(formData.get("university") || defaultStoredProfile.university),
      major: String(formData.get("major") || defaultStoredProfile.major),
      academicYear: String(formData.get("academicYear") || defaultStoredProfile.academicYear) as typeof defaultStoredProfile.academicYear,
      country: String(formData.get("country") || defaultStoredProfile.country),
      languages: listFromInput(formData.get("languages")),
      courses: listFromInput(formData.get("courses")),
      interests: listFromInput(formData.get("interests")),
      preferredStudyTimes: listFromInput(formData.get("preferredStudyTimes")),
      bio: String(formData.get("bio") || defaultStoredProfile.bio),
      connectionTypes: selectedConnectionTypes.length ? selectedConnectionTypes : defaultStoredProfile.connectionTypes
    };

    saveStoredProfile(nextProfile);
    await upsertCurrentUserProfile(nextProfile);

    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-navy">Set up your UniBridge profile</h1>
      <p className="mt-2 text-muted-foreground">You can skip nonessential fields and update everything later.</p>
      <Card className="mt-6">
        <CardHeader><CardTitle>International student profile</CardTitle></CardHeader>
        <CardContent>
          <form action={handleFinish} className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-navy">Full name<Input name="fullName" required defaultValue={defaultStoredProfile.fullName} /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Profile photo or avatar<Input name="avatar" type="file" accept="image/*" /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">University<Input name="university" defaultValue={defaultStoredProfile.university} required /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Major<Input name="major" defaultValue={defaultStoredProfile.major} required /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">
                Academic year
                <Select name="academicYear" defaultValue={defaultStoredProfile.academicYear}>
                  <option>Graduate</option><option>First year</option><option>Sophomore</option><option>Junior</option><option>Senior</option><option>Exchange</option>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-navy">Country of origin<Input name="country" defaultValue={defaultStoredProfile.country} /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Languages spoken<Input name="languages" defaultValue={defaultStoredProfile.languages.join(", ")} placeholder="English, Hindi, Spanish" /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Courses currently taking<Input name="courses" defaultValue={defaultStoredProfile.courses.join(", ")} placeholder="CSE 532, AMS 561" /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Hobbies and interests<Input name="interests" defaultValue={defaultStoredProfile.interests.join(", ")} /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Preferred study times<Input name="preferredStudyTimes" defaultValue={defaultStoredProfile.preferredStudyTimes.join(", ")} placeholder="Evenings, weekends" /></label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-navy">Short biography<Textarea name="bio" defaultValue={defaultStoredProfile.bio} /></label>
            <fieldset className="grid gap-2 rounded-md border border-border p-4">
              <legend className="px-1 text-sm font-bold text-navy">Connection types</legend>
              {connectionTypes.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input name="connectionTypes" type="checkbox" value={item} defaultChecked={defaultStoredProfile.connectionTypes.includes(item)} /> {item}
                </label>
              ))}
            </fieldset>
            <div className="flex gap-2">
              <Button type="submit">Finish onboarding</Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>Skip for now</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
