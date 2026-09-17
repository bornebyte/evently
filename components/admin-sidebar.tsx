"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, CircleHelp, LayoutDashboard, LogOut, Mail, QrCode, ScanLine, Settings, Ticket } from "@/components/icons";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState(0);
  const [newContactMessages, setNewContactMessages] = useState(0);
  useEffect(() => { fetch("/api/admin/summary", { cache: "no-store" }).then((response) => response.ok ? response.json() as Promise<{ pendingBookings: number; newContactMessages: number }> : Promise.reject()).then((result) => { setPendingBookings(result.pendingBookings); setNewContactMessages(result.newContactMessages); }).catch(() => undefined); }, []);
  const primary = [["Overview", "/admin/dashboard", LayoutDashboard], ["Events", "/admin/events/new", CalendarDays], ["Bookings", "/admin/bookings", Ticket], ["Attendance", "/admin/attendance", ScanLine]] as const;
  const managed = [["Analytics", "/admin/analytics", BarChart3], ["Payment QR", "/admin/payment-qr", QrCode], ["Contact", "/admin/contact", Mail], ["Settings", "/admin/settings", Settings]] as const;

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); };

  return <aside className="hidden w-[236px] shrink-0 flex-col border-r border-[#e2e5df] bg-white px-4 py-5 lg:flex"><Link className="mb-10 flex items-center gap-2.5 px-3" href="/"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f16d55] text-[22px] font-bold leading-none text-[#202321]">e</span><span className="text-[20px] font-semibold tracking-[-0.05em]">evently</span></Link><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a0a7a1]">Workspace</div><nav className="space-y-1">{primary.map(([label, href, Icon]) => <Link className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-semibold ${pathname === href ? "bg-[#f7ded7] text-[#bc4f3d]" : "text-[#707a72] hover:bg-[#f7f8f6] hover:text-[#242725]"}`} href={href} key={label}><Icon size={17} />{label}{label === "Bookings" && pendingBookings > 0 && <span className="ml-auto rounded-full bg-[#f16d55] px-2 py-0.5 text-[9px] font-bold text-[#242725]">{pendingBookings}</span>}</Link>)}</nav><div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a0a7a1]">Manage</div><nav className="space-y-1">{managed.map(([label, href, Icon]) => <Link className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-semibold ${pathname === href ? "bg-[#f7ded7] text-[#bc4f3d]" : "text-[#707a72] hover:bg-[#f7f8f6] hover:text-[#242725]"}`} href={href} key={label}><Icon size={17} />{label}{label === "Contact" && newContactMessages > 0 && <span className="ml-auto rounded-full bg-[#f16d55] px-2 py-0.5 text-[9px] font-bold text-[#242725]">{newContactMessages}</span>}</Link>)}</nav><div className="mt-auto rounded-2xl bg-[#e8e3ef] p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#c2b4ce] text-[12px] font-bold text-[#5a4968]">?</div><p className="text-[12px] font-semibold">Need a hand?</p><p className="mt-1 text-[10px] leading-4 text-[#766d7d]">Our support team is here to help.</p><Link className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#5a4968]" href="mailto:support@evently.co">Contact support <CircleHelp size={12} /></Link></div><button className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-semibold text-[#8a938c] hover:bg-[#f7f8f6] hover:text-[#242725]" onClick={logout} type="button"><LogOut size={16} /> Sign out</button></aside>;
}
