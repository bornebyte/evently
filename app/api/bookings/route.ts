import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { eventSlug?: string; ticketName?: string; quantity?: number; fullName?: string; email?: string; phone?: string; paymentReference?: string };
    const quantity = Number(body.quantity ?? 1);
    if (!body.eventSlug || !body.ticketName || !body.fullName?.trim() || !body.email?.trim() || !body.phone?.trim() || !body.paymentReference?.trim() || !Number.isInteger(quantity) || quantity < 1 || quantity > 8) return NextResponse.json({ error: "Complete the booking details before submitting." }, { status: 400 });

    const event = await prisma.event.findUnique({ where: { slug: body.eventSlug }, include: { ticketTypes: true } });
    if (!event || event.status !== "PUBLISHED") return NextResponse.json({ error: "This event is not available for booking." }, { status: 404 });
    const ticket = event.ticketTypes.find((item) => item.name === body.ticketName && item.status === "ACTIVE");
    if (!ticket) return NextResponse.json({ error: "That ticket type is no longer available." }, { status: 409 });
    if (quantity > ticket.availableQuantity || quantity > ticket.maxPerOrder) return NextResponse.json({ error: "There are not enough tickets available for that quantity." }, { status: 409 });

    const total = Number(ticket.price) * quantity;
    const reference = `EVT-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
    const booking = await prisma.$transaction(async (transaction) => {
      const reserved = await transaction.ticketType.updateMany({ where: { id: ticket.id, status: "ACTIVE", availableQuantity: { gte: quantity } }, data: { availableQuantity: { decrement: quantity } } });
      if (reserved.count !== 1) throw new Error("TICKETS_UNAVAILABLE");
      return transaction.booking.create({ data: { reference, eventId: event.id, attendeeName: body.fullName!.trim(), attendeeEmail: body.email!.trim().toLowerCase(), phone: body.phone!.trim(), paymentReference: body.paymentReference!.trim(), total, currency: "INR", status: "PENDING", items: { create: { ticketTypeId: ticket.id, quantity, unitPrice: ticket.price } } } });
    });
    return NextResponse.json({ ok: true, booking: { reference: booking.reference, status: booking.status, total: Number(booking.total) } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not submit this booking. Please try again." }, { status: 500 });
  }
}
