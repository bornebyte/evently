"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, Bell, RefreshCw } from "@/components/icons";
import { AdminSidebar } from "@/components/admin-sidebar";

export function AdminShell({ eyebrow, title, description, action, children }: { eyebrow: string; title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  const [admin, setAdmin] = useState<{ name: string; initials: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => { fetch("/api/admin/session", { cache: "no-store" }).then((response) => response.ok ? response.json() as Promise<{ admin: { name: string } }> : Promise.reject()).then((result) => setAdmin({ name: result.admin.name, initials: result.admin.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() })).catch(() => undefined); }, []);
  const refresh = () => { setRefreshing(true); window.location.reload(); };
  return <main className="flex min-h-screen bg-[#f5f6f3] text-[#242725]"><AdminSidebar /><div className="min-w-0 flex-1"><header className="flex h-[72px] items-center justify-between border-b border-[#e2e5df] bg-white px-5 sm:px-8"><div className="lg:hidden"><Link className="flex items-center gap-2" href="/admin/dashboard"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f16d55] text-[19px] font-bold text-[#202321]">e</span><span className="font-semibold tracking-[-0.05em]">evently</span></Link></div><p className="hidden text-[11px] text-[#8d968f] lg:block">Evently admin workspace</p><div className="flex items-center gap-3"><button aria-label="Refresh page" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e7e2] bg-white text-[#727c74] hover:border-[#f16d55] disabled:cursor-wait disabled:opacity-60" disabled={refreshing} onClick={refresh} title="Refresh page" type="button"><RefreshCw className={refreshing ? "animate-spin" : ""} size={16} /></button><button aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e7e2] bg-white text-[#727c74] hover:border-[#f16d55]" type="button"><Bell size={16} /></button><span className="hidden h-7 w-px bg-[#e8eae5] sm:block" />{admin ? <span className="flex items-center gap-2 rounded-full border border-[#e4e7e2] bg-white py-1.5 pl-1.5 pr-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dfe8d9] text-[10px] font-bold text-[#5d735a]">{admin.initials}</span><span className="hidden text-[11px] font-semibold sm:block">{admin.name}</span></span> : <span className="h-8 w-8 animate-pulse rounded-full bg-[#eef0ec]" />}</div></header><div className="mx-auto max-w-[1400px] p-5 sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e15f49]">{eyebrow}</p><h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.065em]">{title}</h1>{description && <p className="mt-2 max-w-[600px] text-[13px] leading-5 text-[#7b847d]">{description}</p>}</div>{action && <div className="flex shrink-0 items-center gap-2">{action}</div>}</div><div className="mt-8">{children}</div></div></div></main>;
}

export function AdminActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="flex items-center gap-2 rounded-xl bg-[#242725] px-4 py-3 text-[12px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725]" href={href}>{children}<ArrowUpRight size={14} /></Link>;
}
