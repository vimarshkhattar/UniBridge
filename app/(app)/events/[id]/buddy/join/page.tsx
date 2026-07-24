import Link from "next/link";
import { notFound } from "next/navigation";
import { BuddyJoinForm } from "@/components/buddy-join-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/sample-data";

export default async function JoinBuddyGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = events.find((item) => item.id === id);
  if (!event) notFound();

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <Link href={`/events/${event.id}`} className="focus-ring w-fit rounded-sm text-sm font-semibold text-primary">Back to event</Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Join Small Group</CardTitle>
          <p className="text-sm text-muted-foreground">{event.name}</p>
        </CardHeader>
        <CardContent>
          <BuddyJoinForm eventId={event.id} eventName={event.name} />
        </CardContent>
      </Card>
    </div>
  );
}
