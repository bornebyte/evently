import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { sendBookingConfirmationEmail } from "@/lib/mailer";

export async function POST(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({ where: { reference }, include: { event: { include: { organizer: true } }, items: { include: { ticketType: true } } } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "A declined booking cannot be confirmed." }, { status: 409 });
  if (booking.status === "CONFIRMED" && booking.emailSentAt) return NextResponse.json({ ok: true, reference, emailSent: true });

  const updated = booking.status === "CONFIRMED" ? booking : await prisma.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED", verifiedAt: new Date() }, include: { event: { include: { organizer: true } }, items: { include: { ticketType: true } } } });
  revalidateTag("public-events", "max");
  try {
    if (updated.items.length === 0) return NextResponse.json({ error: "This booking has no ticket items." }, { status: 422 });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const ticketUrl = await sendBookingConfirmationEmail({
      reference: updated.reference,
      ticketToken: updated.ticketToken,
      attendeeName: updated.attendeeName,
      attendeeEmail: updated.attendeeEmail,
      phone: updated.phone,
      eventTitle: updated.event.title,
      eventCategory: updated.event.category,
      eventDescription: updated.event.shortDescription,
      eventStartAt: updated.event.startAt,
      eventEndAt: updated.event.endAt,
      eventTimezone: updated.event.timezone,
      venueName: updated.event.venueName,
      address: updated.event.address,
      city: updated.event.city,
      state: updated.event.state,
      country: updated.event.country,
      postalCode: updated.event.postalCode,
      organizerName: updated.event.organizer.name,
      organizerEmail: updated.event.organizer.email,
      organizerPhone: updated.event.organizer.phone,
      organizerWebsite: updated.event.organizer.website,
      items: updated.items.map((item) => ({ name: item.ticketType.name, description: item.ticketType.description, quantity: item.quantity, unitPrice: Number(item.unitPrice) })),
      total: Number(updated.total),
      currency: updated.currency,
      paymentReference: updated.paymentReference,
      bookedAt: updated.bookedAt,
      verifiedAt: updated.verifiedAt,
      ticketUrl: `${appUrl}/tickets/${updated.reference}`,
    });
    await prisma.booking.update({ where: { id: updated.id }, data: { emailSentAt: new Date() } });
    return NextResponse.json({ ok: true, reference: updated.reference, emailSent: true, ticketUrl });
  } catch (error) {
    return NextResponse.json({ ok: true, reference: updated.reference, emailSent: false, warning: error instanceof Error ? error.message : "Ticket email could not be sent." });
  }
}
