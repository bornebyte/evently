import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCompactNumber } from "@/lib/format";
import type { PublicCategory, PublicEvent } from "@/lib/contracts";

const publicEventSelect = {
  id: true,
  slug: true,
  title: true,
  shortDescription: true,
  description: true,
  category: true,
  tags: true,
  coverImage: true,
  galleryImages: true,
  startAt: true,
  endAt: true,
  timezone: true,
  venueName: true,
  address: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,
  latitude: true,
  longitude: true,
  featured: true,
  organizer: {
    select: { name: true, description: true, email: true, phone: true, website: true },
  },
  ticketTypes: {
    where: { status: "ACTIVE" as const },
    orderBy: { price: "asc" as const },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      totalQuantity: true,
      availableQuantity: true,
      maxPerOrder: true,
    },
  },
} satisfies Prisma.EventSelect;

type PublicEventRow = Prisma.EventGetPayload<{ select: typeof publicEventSelect }>;

function formatDate(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat("en-IN", { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-IN", options).format(date);
  }
}

function toPublicEvent(event: PublicEventRow): PublicEvent {
  const capacity = event.ticketTypes.reduce((sum, ticket) => sum + ticket.totalQuantity, 0);
  const available = event.ticketTypes.reduce((sum, ticket) => sum + ticket.availableQuantity, 0);
  const sold = Math.max(0, capacity - available);
  const lowestPrice = event.ticketTypes[0] ? Number(event.ticketTypes[0].price) : null;
  const dateOptions = { day: "numeric", month: "short", year: "numeric" } satisfies Intl.DateTimeFormatOptions;
  const dateLongOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" } satisfies Intl.DateTimeFormatOptions;
  const timeOptions = { hour: "numeric", minute: "2-digit" } satisfies Intl.DateTimeFormatOptions;

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    shortDescription: event.shortDescription,
    description: event.description,
    category: event.category,
    tags: event.tags,
    image: event.coverImage,
    galleryImages: event.galleryImages,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    timezone: event.timezone,
    venueName: event.venueName,
    address: event.address,
    city: event.city,
    state: event.state,
    country: event.country,
    postalCode: event.postalCode,
    latitude: event.latitude,
    longitude: event.longitude,
    featured: event.featured,
    organizer: event.organizer,
    ticketTiers: event.ticketTypes.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      description: ticket.description,
      price: Number(ticket.price),
      currency: ticket.currency,
      totalQuantity: ticket.totalQuantity,
      availableQuantity: ticket.availableQuantity,
      maxPerOrder: ticket.maxPerOrder,
    })),
    price: lowestPrice,
    priceLabel: lowestPrice === null ? null : `From ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(lowestPrice)}`,
    attendees: `${formatCompactNumber(sold)} going`,
    capacity,
    sold,
    date: formatDate(event.startAt, event.timezone, dateOptions),
    dateLong: formatDate(event.startAt, event.timezone, dateLongOptions),
    time: `${formatDate(event.startAt, event.timezone, timeOptions)} – ${formatDate(event.endAt, event.timezone, timeOptions)}`,
    month: formatDate(event.startAt, event.timezone, { month: "short" }).toUpperCase(),
    day: formatDate(event.startAt, event.timezone, { day: "2-digit" }),
  };
}

export async function getPublishedEvents() {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-events");

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ startAt: "asc" }, { featured: "desc" }],
    take: 100,
    select: publicEventSelect,
  });
  return events.map(toPublicEvent);
}

export async function getPublishedCategories(): Promise<PublicCategory[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-events");

  const categories = await prisma.event.groupBy({
    by: ["category"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
    orderBy: { _count: { category: "desc" } },
  });
  return categories.map((category) => ({ name: category.category, count: category._count._all }));
}

export async function getPublishedEvent(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-events", `public-event:${slug}`);

  const event = await prisma.event.findFirst({ where: { slug, status: "PUBLISHED" }, select: publicEventSelect });
  return event ? toPublicEvent(event) : null;
}

export async function getRelatedPublishedEvents(category: string, excludedSlug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("public-events");

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", category, slug: { not: excludedSlug } },
    orderBy: [{ featured: "desc" }, { startAt: "asc" }],
    take: 2,
    select: publicEventSelect,
  });
  return events.map(toPublicEvent);
}
