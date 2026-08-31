"use client";

import { useState, type ChangeEvent } from "react";
import { Flag, Save } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { listFromInput, STONY_BROOK_UNIVERSITY, useStoredProfile } from "@/lib/profile-store";
import { initials } from "@/lib/utils";

export default function ProfilePage() {
  const { profile, updateProfile } = useStoredProfile();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const displayAvatarUrl = avatarOverride ?? profile.avatarUrl ?? "";
  const previewName = profile.fullName.trim() || "Your name";
  const previewDetails = [STONY_BROOK_UNIVERSITY, profile.major.trim(), profile.academicYear].filter(Boolean).join(" · ");
  const previewBio =
    profile.bio.trim() ||
    "Add a short intro so classmates know what kind of study partners, events, or campus help you are looking for.";

  function resizeImage(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read the selected image."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("Could not load the selected image."));
        image.onload = () => {
          const size = 320;
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Could not prepare the image preview."));
            return;
          }

          const scale = Math.max(size / image.width, size / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          const x = (size - width) / 2;
          const y = (size - height) / 2;

          canvas.width = size;
          canvas.height = size;
          context.drawImage(image, x, y, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaveError("");
    setPhotoMessage("Preparing a smaller profile photo preview...");
    try {
      const resized = await resizeImage(file);
      setAvatarOverride(resized);
      setPhotoMessage("Photo ready. Click Save changes to update completion.");
    } catch (error) {
      setPhotoMessage("");
      setSaveError(error instanceof Error ? error.message : "Could not prepare the selected photo.");
    }
  }

  function handleSave(formData: FormData) {
    const nextProfile = {
      ...profile,
      fullName: String(formData.get("fullName") ?? "").trim(),
      university: STONY_BROOK_UNIVERSITY,
      major: String(formData.get("major") ?? "").trim(),
      academicYear: String(formData.get("academicYear") ?? "") as typeof profile.academicYear,
      country: String(formData.get("country") ?? "").trim(),
      languages: listFromInput(formData.get("languages")),
      courses: listFromInput(formData.get("courses")),
      interests: listFromInput(formData.get("interests")),
      bio: String(formData.get("bio") ?? "").trim(),
      avatarUrl: displayAvatarUrl,
      visibility: {
        country: formData.has("showCountry"),
        languages: formData.has("showLanguages"),
        courses: formData.has("showCourses"),
        sameUniversityOnly: formData.has("sameUniversityOnly")
      }
    };

    try {
      updateProfile(nextProfile);
      setSaveError("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaved(false);
      setSaveError(
        error instanceof DOMException && error.name === "QuotaExceededError"
          ? "This photo is still too large to save locally. Try a smaller image."
          : "Profile could not be saved. Please try again."
      );
    }
  }

  function handleReport(formData: FormData) {
    const reason = String(formData.get("reportReason") ?? "").trim();
    if (!reason) return;

    setReportSubmitted(true);
    setReportOpen(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section>
        <h1 className="text-3xl font-bold text-navy">Profile</h1>
        <p className="mt-2 text-muted-foreground">Edit your public profile, courses, interests, connection preferences, and privacy settings.</p>
        <Card className="mt-6">
          <CardHeader><CardTitle>Public preview</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              {displayAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayAvatarUrl} alt={`${previewName} profile photo`} className="size-16 rounded-full object-cover" />
              ) : (
                <div className={`grid size-16 place-items-center rounded-full ${profile.avatarColor} text-lg font-bold text-white`}>
                  {initials(previewName)}
                </div>
              )}
              <p className="text-lg font-bold text-navy">{previewName}</p>
            </div>
            <VerifiedBadge email={profile.email} />
            <p>{previewDetails || STONY_BROOK_UNIVERSITY}</p>
            <p className="text-muted-foreground">{previewBio}</p>
            {reportSubmitted ? (
              <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
                Report submitted for review.
              </p>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setReportOpen((open) => !open)}>
                <Flag className="size-4" /> Report profile
              </Button>
            )}
            {reportOpen && (
              <form action={handleReport} className="grid gap-3 rounded-md border border-border bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Use this safety feature to report suspicious, fake, or inappropriate profiles. Your report reason is collected so the issue can be reviewed.
                </p>
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Reason
                  <Textarea name="reportReason" required placeholder="Describe what looks unsafe or incorrect..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="danger">Submit report</Button>
                  <Button type="button" variant="secondary" onClick={() => setReportOpen(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader><CardTitle>Edit details</CardTitle></CardHeader>
        <CardContent>
          <form action={handleSave} className="grid gap-4">
            <div className="rounded-md border border-border bg-muted p-4">
              <label className="grid gap-2 text-sm font-medium text-navy">
                Profile photo
                <Input name="avatar" type="file" accept="image/*" onChange={handlePhotoChange} />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">Upload a photo for your profile preview. If you skip this, UniBridge uses your initials avatar.</p>
              {photoMessage && <p className="mt-2 text-xs font-medium text-primary">{photoMessage}</p>}
              {displayAvatarUrl && (
                <Button type="button" variant="secondary" className="mt-3" onClick={() => setAvatarOverride("")}>
                  Remove photo
                </Button>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-navy">Full name<Input name="fullName" defaultValue={profile.fullName} required /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Major<Input name="major" defaultValue={profile.major} required /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Academic year<Select name="academicYear" defaultValue={profile.academicYear}><option value="">Select academic year</option>{["First year", "Sophomore", "Junior", "Senior", "Graduate", "Exchange"].map((item) => <option key={item}>{item}</option>)}</Select></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Country<Input name="country" defaultValue={profile.country} placeholder="Country or region you are from" /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Languages<Input name="languages" defaultValue={profile.languages.join(", ")} placeholder="English, Hindi, Spanish" /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Courses<Input name="courses" defaultValue={profile.courses.join(", ")} placeholder="CSE 220, AMS 161" /></label>
              <label className="grid gap-2 text-sm font-medium text-navy">Interests<Input name="interests" defaultValue={profile.interests.join(", ")} placeholder="Hackathons, cooking, soccer" /></label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-navy">Short bio<Textarea name="bio" defaultValue={profile.bio} placeholder="Share what kind of study partners, events, or campus help you are looking for." /></label>
            <fieldset className="grid gap-3 rounded-md border border-border p-4">
              <legend className="px-1 text-sm font-bold text-navy">Privacy controls</legend>
              {[
                ["showCountry", "Show country", profile.visibility.country],
                ["showLanguages", "Show languages", profile.visibility.languages],
                ["showCourses", "Show courses", profile.visibility.courses],
                ["sameUniversityOnly", "Show profile only to Stony Brook students", profile.visibility.sameUniversityOnly]
              ].map(([name, label, checked]) => (
                <label key={String(name)} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} />
                  {String(label)}
                </label>
              ))}
            </fieldset>
            {saved && <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">Profile changes saved. Your dashboard will use this name now.</p>}
            {saveError && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{saveError}</p>}
            <Button type="submit"><Save className="size-4" /> Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
