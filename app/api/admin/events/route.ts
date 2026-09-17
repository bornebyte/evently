import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

type EventInput = {
  title?: string; slug?: string; shortDescription?: string; description?: string; category?: string; tags?: string[]; coverImage?: string; galleryImages?: string[];
  startAt?: string; endAt?: string; timezone?: string; venueName?: string; address?: string; city?: string; state?: string; country?: string; postalCode?: string; latitude?: number | null; longitude?: number | null;
  organizerName?: string; organizerDescription?: string; organizerEmail?: string; organizerPhone?: string; organizerWebsite?: string;
  featured?: boolean; status?: "DRAFT" | "PUBLISHED";
  ticketTypes?: { name?: string; description?: string; price?: number; quantity?: number; maxPerOrder?: number; minPerOrder?: number; salesStart?: string; salesEnd?: string }[];
};

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const body = await request.json() as EventInput;
    const required = [body.title, body.slug, body.shortDescription, body.description, body.category, body.coverImage, body.startAt, body.endAt, body.venueName, body.address, body.city, body.country, body.organizerName, body.organizerEmail];
    if (required.some((value) => typeof value !== "string" || !value.trim())) return NextResponse.json({ error: "Complete the required event, venue, organizer, and image details." }, { status: 400 });
    const startAt = new Date(body.startAt!);
    const endAt = new Date(body.endAt!);
    if (Number.isNaN(startAt.valueOf()) || Number.isNaN(endAt.valueOf()) || endAt <= startAt) return NextResponse.json({ error: "Choose a valid schedule with an end after the start." }, { status: 400 });
    const ticketTypes = (body.ticketTypes ?? []).map((ticket) => ({ name: ticket.name?.trim() ?? "", description: ticket.description?.trim() || null, price: Number(ticket.price), totalQuantity: Number(ticket.quantity), availableQuantity: Number(ticket.quantity), maxPerOrder: Number(ticket.maxPerOrder ?? 8), minPerOrder: Number(ticket.minPerOrder ?? 1), salesStart: ticket.salesStart ? new Date(ticket.salesStart) : null, salesEnd: ticket.salesEnd ? new Date(ticket.salesEnd) : null })).filter((ticket) => ticket.name && Number.isFinite(ticket.price) && ticket.price >= 0 && Number.isInteger(ticket.totalQuantity) && ticket.totalQuantity > 0);
    if (ticketTypes.length === 0) return NextResponse.json({ error: "Add at least one ticket type with a valid price and quantity." }, { status: 400 });
    const slug = body.slug!.trim().toLowerCase();
    const existing = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "That event URL is already in use." }, { status: 409 });

    const organizerEmail = body.organizerEmail!.trim().toLowerCase();
    const event = await prisma.$transaction(async (transaction) => {
      const existingOrganizer = await transaction.organizer.findFirst({ where: { email: organizerEmail } });
      const organizer = existingOrganizer ? await transaction.organizer.update({ where: { id: existingOrganizer.id }, data: { name: body.organizerName!.trim(), description: body.organizerDescription?.trim() || null, phone: body.organizerPhone?.trim() || null, website: body.organizerWebsite?.trim() || null } }) : await transaction.organizer.create({ data: { name: body.organizerName!.trim(), email: organizerEmail, description: body.organizerDescription?.trim() || null, phone: body.organizerPhone?.trim() || null, website: body.organizerWebsite?.trim() || null } });
      return transaction.event.create({ data: { slug, title: body.title!.trim(), shortDescription: body.shortDescription!.trim(), description: body.description!.trim(), category: body.category!.trim(), tags: (body.tags ?? []).map((tag) => tag.trim()).filter(Boolean), coverImage: body.coverImage!.trim(), galleryImages: (body.galleryImages ?? []).map((image) => image.trim()).filter(Boolean), startAt, endAt, timezone: body.timezone?.trim() || "UTC", venueName: body.venueName!.trim(), address: body.address!.trim(), city: body.city!.trim(), state: body.state?.trim() || null, country: body.country!.trim(), postalCode: body.postalCode?.trim() || null, latitude: typeof body.latitude === "number" ? body.latitude : null, longitude: typeof body.longitude === "number" ? body.longitude : null, featured: Boolean(body.featured), status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT", organizerId: organizer.id, ticketTypes: { create: ticketTypes } }, select: { slug: true, status: true } });
    });
    revalidateTag("public-events", "max");
    revalidatePath("/");
    revalidatePath("/events");
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create the event right now." }, { status: 500 });
  }
}
