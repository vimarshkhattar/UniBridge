import Link from "next/link";
import { notFound } from "next/navigation";
import { BuddyCreateForm } from "@/components/buddy-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/sample-data";

export default async function CreateBuddyGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = events.find((item) => item.id === id);
  if (!event) notFound();

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <Link href={`/events/${event.id}`} className="focus-ring w-fit rounded-sm text-sm font-semibold text-primary">Back to event</Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Buddy Group</CardTitle>
          <p className="text-sm text-muted-foreground">{event.name}</p>
        </CardHeader>
        <CardContent>
          <BuddyCreateForm eventId={event.id} eventName={event.name} />
        </CardContent>
      </Card>
    </div>
  );
}
