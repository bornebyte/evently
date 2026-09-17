import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

type PaymentQrInput = {
  action?: "set-status" | "update";
  qrId?: string;
  eventId?: string;
  eventSlug?: string;
  label?: string;
  payload?: string;
  imageUrl?: string | null;
  eventIds?: unknown;
  activeEventIds?: unknown;
  isActive?: boolean;
};

const qrSelect = {
  id: true,
  eventId: true,
  label: true,
  payload: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  event: { select: { id: true, slug: true, title: true, status: true } },
  eventLinks: {
    orderBy: { createdAt: "asc" as const },
    select: {
      eventId: true,
      isActive: true,
      event: { select: { id: true, slug: true, title: true, status: true } },
    },
  },
} satisfies Prisma.PaymentQrSelect;

type AdminQrRow = Prisma.PaymentQrGetPayload<{ select: typeof qrSelect }>;

function normalizeIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && id.trim().length > 0).map((id) => id.trim()))];
}

function serializeQr(qr: AdminQrRow) {
  const assignments = qr.eventLinks.length > 0
    ? qr.eventLinks.map((link) => ({ eventId: link.eventId, event: link.event, isActive: link.isActive }))
    : qr.event ? [{ eventId: qr.event.id, event: qr.event, isActive: qr.isActive }] : [];

  return {
    id: qr.id,
    label: qr.label,
    payload: qr.payload,
    imageUrl: qr.imageUrl,
    isActive: qr.isActive,
    assignments,
    createdAt: qr.createdAt.toISOString(),
    updatedAt: qr.updatedAt.toISOString(),
  };
}

async function resolveEventIds(body: PaymentQrInput) {
  if (Array.isArray(body.eventIds)) return normalizeIds(body.eventIds);
  if (body.eventSlug?.trim()) {
    const event = await prisma.event.findUnique({ where: { slug: body.eventSlug.trim() }, select: { id: true } });
    return event ? [event.id] : null;
  }
  return [];
}

async function validateEvents(eventIds: string[]) {
  if (eventIds.length === 0) return [];
  const events = await prisma.event.findMany({ where: { id: { in: eventIds } }, select: { id: true } });
  return events.length === eventIds.length ? events : null;
}

async function findQr(id: string) {
  return prisma.paymentQr.findUnique({ where: { id }, select: qrSelect });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  const [events, qrs] = await Promise.all([
    prisma.event.findMany({ orderBy: { title: "asc" }, select: { id: true, slug: true, title: true, status: true } }),
    prisma.paymentQr.findMany({ orderBy: { createdAt: "desc" }, select: qrSelect }),
  ]);

  return NextResponse.json({ events, qrs: qrs.map(serializeQr) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  try {
    const payload = await request.json() as unknown;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "Please send valid payment QR details." }, { status: 400 });
    const body = payload as PaymentQrInput;
    const label = typeof body.label === "string" ? body.label.trim() : "";
    const qrPayload = typeof body.payload === "string" ? body.payload.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null;
    const eventIds = await resolveEventIds(body);
    if (!eventIds) return NextResponse.json({ error: "The selected event could not be found." }, { status: 404 });
    if (label.length < 2 || label.length > 120 || !qrPayload || qrPayload.length > 4000) return NextResponse.json({ error: "Provide a label and a valid UPI QR payload." }, { status: 400 });
    if (imageUrl && imageUrl.length > 2000) return NextResponse.json({ error: "The QR image URL is too long." }, { status: 400 });
    if (!await validateEvents(eventIds)) return NextResponse.json({ error: "One or more selected events could not be found." }, { status: 404 });

    const hasActiveSelection = Array.isArray(body.activeEventIds);
    const activeEventIds = normalizeIds(body.activeEventIds).filter((eventId) => eventIds.includes(eventId));
    const qrId = await prisma.$transaction(async (transaction) => {
      const qr = await transaction.paymentQr.create({ data: { eventId: eventIds[0] ?? null, label, payload: qrPayload, imageUrl, isActive: true }, select: { id: true } });
      for (const eventId of eventIds) {
        const isActive = hasActiveSelection ? activeEventIds.includes(eventId) : eventId === eventIds[0];
        if (isActive) await transaction.eventPaymentQr.updateMany({ where: { eventId, isActive: true }, data: { isActive: false } });
        await transaction.eventPaymentQr.create({ data: { eventId, paymentQrId: qr.id, isActive } });
      }
      return qr.id;
    });

    const qr = await findQr(qrId);
    revalidateTag("public-events", "max");
    return NextResponse.json({ ok: true, qr: qr && serializeQr(qr) }, { status: 201 });
  } catch (error) {
    console.error("[admin/payment-qr] Failed to create payment QR:", error);
    return NextResponse.json({ error: "Unable to add the payment QR right now." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  try {
    const payload = await request.json() as unknown;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "Please send valid payment QR details." }, { status: 400 });
    const body = payload as PaymentQrInput;
    if (!body.qrId?.trim()) return NextResponse.json({ error: "Choose the QR code you want to change." }, { status: 400 });
    const qrId = body.qrId.trim();
    const existingQr = await prisma.paymentQr.findUnique({ where: { id: qrId }, select: { id: true } });
    if (!existingQr) return NextResponse.json({ error: "Payment QR not found." }, { status: 404 });

    if (body.action === "set-status") {
      const eventId = body.eventId?.trim() || (body.eventSlug?.trim() ? (await prisma.event.findUnique({ where: { slug: body.eventSlug.trim() }, select: { id: true } }))?.id : undefined);
      if (!eventId || typeof body.isActive !== "boolean") return NextResponse.json({ error: "Choose an event and a valid QR status." }, { status: 400 });
      const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
      if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

      await prisma.$transaction(async (transaction) => {
        if (body.isActive) await transaction.eventPaymentQr.updateMany({ where: { eventId, isActive: true, paymentQrId: { not: qrId } }, data: { isActive: false } });
        await transaction.eventPaymentQr.upsert({ where: { eventId_paymentQrId: { eventId, paymentQrId: qrId } }, update: { isActive: body.isActive }, create: { eventId, paymentQrId: qrId, isActive: body.isActive } });
      });

      const qr = await findQr(qrId);
      revalidateTag("public-events", "max");
      return NextResponse.json({ ok: true, qr: qr && serializeQr(qr) });
    }

    const label = typeof body.label === "string" ? body.label.trim() : "";
    const qrPayload = typeof body.payload === "string" ? body.payload.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null;
    const eventIds = await resolveEventIds(body);
    if (!eventIds) return NextResponse.json({ error: "The selected event could not be found." }, { status: 404 });
    if (label.length < 2 || label.length > 120 || !qrPayload || qrPayload.length > 4000) return NextResponse.json({ error: "Provide a label and a valid UPI QR payload." }, { status: 400 });
    if (imageUrl && imageUrl.length > 2000) return NextResponse.json({ error: "The QR image URL is too long." }, { status: 400 });
    if (!await validateEvents(eventIds)) return NextResponse.json({ error: "One or more selected events could not be found." }, { status: 404 });

    const hasActiveSelection = Array.isArray(body.activeEventIds);
    const currentActiveLinks = hasActiveSelection ? [] : await prisma.eventPaymentQr.findMany({ where: { paymentQrId: qrId, isActive: true }, select: { eventId: true } });
    const activeEventIds = (hasActiveSelection ? normalizeIds(body.activeEventIds) : currentActiveLinks.map((link) => link.eventId)).filter((eventId) => eventIds.includes(eventId));

    await prisma.$transaction(async (transaction) => {
      await transaction.paymentQr.update({ where: { id: qrId }, data: { eventId: eventIds[0] ?? null, label, payload: qrPayload, imageUrl, isActive: eventIds.length > 0 } });
      if (eventIds.length === 0) await transaction.eventPaymentQr.deleteMany({ where: { paymentQrId: qrId } });
      else await transaction.eventPaymentQr.deleteMany({ where: { paymentQrId: qrId, eventId: { notIn: eventIds } } });

      for (const eventId of eventIds) {
        const isActive = activeEventIds.includes(eventId);
        if (isActive) await transaction.eventPaymentQr.updateMany({ where: { eventId, isActive: true, paymentQrId: { not: qrId } }, data: { isActive: false } });
        await transaction.eventPaymentQr.upsert({ where: { eventId_paymentQrId: { eventId, paymentQrId: qrId } }, update: { isActive }, create: { eventId, paymentQrId: qrId, isActive } });
      }
    });

    const qr = await findQr(qrId);
    revalidateTag("public-events", "max");
    return NextResponse.json({ ok: true, qr: qr && serializeQr(qr) });
  } catch (error) {
    console.error("[admin/payment-qr] Failed to update payment QR:", error);
    return NextResponse.json({ error: "Unable to save the payment QR right now." }, { status: 500 });
  }
}
