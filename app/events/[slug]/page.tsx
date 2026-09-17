import { notFound } from "next/navigation";
import { getPublishedEvent, getRelatedPublishedEvents } from "@/lib/data";
import EventDetails from "./event-details";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublishedEvent(slug);
  if (!event) notFound();
  const related = await getRelatedPublishedEvents(event.category, event.slug);
  return <EventDetails event={event} related={related} />;
}
