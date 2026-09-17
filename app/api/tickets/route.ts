import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const BOOKING_COOKIE = "evently_booking_references";

export async function GET() {
  const raw = (await cookies()).get(BOOKING_COOKIE)?.value;
  let references: string[] = [];
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) references = parsed.filter((value): value is string => typeof value === "string").slice(0, 25);
  } catch {
    references = [];
  }
  if (references.length === 0) return NextResponse.json({ bookings: [] }, { headers: { "Cache-Control": "private, no-store" } });

  const bookings = await prisma.booking.findMany({
    where: { reference: { in: references } },
    orderBy: { bookedAt: "desc" },
    include: {
      event: { select: { slug: true, title: true, category: true, startAt: true, endAt: true, venueName: true, address: true, city: true } },
      items: { include: { ticketType: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ bookings: bookings.map((booking) => ({
    reference: booking.reference,
    attendeeName: booking.attendeeName,
    attendeeEmail: booking.attendeeEmail,
    ticketToken: booking.ticketToken,
    total: Number(booking.total),
    currency: booking.currency,
    status: booking.status,
    bookedAt: booking.bookedAt,
    event: booking.event,
    ticket: booking.items[0]?.ticketType.name ?? "Ticket",
    quantity: booking.items.reduce((sum, item) => sum + item.quantity, 0),
  })) }, { headers: { "Cache-Control": "private, no-store" } });
}
