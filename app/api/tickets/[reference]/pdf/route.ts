import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makePdf } from "@/lib/mailer";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const kind = new URL(request.url).searchParams.get("kind") === "receipt" ? "receipt" : "ticket";
  const booking = await prisma.booking.findFirst({ where: { OR: [{ reference }, { ticketToken: reference }] }, include: { event: true, items: { include: { ticketType: true } } } });
  if (!booking) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  const item = booking.items[0];
  const pdf = await makePdf(kind === "receipt" ? "Payment receipt" : "Event ticket", kind === "receipt" ? [`Paid for: ${booking.event.title}`, `Amount: INR ${Number(booking.total).toLocaleString("en-IN")}`, `Ticket: ${item?.ticketType.name ?? "Ticket"}`, `Booking reference: ${booking.reference}`] : [booking.event.title, booking.event.startAt.toLocaleDateString("en-IN", { dateStyle: "full" }), booking.event.venueName, `${item?.quantity ?? 1} × ${item?.ticketType.name ?? "Ticket"}`, `Booking reference: ${booking.reference}`]);
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${booking.reference}-${kind}.pdf"`, "Cache-Control": "private, no-store" } });
}
