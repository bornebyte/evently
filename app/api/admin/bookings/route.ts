import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const bookings = await prisma.booking.findMany({ orderBy: { bookedAt: "desc" }, take: 100, include: { event: { select: { title: true, slug: true, startAt: true, venueName: true } }, items: { include: { ticketType: { select: { name: true } } } }, attendance: true } });
  return NextResponse.json({ bookings: bookings.map((booking) => ({ reference: booking.reference, attendeeName: booking.attendeeName, attendeeEmail: booking.attendeeEmail, phone: booking.phone, paymentReference: booking.paymentReference, event: booking.event, ticket: booking.items[0]?.ticketType.name ?? "Ticket", quantity: booking.items.reduce((sum, item) => sum + item.quantity, 0), total: Number(booking.total), currency: booking.currency, status: booking.status, bookedAt: booking.bookedAt, verifiedAt: booking.verifiedAt, emailSentAt: booking.emailSentAt, checkedInAt: booking.attendance?.scannedAt ?? null })) });
}
