"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Compass,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  UsersRound
} from "lucide-react";
import { DashboardChatbot } from "@/components/dashboard-chatbot";
import { VerifiedBadge } from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConnectionsState } from "@/lib/connections-store";
import { formatEventDate } from "@/lib/date-format";
import { nextEvent } from "@/lib/events";
import { guides } from "@/lib/sample-data";
import { calculateMatchScore } from "@/lib/matching";
import { calculateProfileCompletion, useStoredProfile } from "@/lib/profile-store";
import type { StudentProfile } from "@/lib/types";
import { useClientNow } from "@/lib/use-client-now";
import { initials } from "@/lib/utils";

export default function DashboardPage() {
  const { profile } = useStoredProfile();
  const { state: connections } = useConnectionsState();
  const [remoteProfiles, setRemoteProfiles] = useState<StudentProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const firstName = profile.fullName.split(" ")[0] || "there";
  const profileCompletion = calculateProfileCompletion(profile);
  const now = useClientNow();
  const upcomingEvent = useMemo(() => (now === null ? undefined : nextEvent(now)), [now]);

  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteDiscoverProfiles }) => {
      const profiles = await loadRemoteDiscoverProfiles();
      if (isActive) {
        setRemoteProfiles(profiles);
        setIsLoadingProfiles(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  // Recommendations only ever come from real signed-up students.
  const recommendations = useMemo(
    () =>
      remoteProfiles
        .filter((student) => student.id !== profile.id && student.email.toLowerCase() !== profile.email.toLowerCase())
        .map((student) => ({ student, score: calculateMatchScore(profile, student).total }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [profile, remoteProfiles]
  );

  return (
    <div className="depth-scene grid gap-6">
      <section className="card-surface tilt-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`${profile.fullName} profile photo`}
                width={80}
                height={80}
                unoptimized
                className="size-20 shrink-0 rounded-full object-cover ring-4 ring-white/10"
              />
            ) : (
              <div className={`grid size-20 shrink-0 place-items-center rounded-full ${profile.avatarColor} text-xl font-bold text-white ring-4 ring-white/10`}>
                {initials(profile.fullName)}
              </div>
            )}
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="mt-1 text-3xl font-black text-foreground">Welcome, {firstName}</h1>
              <p className="mt-2 text-muted-foreground">
                {profileCompletion === 100
                  ? "Your profile is complete and ready for better matches."
                  : "Complete your profile to improve matching."}
              </p>
              <div className="mt-3"><VerifiedBadge email={profile.email} /></div>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>Profile completion</span>
              <span>{profileCompletion}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-3 rounded-full bg-brand-gradient transition-[width] duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>About UniBridge</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm leading-6 text-muted-foreground">
              UniBridge is for every new college student and transfer student who runs into problems when arriving at a
              new university. Starting somewhere unfamiliar is hard: you do not know anyone in your classes, you are not
              sure how things work, and asking for help feels awkward. UniBridge helps you find compatible study
              partners, friends, and event buddies, and gives you practical guidance for the moments that feel unclear.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [UsersRound, "Student matches", "Compare courses, interests, languages, and study style."],
                [CalendarDays, "Event buddies", "Join small groups so campus events feel easier to attend."],
                [MessageSquareText, "Message help", "Draft messages and ask campus-life questions in simple language."]
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="tilt-card rounded-xl border border-border bg-white/[0.035] p-3">
                  <Icon className="size-5 text-[var(--red-bright)]" aria-hidden />
                  <p className="mt-2 font-semibold text-navy">{String(title)}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{String(text)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>How it works</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {[
              [UserRound, "Complete your profile", "Add your courses, interests, languages, and photo."],
              [Compass, "Discover people", "Use match scores and filters to find better connections."],
              [ShieldCheck, "Connect safely", "Meet in public campus spaces and verify official information."]
            ].map(([Icon, title, text], index) => (
              <div key={String(title)} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--red-soft)] text-sm font-bold text-[var(--red-bright)]">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-[var(--red-bright)]" aria-hidden />
                    <p className="font-semibold text-navy">{String(title)}</p>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{String(text)}</p>
                </div>
              </div>
            ))}
            <Link href="/discover">
              <Button variant="secondary" className="w-full justify-start">
                Start discovering <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recommended matches</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {isLoadingProfiles && (
              <p className="rounded-xl border border-border bg-white/[0.03] p-4 text-sm text-muted-foreground">
                Loading student profiles...
              </p>
            )}
            {!isLoadingProfiles && recommendations.length === 0 && (
              <p className="rounded-xl border border-border bg-white/[0.03] p-4 text-sm text-muted-foreground">
                No matches to show yet. Recommendations appear here as other students sign up and complete their profiles.
              </p>
            )}
            {recommendations.map(({ student, score }) => (
              <div key={student.id} className="tilt-card flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{student.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[student.major, student.courses.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--red-soft)] px-3 py-1 text-sm font-bold text-[#ffc9cd]">
                  {score}%
                </span>
              </div>
            ))}
            <Link href="/discover"><Button variant="secondary">Open Discover</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/assistant"><Button className="w-full justify-start"><Bot className="size-4" /> Draft a message</Button></Link>
            <Link href="/events"><Button variant="secondary" className="w-full justify-start"><CalendarDays className="size-4" /> Find an event buddy</Button></Link>
            <Link href="/connections"><Button variant="secondary" className="w-full justify-start"><UsersRound className="size-4" /> Review requests</Button></Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Next event</CardTitle></CardHeader>
          <CardContent>
            {upcomingEvent ? (
              <>
                <p className="font-semibold text-navy">{upcomingEvent.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{upcomingEvent.location}</p>
                <p className="mt-3 text-sm text-muted-foreground">{formatEventDate(upcomingEvent.startsAt)}</p>
                <Link href="/events" className="mt-4 inline-block"><Button variant="secondary">See all events</Button></Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events on the calendar right now.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Connections</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-[var(--red-bright)]" />
            <div>
              <p className="font-semibold text-navy">
                {connections.acceptedIds.length} accepted · {connections.pendingIds.length} pending
              </p>
              <p className="text-sm text-muted-foreground">Start with a low-pressure study invite.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Featured guide</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold text-navy">{guides[0].title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{guides[0].summary}</p>
            <Link href="/guides" className="mt-4 inline-block"><Button variant="secondary">Read guides</Button></Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardChatbot />
      </section>
    </div>
  );
}
