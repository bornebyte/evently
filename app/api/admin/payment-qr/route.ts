import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

type PaymentQrInput = { eventSlug?: string; qrId?: string; label?: string; payload?: string; imageUrl?: string; isActive?: boolean };

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  const events = await prisma.event.findMany({
    orderBy: { startAt: "asc" },
    select: {
      slug: true,
      title: true,
      paymentQrs: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ events: events.map((event) => ({ slug: event.slug, title: event.title, qrs: event.paymentQrs })) });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  try {
    const body = await request.json() as PaymentQrInput;
    if (!body.eventSlug || !body.label?.trim() || !body.payload?.trim()) return NextResponse.json({ error: "Choose an event and provide the QR label and payment payload." }, { status: 400 });

    const event = await prisma.event.findUnique({ where: { slug: body.eventSlug }, select: { id: true } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const activeCount = await prisma.paymentQr.count({ where: { eventId: event.id, isActive: true } });
    const shouldActivate = body.isActive ?? activeCount === 0;
    const qr = await prisma.$transaction(async (transaction) => {
      if (shouldActivate) await transaction.paymentQr.updateMany({ where: { eventId: event.id }, data: { isActive: false } });
      return transaction.paymentQr.create({ data: { eventId: event.id, label: body.label!.trim(), payload: body.payload!.trim(), imageUrl: body.imageUrl?.trim() || null, isActive: shouldActivate } });
    });

    revalidateTag("public-events", "max");
    return NextResponse.json({ ok: true, qr }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to add the payment QR right now." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  try {
    const body = await request.json() as PaymentQrInput & { action?: "activate" | "update" };
    if (!body.eventSlug || !body.qrId) return NextResponse.json({ error: "Choose the QR code you want to change." }, { status: 400 });

    const event = await prisma.event.findUnique({ where: { slug: body.eventSlug }, select: { id: true } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const selectedQr = await prisma.paymentQr.findFirst({ where: { id: body.qrId, eventId: event.id } });
    if (!selectedQr) return NextResponse.json({ error: "Payment QR not found for this event." }, { status: 404 });

    if (body.action === "activate") {
      const qr = await prisma.$transaction(async (transaction) => {
        await transaction.paymentQr.updateMany({ where: { eventId: event.id }, data: { isActive: false } });
        return transaction.paymentQr.update({ where: { id: selectedQr.id }, data: { isActive: true } });
      });
      revalidateTag("public-events", "max");
      return NextResponse.json({ ok: true, qr });
    }

    if (!body.label?.trim() || !body.payload?.trim()) return NextResponse.json({ error: "Provide the QR label and payment payload." }, { status: 400 });
    const qr = await prisma.paymentQr.update({ where: { id: selectedQr.id }, data: { label: body.label.trim(), payload: body.payload.trim(), imageUrl: body.imageUrl?.trim() || null } });
    revalidateTag("public-events", "max");
    return NextResponse.json({ ok: true, qr });
  } catch {
    return NextResponse.json({ error: "Unable to save the payment QR right now." }, { status: 500 });
  }
}
