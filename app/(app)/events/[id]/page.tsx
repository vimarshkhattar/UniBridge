import Link from "next/link";
import { notFound } from "next/navigation";
import { EventBuddyActions } from "@/components/event-buddy-actions";
import { EventBuddySeekers } from "@/components/event-buddy-seekers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDate } from "@/lib/date-format";
import { events } from "@/lib/sample-data";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = events.find((item) => item.id === id);
  if (!event) notFound();

  return (
    <div className="grid gap-6">
      <Link href="/events" className="focus-ring w-fit rounded-sm text-sm font-semibold text-primary">Back to events</Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{event.sampleLabel}</p>
        </CardHeader>
        <CardContent className="grid gap-5">
          <p className="leading-7 text-muted-foreground">{event.description}</p>
          <div className="grid gap-2 text-sm">
            <p><span className="font-semibold text-navy">Date:</span> {formatEventDate(event.startsAt, "full")}</p>
            <p><span className="font-semibold text-navy">Location:</span> {event.location}</p>
            <p><span className="font-semibold text-navy">Category:</span> {event.category}</p>
            <p><span className="font-semibold text-navy">Organizer:</span> {event.organizer}</p>
          </div>
          <EventBuddySeekers eventId={event.id} />
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Event data is shaped so a campus events API or approved calendar feed can be added later. This demo does not scrape websites.
          </div>
          <EventBuddyActions eventId={event.id} eventName={event.name} />
        </CardContent>
      </Card>
    </div>
  );
}
