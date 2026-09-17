import EventsClient from "./events-client";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const value = (key: string) => {
    const item = params[key];
    return Array.isArray(item) ? item[0] ?? "" : item ?? "";
  };

  return <EventsClient initialSearch={value("search")} initialCategory={value("category")} />;
}
