"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { formatEventDate } from "@/lib/date-format";
import { useEventActivity } from "@/lib/event-activity-store";
import { events, students } from "@/lib/sample-data";

export default function EventsPage() {
  const [category, setCategory] = useState("All");
  const { activity, joinEvent, requestBuddy } = useEventActivity();
  const categories = Array.from(new Set(events.map((event) => event.category)));
  const filtered = useMemo(() => events.filter((event) => category === "All" || event.category === category), [category]);
  const joinedEvents = events.filter((event) => activity.joinedIds.includes(event.id));
  const buddyEvents = events.filter((event) => activity.buddyIds.includes(event.id));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Campus Events</h1>
          <p className="mt-2 text-muted-foreground">Sample and community-added events designed so students can find someone to attend with.</p>
        </div>
        <label className="grid gap-2 text-sm font-medium text-navy md:w-72">
          Category
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </label>
      </div>
      {(joinedEvents.length > 0 || buddyEvents.length > 0) && (
        <Card>
          <CardHeader><CardTitle>Your event activity</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            {joinedEvents.length > 0 && (
              <p><span className="font-semibold text-navy">Joined:</span> {joinedEvents.map((event) => event.name).join(", ")}</p>
            )}
            {buddyEvents.length > 0 && (
              <p><span className="font-semibold text-navy">Looking for a buddy:</span> {buddyEvents.map((event) => event.name).join(", ")}</p>
            )}
          </CardContent>
        </Card>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{event.name}</CardTitle>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-red-700">{event.sampleLabel}</p>
                </div>
                <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">{event.category}</span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-6 text-muted-foreground">{event.description}</p>
              <div className="grid gap-1 text-sm">
                <p><span className="font-semibold text-navy">When:</span> {formatEventDate(event.startsAt)}</p>
                <p><span className="font-semibold text-navy">Where:</span> {event.location}</p>
                <p><span className="font-semibold text-navy">Organizer:</span> {event.organizer}</p>
              </div>
              <div className="grid gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <span>{event.interestedCount + (activity.joinedIds.includes(event.id) ? 1 : 0)} UniBridge students interested</span>
                <span>{event.buddyCount + (activity.buddyIds.includes(event.id) ? 1 : 0)} students looking for a buddy</span>
                <span>Buddy seekers you might know: {students.slice(1, 4).map((student) => student.fullName.split(" ")[0]).join(", ")}</span>
              </div>
              {(activity.joinedIds.includes(event.id) || activity.buddyIds.includes(event.id)) && (
                <div className="grid gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {activity.joinedIds.includes(event.id) && (
                    <p><span className="font-semibold">You joined this event.</span> It has been added to your event activity, and the interested count includes you.</p>
                  )}
                  {activity.buddyIds.includes(event.id) && (
                    <p><span className="font-semibold">Buddy request active.</span> Other students can see you in this event&apos;s Details page under Students seeking a buddy.</p>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => joinEvent(event.id)} disabled={activity.joinedIds.includes(event.id)}>
                  <CalendarPlus className="size-4" /> {activity.joinedIds.includes(event.id) ? "Joined" : "Join event"}
                </Button>
                <Button variant="secondary" onClick={() => requestBuddy(event.id)} disabled={activity.buddyIds.includes(event.id)}>
                  <UsersRound className="size-4" /> {activity.buddyIds.includes(event.id) ? "Buddy requested" : "I need a buddy"}
                </Button>
                <Link href={`/events/${event.id}`}><Button variant="ghost">Details</Button></Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
