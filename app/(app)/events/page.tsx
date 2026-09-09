"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { formatEventDate } from "@/lib/date-format";
import { groupsForEvent, useBuddyState } from "@/lib/event-buddy-store";
import { useEventActivity } from "@/lib/event-activity-store";
import { eventsByRelevance, isPastEvent } from "@/lib/events";
import { useClientNow } from "@/lib/use-client-now";
import { events } from "@/lib/sample-data";

function EventCard({
  event,
  isPast,
  isJoined,
  needsBuddy,
  joinEvent,
  requestBuddy
}: {
  event: (typeof events)[number];
  isPast: boolean;
  isJoined: boolean;
  needsBuddy: boolean;
  joinEvent: (eventId: string) => void;
  requestBuddy: (eventId: string) => void;
}) {
  const { state: buddyState } = useBuddyState(event.id);
  const groups = groupsForEvent(buddyState);
  const joinedGroup = groups.find((group) => group.id === buddyState.joinedGroupId);
  const createdGroup = buddyState.groups.find((group) => group.createdByCurrentUser);
  const groupToShow = createdGroup ?? joinedGroup;

  return (
    <Card className={`tilt-card ${isPast ? "opacity-70" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{event.name}</CardTitle>
            <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-red-700">{event.sampleLabel}</p>
          </div>
          <span
            className={`rounded-md px-2 py-1 text-xs font-bold ${
              isPast ? "bg-white/10 text-muted-foreground" : "bg-amber-100 text-amber-900"
            }`}
          >
            {isPast ? "Already happened" : event.category}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm leading-6 text-muted-foreground">{event.description}</p>
        <div className="grid gap-1 text-sm">
          <p><span className="font-semibold text-navy">When:</span> {formatEventDate(event.startsAt)}</p>
          <p><span className="font-semibold text-navy">Where:</span> {event.location}</p>
          <p><span className="font-semibold text-navy">Organizer:</span> {event.organizer}</p>
        </div>
        {(isJoined || needsBuddy || groupToShow) && (
          <div className="grid gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {isJoined && (
              <p><span className="font-semibold">You joined this event.</span> It has been added to your event activity.</p>
            )}
            {needsBuddy && (
              <p><span className="font-semibold">Buddy request active.</span> Other students can see you in this event&apos;s Details page under Students seeking a buddy.</p>
            )}
            {groupToShow && (
              <p>
                <span className="font-semibold">
                  {createdGroup ? "You created a buddy group." : "You joined a buddy group."}
                </span>{" "}
                {groupToShow.title} is listed in this event&apos;s Details page with {groupToShow.members.length}/{groupToShow.maxMembers} members.
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => joinEvent(event.id)} disabled={isJoined || isPast}>
            <CalendarPlus className="size-4" /> {isJoined ? "Joined" : "Join event"}
          </Button>
          <Button variant="secondary" onClick={() => requestBuddy(event.id)} disabled={needsBuddy || isPast}>
            <UsersRound className="size-4" /> {needsBuddy ? "Buddy requested" : "I need a buddy"}
          </Button>
          <Link href={`/events/${event.id}`}><Button variant="ghost">Details</Button></Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventsPage() {
  const [category, setCategory] = useState("All");
  const [showPast, setShowPast] = useState(false);
  const { activity, joinEvent, requestBuddy } = useEventActivity();
  // Resolved on the client so "already happened" reflects the visitor's clock,
  // not the moment the page was built.
  const now = useClientNow();

  const categories = Array.from(new Set(events.map((event) => event.category)));

  const ordered = useMemo(() => (now === null ? events : eventsByRelevance(now)), [now]);
  const filtered = useMemo(
    () =>
      ordered
        .filter((event) => category === "All" || event.category === category)
        .filter((event) => showPast || now === null || !isPastEvent(event, now)),
    [category, now, ordered, showPast]
  );

  const pastCount = now === null ? 0 : events.filter((event) => isPastEvent(event, now)).length;
  const joinedEvents = events.filter((event) => activity.joinedIds.includes(event.id));
  const buddyEvents = events.filter((event) => activity.buddyIds.includes(event.id));

  return (
    <div className="depth-scene grid gap-6">
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

      {pastCount > 0 && (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {pastCount} {pastCount === 1 ? "event has" : "events have"} already passed this semester and {pastCount === 1 ? "is" : "are"} hidden.
          </p>
          <Button variant="secondary" onClick={() => setShowPast((current) => !current)}>
            {showPast ? "Hide past events" : "Show past events"}
          </Button>
        </div>
      )}

      {(joinedEvents.length > 0 || buddyEvents.length > 0) && (
        <Card className="tilt-card">
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

      {filtered.length === 0 && (
        <p className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          No upcoming events in this category right now.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isPast={now !== null && isPastEvent(event, now)}
            isJoined={activity.joinedIds.includes(event.id)}
            needsBuddy={activity.buddyIds.includes(event.id)}
            joinEvent={joinEvent}
            requestBuddy={requestBuddy}
          />
        ))}
      </div>
    </div>
  );
}
