import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { EventInputError, normalizeEventInput } from "@/lib/admin-event-input";
import { prisma } from "@/lib/prisma";

function serializeListEvent(event: {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  startAt: Date;
  endAt: Date;
  city: string;
  venueName: string;
  status: string;
  featured: boolean;
  updatedAt: Date;
  ticketTypes: { id: string; name: string; totalQuantity: number; availableQuantity: number; status: string }[];
  _count: { bookings: number };
}) {
  return { ...event, startAt: event.startAt.toISOString(), endAt: event.endAt.toISOString(), updatedAt: event.updatedAt.toISOString(), bookings: event._count.bookings, _count: undefined };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  const events = await prisma.event.findMany({
    orderBy: [{ startAt: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      coverImage: true,
      startAt: true,
      endAt: true,
      city: true,
      venueName: true,
      status: true,
      featured: true,
      updatedAt: true,
      ticketTypes: { orderBy: { price: "asc" }, select: { id: true, name: true, totalQuantity: true, availableQuantity: true, status: true } },
      _count: { select: { bookings: true } },
    },
  });

  return NextResponse.json({ events: events.map(serializeListEvent) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  try {
    const input = normalizeEventInput(await request.json());
    const existing = await prisma.event.findUnique({ where: { slug: input.slug }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "That event URL is already in use." }, { status: 409 });

    const event = await prisma.$transaction(async (transaction) => {
      const existingOrganizer = await transaction.organizer.findFirst({ where: { email: input.organizerEmail } });
      const organizer = existingOrganizer
        ? await transaction.organizer.update({ where: { id: existingOrganizer.id }, data: { name: input.organizerName, description: input.organizerDescription, phone: input.organizerPhone, website: input.organizerWebsite } })
        : await transaction.organizer.create({ data: { name: input.organizerName, description: input.organizerDescription, email: input.organizerEmail, phone: input.organizerPhone, website: input.organizerWebsite } });

      return transaction.event.create({
        data: {
          slug: input.slug,
          title: input.title,
          shortDescription: input.shortDescription,
          description: input.description,
          category: input.category,
          tags: input.tags,
          coverImage: input.coverImage,
          galleryImages: input.galleryImages,
          startAt: input.startAt,
          endAt: input.endAt,
          timezone: input.timezone,
          venueName: input.venueName,
          address: input.address,
          city: input.city,
          state: input.state,
          country: input.country,
          postalCode: input.postalCode,
          latitude: input.latitude,
          longitude: input.longitude,
          featured: input.featured,
          status: input.status,
          organizerId: organizer.id,
          ticketTypes: { create: input.ticketTypes.map((ticket) => ({ name: ticket.name, description: ticket.description, price: ticket.price, totalQuantity: ticket.quantity, availableQuantity: ticket.quantity, minPerOrder: ticket.minPerOrder, maxPerOrder: ticket.maxPerOrder, salesStart: ticket.salesStart, salesEnd: ticket.salesEnd, status: ticket.status })) },
        },
        select: { id: true, slug: true, status: true },
      });
    });

    revalidateTag("public-events", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/events");
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch (error) {
    if (error instanceof EventInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to create the event right now." }, { status: 500 });
  }
}
