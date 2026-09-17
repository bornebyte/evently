import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
    return NextResponse.json({ authenticated: true, admin: { email: session.adminUser.email, name: session.adminUser.name, role: session.adminUser.role } });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
