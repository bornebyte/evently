import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { paymentQr: { select: { label: true, payload: true, imageUrl: true, isActive: true } } } });
  if (!event?.paymentQr || !event.paymentQr.isActive) return NextResponse.json({ qr: null });
  return NextResponse.json({ qr: event.paymentQr });
}
