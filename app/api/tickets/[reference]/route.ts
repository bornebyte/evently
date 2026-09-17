import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const booking = await prisma.booking.findFirst({ where: { OR: [{ reference }, { ticketToken: reference }] }, include: { event: { select: { title: true, slug: true, startAt: true, endAt: true, venueName: true, address: true, city: true, category: true } }, items: { include: { ticketType: { select: { name: true } } } } } });
  if (!booking) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  const qrImage = await QRCode.toDataURL(booking.ticketToken, { errorCorrectionLevel: "M", margin: 2, width: 512 });
  return NextResponse.json({ reference: booking.reference, attendeeName: booking.attendeeName, attendeeEmail: booking.attendeeEmail, ticketToken: booking.ticketToken, qrImage, total: Number(booking.total), currency: booking.currency, status: booking.status, event: booking.event, ticket: booking.items[0]?.ticketType.name ?? "Ticket", quantity: booking.items.reduce((sum, item) => sum + item.quantity, 0) });
}
