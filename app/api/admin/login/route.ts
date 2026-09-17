import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || admin.password !== password) return NextResponse.json({ error: "That admin email or password is not correct." }, { status: 401 });

    const token = crypto.randomUUID();
    await prisma.adminSession.create({ data: { token, adminUserId: admin.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) } });
    const response = NextResponse.json({ ok: true, admin: { email: admin.email, name: admin.name, role: admin.role } });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now. Check the database connection." }, { status: 500 });
  }
}
