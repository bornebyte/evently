import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makePdf } from "@/lib/ticket-documents";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const kind = new URL(request.url).searchParams.get("kind") === "receipt" ? "receipt" : "ticket";
  const booking = await prisma.booking.findFirst({ where: { OR: [{ reference }, { ticketToken: reference }] }, include: { event: { include: { organizer: true } }, items: { include: { ticketType: true } } } });
  if (!booking) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const payload = {
    reference: booking.reference,
    ticketToken: booking.ticketToken,
    attendeeName: booking.attendeeName,
    attendeeEmail: booking.attendeeEmail,
    phone: booking.phone,
    eventTitle: booking.event.title,
    eventCategory: booking.event.category,
    eventDescription: booking.event.shortDescription,
    eventStartAt: booking.event.startAt,
    eventEndAt: booking.event.endAt,
    eventTimezone: booking.event.timezone,
    venueName: booking.event.venueName,
    address: booking.event.address,
    city: booking.event.city,
    state: booking.event.state,
    country: booking.event.country,
    postalCode: booking.event.postalCode,
    organizerName: booking.event.organizer.name,
    organizerEmail: booking.event.organizer.email,
    organizerPhone: booking.event.organizer.phone,
    organizerWebsite: booking.event.organizer.website,
    items: booking.items.map((item) => ({ name: item.ticketType.name, description: item.ticketType.description, quantity: item.quantity, unitPrice: Number(item.unitPrice) })),
    total: Number(booking.total),
    currency: booking.currency,
    paymentReference: booking.paymentReference,
    bookedAt: booking.bookedAt,
    verifiedAt: booking.verifiedAt,
    ticketUrl: `${appUrl}/tickets/${booking.reference}`,
  };
  const pdf = await makePdf(kind, payload);
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${booking.reference}-${kind}.pdf"`, "Cache-Control": "private, no-store" } });
}
