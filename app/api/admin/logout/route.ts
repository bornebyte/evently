import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { token } });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
