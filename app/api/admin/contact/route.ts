import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ messages: messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString(), updatedAt: message.updatedAt.toISOString() })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

  try {
    const body = await request.json() as { id?: string; status?: ContactStatus };
    if (!body.id || !body.status || !["NEW", "IN_PROGRESS", "RESOLVED"].includes(body.status)) return NextResponse.json({ error: "Choose a valid message status." }, { status: 400 });
    const message = await prisma.contactMessage.update({ where: { id: body.id }, data: { status: body.status } });
    return NextResponse.json({ message: { ...message, createdAt: message.createdAt.toISOString(), updatedAt: message.updatedAt.toISOString() } });
  } catch {
    return NextResponse.json({ error: "That contact message could not be updated." }, { status: 404 });
  }
}
