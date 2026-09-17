import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const scans = await prisma.attendance.findMany({ orderBy: { scannedAt: "desc" }, take: 100, include: { booking: { include: { event: { select: { title: true } }, items: { include: { ticketType: { select: { name: true } } } } } } } });
  return NextResponse.json({ scans: scans.map((scan) => ({ reference: scan.booking.reference, attendeeName: scan.booking.attendeeName, email: scan.booking.attendeeEmail, event: scan.booking.event.title, ticket: scan.booking.items[0]?.ticketType.name ?? "Ticket", scannedAt: scan.scannedAt })) });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const body = await request.json() as { reference?: string };
    const reference = body.reference?.trim();
    if (!reference) return NextResponse.json({ error: "Scan a ticket reference to check in." }, { status: 400 });
    const booking = await prisma.booking.findFirst({ where: { OR: [{ reference }, { ticketToken: reference }] }, include: { event: { select: { title: true } }, items: { include: { ticketType: { select: { name: true } } } }, attendance: true } });
    if (!booking) return NextResponse.json({ error: "That ticket could not be found." }, { status: 404 });
    if (booking.status !== "CONFIRMED") return NextResponse.json({ error: "This booking is still awaiting payment confirmation." }, { status: 409 });
    if (booking.attendance) return NextResponse.json({ duplicate: true, attendee: { reference: booking.reference, name: booking.attendeeName, event: booking.event.title, ticket: booking.items[0]?.ticketType.name ?? "Ticket", scannedAt: booking.attendance.scannedAt } });
    const scan = await prisma.attendance.create({ data: { bookingId: booking.id, scannedBy: admin.email } });
    return NextResponse.json({ ok: true, attendee: { reference: booking.reference, name: booking.attendeeName, event: booking.event.title, ticket: booking.items[0]?.ticketType.name ?? "Ticket", scannedAt: scan.scannedAt } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not check in that ticket." }, { status: 500 });
  }
}
