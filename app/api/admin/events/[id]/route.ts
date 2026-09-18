import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { EventInputError, normalizeEventInput } from "@/lib/admin-event-input";
import { prisma } from "@/lib/prisma";

const eventDetailSelect = {
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
  mapEmbedUrl: true,
  status: true,
  featured: true,
  organizer: { select: { name: true, description: true, email: true, phone: true, website: true } },
  ticketTypes: {
    orderBy: { createdAt: "asc" as const },
    select: { id: true, name: true, description: true, price: true, totalQuantity: true, availableQuantity: true, salesStart: true, salesEnd: true, minPerOrder: true, maxPerOrder: true, status: true },
  },
} satisfies Prisma.EventSelect;

type EventDetail = Prisma.EventGetPayload<{ select: typeof eventDetailSelect }>;

function serializeEvent(event: EventDetail) {
  return {
    ...event,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    ticketTypes: event.ticketTypes.map((ticket) => ({ ...ticket, price: Number(ticket.price), salesStart: ticket.salesStart?.toISOString() ?? null, salesEnd: ticket.salesEnd?.toISOString() ?? null })),
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: eventDetailSelect });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json({ event: serializeEvent(event) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  const { id } = await params;
  try {
    const input = normalizeEventInput(await request.json());
    const current = await prisma.event.findUnique({ where: { id }, select: { id: true, slug: true, organizerId: true, organizer: true, ticketTypes: { select: { id: true, totalQuantity: true, availableQuantity: true } } } });
    if (!current) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const duplicateSlug = await prisma.event.findFirst({ where: { slug: input.slug, id: { not: id } }, select: { id: true } });
    if (duplicateSlug) return NextResponse.json({ error: "That event URL is already in use." }, { status: 409 });

    const currentTicketIds = new Set(current.ticketTypes.map((ticket) => ticket.id));
    const incomingTicketIds = new Set(input.ticketTypes.flatMap((ticket) => ticket.id ? [ticket.id] : []));
    const unknownTicket = [...incomingTicketIds].find((ticketId) => !currentTicketIds.has(ticketId));
    if (unknownTicket) return NextResponse.json({ error: "One of the ticket types does not belong to this event." }, { status: 400 });

    const removedTicketIds = current.ticketTypes.filter((ticket) => !incomingTicketIds.has(ticket.id)).map((ticket) => ticket.id);
    if (removedTicketIds.length > 0) {
      const bookingsUsingRemovedTickets = await prisma.bookingItem.count({ where: { ticketTypeId: { in: removedTicketIds } } });
      if (bookingsUsingRemovedTickets > 0) return NextResponse.json({ error: "Ticket types with bookings cannot be removed. Pause them instead." }, { status: 409 });
    }

    const currentTickets = new Map(current.ticketTypes.map((ticket) => [ticket.id, ticket]));
    for (const ticket of input.ticketTypes) {
      if (!ticket.id) continue;
      const saved = currentTickets.get(ticket.id)!;
      const reserved = saved.totalQuantity - saved.availableQuantity;
      if (ticket.quantity < reserved) return NextResponse.json({ error: `The quantity for “${ticket.name}” cannot be below its ${reserved} already reserved ticket${reserved === 1 ? "" : "s"}.` }, { status: 409 });
    }

    const event = await prisma.$transaction(async (transaction) => {
      const sameOrganizer = current.organizer.email.toLowerCase() === input.organizerEmail;
      let organizerId = current.organizerId;
      if (sameOrganizer) {
        await transaction.organizer.update({ where: { id: current.organizerId }, data: { name: input.organizerName, description: input.organizerDescription, email: input.organizerEmail, phone: input.organizerPhone, website: input.organizerWebsite } });
      } else {
        const matchingOrganizer = await transaction.organizer.findFirst({ where: { email: input.organizerEmail, id: { not: current.organizerId } } });
        if (matchingOrganizer) {
          organizerId = matchingOrganizer.id;
          await transaction.organizer.update({ where: { id: matchingOrganizer.id }, data: { name: input.organizerName, description: input.organizerDescription, phone: input.organizerPhone, website: input.organizerWebsite } });
        } else {
          await transaction.organizer.update({ where: { id: current.organizerId }, data: { name: input.organizerName, description: input.organizerDescription, email: input.organizerEmail, phone: input.organizerPhone, website: input.organizerWebsite } });
        }
      }

      if (removedTicketIds.length > 0) await transaction.ticketType.deleteMany({ where: { eventId: id, id: { in: removedTicketIds } } });
      for (const ticket of input.ticketTypes) {
        const data = { name: ticket.name, description: ticket.description, price: ticket.price, minPerOrder: ticket.minPerOrder, maxPerOrder: ticket.maxPerOrder, salesStart: ticket.salesStart, salesEnd: ticket.salesEnd, status: ticket.status };
        if (ticket.id) {
          const saved = currentTickets.get(ticket.id)!;
          const reserved = saved.totalQuantity - saved.availableQuantity;
          await transaction.ticketType.update({ where: { id: ticket.id }, data: { ...data, totalQuantity: ticket.quantity, availableQuantity: ticket.quantity - reserved } });
        } else {
          await transaction.ticketType.create({ data: { ...data, eventId: id, totalQuantity: ticket.quantity, availableQuantity: ticket.quantity } });
        }
      }

      return transaction.event.update({
        where: { id },
        data: { slug: input.slug, title: input.title, shortDescription: input.shortDescription, description: input.description, category: input.category, tags: input.tags, coverImage: input.coverImage, galleryImages: input.galleryImages, startAt: input.startAt, endAt: input.endAt, timezone: input.timezone, venueName: input.venueName, address: input.address, city: input.city, state: input.state, country: input.country, postalCode: input.postalCode, latitude: input.latitude, longitude: input.longitude, mapEmbedUrl: input.mapEmbedUrl, featured: input.featured, status: input.status, organizerId },
        select: { id: true, slug: true, status: true },
      });
    });

    revalidateTag("public-events", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${current.slug}`);
    revalidatePath(`/events/${event.slug}`);
    return NextResponse.json({ ok: true, event });
  } catch (error) {
    if (error instanceof EventInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update the event right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, _count: { select: { bookings: true } } },
    });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (event._count.bookings > 0) return NextResponse.json({ error: "Events with bookings cannot be deleted. Archive the event instead." }, { status: 409 });

    await prisma.event.delete({ where: { id: event.id } });

    revalidateTag("public-events", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    return NextResponse.json({ ok: true, deletedId: event.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "This event cannot be deleted because it has related bookings. Archive the event instead." }, { status: 409 });
    }
    console.error("[admin/events] Failed to delete event:", error);
    return NextResponse.json({ error: "Unable to delete the event right now." }, { status: 500 });
  }
}
