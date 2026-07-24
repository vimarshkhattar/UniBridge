"use client";

import { Bookmark, Send } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDiscoverActions } from "@/lib/discover-actions-store";
import { initials } from "@/lib/utils";
import type { MatchBreakdown } from "@/lib/matching";
import type { StudentProfile } from "@/lib/types";

export function StudentCard({ student, match }: { student: StudentProfile; match: MatchBreakdown }) {
  const { actions, sendRequest, saveProfile } = useDiscoverActions();
  const requestSent = actions.requestedIds.includes(student.id);
  const profileSaved = actions.savedIds.includes(student.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={`grid size-12 shrink-0 place-items-center rounded-full ${student.avatarColor} font-bold text-white`} aria-label={`${student.fullName} initials`}>
            {initials(student.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{student.fullName}</CardTitle>
              <VerifiedBadge email={student.email} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{student.university} · {student.major} · {student.academicYear}</p>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-white">{match.total}%</span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm leading-6 text-muted-foreground">{student.bio}</p>
        <div className="grid gap-2 text-sm">
          <p><span className="font-semibold text-navy">Country:</span> {student.country}</p>
          <p><span className="font-semibold text-navy">Languages:</span> {student.languages.join(", ")}</p>
          <p><span className="font-semibold text-navy">Common courses:</span> {student.courses.join(", ")}</p>
          <p><span className="font-semibold text-navy">Interests:</span> {student.interests.join(", ")}</p>
          <p><span className="font-semibold text-navy">Looking for:</span> {student.connectionTypes.join(", ")}</p>
        </div>
        <details className="rounded-md bg-muted p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-navy">Why this score?</summary>
          <div className="mt-2 grid gap-1 text-muted-foreground">
            <span>Same university: {match.sameUniversity}</span>
            <span>Shared courses: {match.sharedCourses}</span>
            <span>Same major: {match.sameMajor}</span>
            <span>Shared interests: {match.sharedInterests}</span>
            <span>Shared language: {match.sharedLanguage}</span>
            <span>Study style: {match.studyStyle}</span>
            <span>Activities: {match.preferredActivities}</span>
          </div>
        </details>
        {(requestSent || profileSaved) && (
          <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
            {requestSent && profileSaved && "Connection request sent. This profile has been saved in the Connections tab."}
            {requestSent && !profileSaved && "Connection request sent."}
            {!requestSent && profileSaved && "This profile has been saved in the Connections tab."}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={() => sendRequest(student.id)} disabled={requestSent}>
            <Send className="size-4" /> {requestSent ? "Request sent" : "Send request"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => saveProfile(student.id)} disabled={profileSaved}>
            <Bookmark className="size-4" /> {profileSaved ? "Saved" : "Save profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
