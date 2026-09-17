"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, CircleHelp, LayoutDashboard, LogOut, Mail, QrCode, ScanLine, Settings, Ticket, X } from "@/components/icons";

const primary = [["Overview", "/admin/dashboard", LayoutDashboard], ["Events", "/admin/events", CalendarDays], ["Bookings", "/admin/bookings", Ticket], ["Attendance", "/admin/attendance", ScanLine]] as const;
const managed = [["Analytics", "/admin/analytics", BarChart3], ["Payment QR", "/admin/payment-qr", QrCode], ["Contact", "/admin/contact", Mail], ["Settings", "/admin/settings", Settings]] as const;

function navClass(active: boolean) {
  return `flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-semibold ${active ? "bg-[#f7ded7] text-[#bc4f3d]" : "text-[#707a72] hover:bg-[#f7f8f6] hover:text-[#242725]"}`;
}

function Navigation({ pathname, pendingBookings, newContactMessages, onNavigate }: { pathname: string; pendingBookings: number; newContactMessages: number; onNavigate?: () => void }) {
  return <>
    <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a0a7a1]">Workspace</div>
    <nav className="space-y-1">{primary.map(([label, href, Icon]) => <Link className={navClass(label === "Events" ? pathname.startsWith("/admin/events") : pathname === href)} href={href} key={label} onClick={onNavigate}><Icon size={17} />{label}{label === "Bookings" && pendingBookings > 0 && <span className="ml-auto rounded-full bg-[#f16d55] px-2 py-0.5 text-[9px] font-bold text-[#242725]">{pendingBookings}</span>}</Link>)}</nav>
    <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a0a7a1]">Manage</div>
    <nav className="space-y-1">{managed.map(([label, href, Icon]) => <Link className={navClass(pathname === href)} href={href} key={label} onClick={onNavigate}><Icon size={17} />{label}{label === "Contact" && newContactMessages > 0 && <span className="ml-auto rounded-full bg-[#f16d55] px-2 py-0.5 text-[9px] font-bold text-[#242725]">{newContactMessages}</span>}</Link>)}</nav>
  </>;
}

function Brand({ close }: { close?: () => void }) {
  return <div className="flex items-center justify-between"><Link className="flex items-center gap-2.5 px-3" href="/" onClick={close}><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f16d55] text-[22px] font-bold leading-none text-[#202321]">e</span><span className="text-[20px] font-semibold tracking-[-0.05em]">evently</span></Link>{close && <button aria-label="Close navigation" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8a938c] hover:bg-[#f7f8f6] hover:text-[#242725]" onClick={close} type="button"><X size={18} /></button>}</div>;
}

function SupportCard() {
  return <div className="rounded-2xl bg-[#e8e3ef] p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#c2b4ce] text-[12px] font-bold text-[#5a4968]">?</div><p className="text-[12px] font-semibold">Need a hand?</p><p className="mt-1 text-[10px] leading-4 text-[#766d7d]">Our support team is here to help.</p><Link className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#5a4968]" href="mailto:shahshubham1888@gmail.com">Contact support <CircleHelp size={12} /></Link></div>;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState(0);
  const [newContactMessages, setNewContactMessages] = useState(0);

  useEffect(() => { fetch("/api/admin/summary", { cache: "no-store" }).then((response) => response.ok ? response.json() as Promise<{ pendingBookings: number; newContactMessages: number }> : Promise.reject()).then((result) => { setPendingBookings(result.pendingBookings); setNewContactMessages(result.newContactMessages); }).catch(() => undefined); }, []);

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); };
  const navigation = <Navigation newContactMessages={newContactMessages} onNavigate={onMobileClose} pathname={pathname} pendingBookings={pendingBookings} />;

  return <>
    <aside className="hidden w-[236px] shrink-0 flex-col border-r border-[#e2e5df] bg-white px-4 py-5 lg:flex"><Brand /><div className="mt-10">{navigation}</div><div className="mt-auto"><SupportCard /><button className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-semibold text-[#8a938c] hover:bg-[#f7f8f6] hover:text-[#242725]" onClick={logout} type="button"><LogOut size={16} /> Sign out</button></div></aside>
    {mobileOpen && <><button aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#242725]/35 lg:hidden" onClick={onMobileClose} type="button" /><aside className="fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col overflow-y-auto border-r border-[#e2e5df] bg-white px-4 py-5 shadow-[12px_0_30px_rgba(36,39,37,0.12)] lg:hidden"><Brand close={onMobileClose} /><div className="mt-10">{navigation}</div><div className="mt-auto pt-10"><SupportCard /><button className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-semibold text-[#8a938c] hover:bg-[#f7f8f6] hover:text-[#242725]" onClick={logout} type="button"><LogOut size={16} /> Sign out</button></div></aside></>}
  </>;
}
