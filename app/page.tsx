import { getPublishedCategories, getPublishedEvents } from "@/lib/data";
import HomeClient from "@/app/home-client";

export default async function Home() {
  const [events, categories] = await Promise.all([getPublishedEvents(), getPublishedCategories()]);
  return <HomeClient events={events} categories={categories} />;
}
