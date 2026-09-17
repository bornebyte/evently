import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const settings = await prisma.workspaceSetting.findMany();
  return NextResponse.json({ settings: Object.fromEntries(settings.map((setting) => [setting.key, setting.value])) });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const values = await request.json() as Record<string, string>;
    const entries = Object.entries(values).filter(([key, value]) => key.length > 0 && typeof value === "string");
    await prisma.$transaction(entries.map(([key, value]) => prisma.workspaceSetting.upsert({ where: { key }, update: { value }, create: { key, value } })));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save workspace settings." }, { status: 500 });
  }
}
