import { notFound } from "next/navigation";
import EventDetails from "./event-details";
import { events, getEventBySlug } from "@/lib/events";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();
  return <EventDetails event={event} />;
}
