import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { sendBookingConfirmationEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({ where: { reference }, include: { event: true, items: { include: { ticketType: true } } } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "A declined booking cannot be confirmed." }, { status: 409 });
  if (booking.status === "CONFIRMED" && booking.emailSentAt) return NextResponse.json({ ok: true, reference, emailSent: true });

  const updated = booking.status === "CONFIRMED" ? booking : await prisma.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED", verifiedAt: new Date() }, include: { event: true, items: { include: { ticketType: true } } } });
  try {
    const item = updated.items[0];
    if (!item) return NextResponse.json({ error: "This booking has no ticket items." }, { status: 422 });
    const ticketUrl = await sendBookingConfirmationEmail({ reference: updated.reference, attendeeName: updated.attendeeName, attendeeEmail: updated.attendeeEmail, eventTitle: updated.event.title, eventDate: updated.event.startAt.toLocaleDateString("en-IN", { dateStyle: "full" }), eventVenue: updated.event.venueName, ticketName: item.ticketType.name, quantity: item.quantity, total: Number(updated.total) });
    await prisma.booking.update({ where: { id: updated.id }, data: { emailSentAt: new Date() } });
    return NextResponse.json({ ok: true, reference: updated.reference, emailSent: true, ticketUrl });
  } catch (error) {
    return NextResponse.json({ ok: true, reference: updated.reference, emailSent: false, warning: error instanceof Error ? error.message : "Ticket email could not be sent." });
  }
}
