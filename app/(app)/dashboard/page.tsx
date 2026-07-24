"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bot, CalendarDays, CheckCircle2, Compass, MessageSquareText, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { DashboardChatbot } from "@/components/dashboard-chatbot";
import { VerifiedBadge } from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConnectionsState } from "@/lib/connections-store";
import { events, guides, students } from "@/lib/sample-data";
import { calculateMatchScore } from "@/lib/matching";
import { calculateProfileCompletion, useDemoProfile } from "@/lib/profile-store";
import { initials } from "@/lib/utils";

export default function DashboardPage() {
  const { profile } = useDemoProfile();
  const { state: connections } = useConnectionsState();
  const firstName = profile.fullName.split(" ")[0] || "there";
  const profileCompletion = calculateProfileCompletion(profile);
  const recommendations = students
    .filter((student) => student.id !== profile.id)
    .map((student) => ({ student, score: calculateMatchScore(profile, student).total }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`${profile.fullName} profile photo`}
                width={80}
                height={80}
                unoptimized
                className="size-20 shrink-0 rounded-full object-cover ring-4 ring-red-50"
              />
            ) : (
              <div className={`grid size-20 shrink-0 place-items-center rounded-full ${profile.avatarColor} text-xl font-bold text-white ring-4 ring-red-50`}>
                {initials(profile.fullName)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-navy">Welcome, {firstName}</h1>
              <p className="mt-2 text-muted-foreground">
                {profileCompletion === 100 ? "Your profile is complete and ready for better matches." : "Complete your profile to improve matching."}
              </p>
              <div className="mt-3"><VerifiedBadge email={profile.email} /></div>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between text-sm font-semibold text-navy">
              <span>Profile completion</span>
              <span>{profileCompletion}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-muted">
              <div className="h-3 rounded-full bg-primary" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About UniBridge</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm leading-6 text-muted-foreground">
              UniBridge helps international students find compatible study partners, friends, event buddies, and practical guidance for university life. It focuses on the moments that can feel awkward at first: finding someone from class, attending campus events, asking for help, and writing respectful messages.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [UsersRound, "Student matches", "Compare courses, interests, languages, and study style."],
                [CalendarDays, "Event buddies", "Join small groups so campus events feel easier to attend."],
                [MessageSquareText, "Message help", "Draft messages and ask campus-life questions in simple language."]
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-md border border-border bg-muted p-3">
                  <Icon className="size-5 text-primary" aria-hidden />
                  <p className="mt-2 font-semibold text-navy">{String(title)}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{String(text)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              [UserRound, "Complete your profile", "Add your courses, interests, languages, and photo."],
              [Compass, "Discover people", "Use match scores and filters to find better connections."],
              [ShieldCheck, "Connect safely", "Meet in public campus spaces and verify official information."]
            ].map(([Icon, title, text], index) => (
              <div key={String(title)} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-red-50 text-sm font-bold text-primary">{index + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" aria-hidden />
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
          <CardHeader>
            <CardTitle>Recommended matches</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recommendations.map(({ student, score }) => (
              <div key={student.id} className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <p className="font-semibold text-navy">{student.fullName}</p>
                  <p className="text-sm text-muted-foreground">{student.major} · {student.courses.slice(0, 2).join(", ")}</p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-800">{score}%</span>
              </div>
            ))}
            <Link href="/discover"><Button variant="secondary">Open Discover</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/assistant"><Button className="w-full justify-start"><Bot className="size-4" /> Draft a message</Button></Link>
            <Link href="/events"><Button variant="secondary" className="w-full justify-start"><CalendarDays className="size-4" /> Find an event buddy</Button></Link>
            <Link href="/connections"><Button variant="secondary" className="w-full justify-start"><UsersRound className="size-4" /> Review requests</Button></Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Upcoming event</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold text-navy">{events[0].name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{events[0].location}</p>
            <p className="mt-3 text-sm">{events[0].buddyCount} students looking for a buddy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Connections</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-primary" />
            <div>
              <p className="font-semibold text-navy">{connections.acceptedIds.length} accepted · {connections.pendingIds.length} pending</p>
              <p className="text-sm text-muted-foreground">Start with a low-pressure study invite.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Featured guide</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold text-navy">{guides[0].title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{guides[0].summary}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardChatbot />
      </section>
    </div>
  );
}
