import EventsClient from "./events-client";
import { getPublishedCategories, getPublishedEvents } from "@/lib/data";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const value = (key: string) => {
    const item = params[key];
    return Array.isArray(item) ? item[0] ?? "" : item ?? "";
  };
  const [events, categories] = await Promise.all([getPublishedEvents(), getPublishedCategories()]);
  return <EventsClient events={events} categories={categories} initialSearch={value("search")} initialCategory={value("category")} initialCity={value("city")} />;
}
