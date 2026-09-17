import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const [pendingBookings, publishedEvents, newContactMessages] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  return NextResponse.json({ pendingBookings, publishedEvents, newContactMessages });
}
