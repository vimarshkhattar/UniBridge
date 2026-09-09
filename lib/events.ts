import { events } from "@/lib/sample-data";
import type { CampusEvent } from "@/lib/types";

/**
 * The event list is a fixed sample calendar, so the app decides what is still
 * ahead by comparing each start time to now instead of assuming array order.
 */
function byStartTime(a: CampusEvent, b: CampusEvent) {
  return Date.parse(a.startsAt) - Date.parse(b.startsAt);
}

export function isPastEvent(event: CampusEvent, now: number = Date.now()) {
  return Date.parse(event.startsAt) < now;
}

export function upcomingEvents(now: number = Date.now()) {
  return events.filter((event) => !isPastEvent(event, now)).sort(byStartTime);
}

export function pastEvents(now: number = Date.now()) {
  return events.filter((event) => isPastEvent(event, now)).sort(byStartTime).reverse();
}

/** Events ordered so anything still ahead comes first, past events after. */
export function eventsByRelevance(now: number = Date.now()) {
  return [...upcomingEvents(now), ...pastEvents(now)];
}

export function nextEvent(now: number = Date.now()) {
  return upcomingEvents(now)[0];
}
