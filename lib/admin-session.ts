import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "evently_admin_session";

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({ where: { token }, include: { adminUser: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  return session?.adminUser ?? null;
}
