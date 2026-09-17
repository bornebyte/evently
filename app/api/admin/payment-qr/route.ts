import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const events = await prisma.event.findMany({ orderBy: { startAt: "asc" }, select: { slug: true, title: true, paymentQr: true } });
  return NextResponse.json({ events: events.map((event) => ({ slug: event.slug, title: event.title, qr: event.paymentQr })) });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const body = await request.json() as { eventSlug?: string; label?: string; payload?: string; imageUrl?: string; isActive?: boolean };
    if (!body.eventSlug || !body.label?.trim() || !body.payload?.trim()) return NextResponse.json({ error: "Choose an event and provide the QR label and payment payload." }, { status: 400 });
    const event = await prisma.event.findUnique({ where: { slug: body.eventSlug }, select: { id: true } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const qr = await prisma.paymentQr.upsert({ where: { eventId: event.id }, update: { label: body.label.trim(), payload: body.payload.trim(), imageUrl: body.imageUrl?.trim() || null, isActive: body.isActive ?? true }, create: { eventId: event.id, label: body.label.trim(), payload: body.payload.trim(), imageUrl: body.imageUrl?.trim() || null, isActive: body.isActive ?? true } });
    return NextResponse.json({ ok: true, qr });
  } catch {
    return NextResponse.json({ error: "Unable to save the payment QR right now." }, { status: 500 });
  }
}
