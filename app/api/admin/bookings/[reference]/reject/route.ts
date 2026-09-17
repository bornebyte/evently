import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

export async function POST(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({ where: { reference }, include: { items: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status !== "PENDING") return NextResponse.json({ error: "Only pending bookings can be declined." }, { status: 409 });
  await prisma.$transaction(async (transaction) => {
    await transaction.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    for (const item of booking.items) await transaction.ticketType.update({ where: { id: item.ticketTypeId }, data: { availableQuantity: { increment: item.quantity } } });
  });
  revalidateTag("public-events", "max");
  return NextResponse.json({ ok: true, reference, status: "CANCELLED" });
}
