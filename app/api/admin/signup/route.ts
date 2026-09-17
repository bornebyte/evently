import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const currentAdmin = await requireAdmin();
    if (!currentAdmin) return NextResponse.json({ error: "Only a signed-in admin can create another admin account." }, { status: 401 });
    const body = await request.json() as { name?: string; email?: string; password?: string };
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!name || !email || password.length < 8) return NextResponse.json({ error: "Add a name, work email, and password with at least 8 characters." }, { status: 400 });
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "An admin account already exists for this email." }, { status: 409 });
    const admin = await prisma.adminUser.create({ data: { name, email, password, role: "ADMIN" } });
    return NextResponse.json({ ok: true, admin: { name: admin.name, email: admin.email, role: admin.role } });
  } catch {
    return NextResponse.json({ error: "Unable to create the admin account right now." }, { status: 500 });
  }
}
