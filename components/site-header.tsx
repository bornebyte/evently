"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, Ticket, X } from "@/components/icons";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const text = dark ? "text-white" : "text-[#242725]";
  const muted = dark ? "text-white/70 hover:text-white" : "text-[#69716b] hover:text-[#242725]";

  return (
    <header className={`relative z-40 ${text}`}>
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
        <Link className="group flex items-center gap-2.5" href="/" aria-label="evently home">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f16d55] text-[#202321] shadow-[3px_3px_0_#202321] transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[4px_5px_0_#202321]">
            <span className="mb-0.5 text-[22px] font-bold leading-none">e</span>
          </span>
          <span className="text-[21px] font-semibold tracking-[-0.05em]">evently</span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-medium lg:flex">
          <Link className={`${muted} transition-colors`} href="/events">Discover</Link>
          <Link className={`${muted} transition-colors`} href="/#categories">Categories</Link>
          <Link className={`${muted} transition-colors`} href="/#how-it-works">How it works</Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link className={`flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium ${muted}`} href="/events">
            <Search size={16} />
            <span className="hidden xl:inline">Find an event</span>
          </Link>
          <Link className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium ${dark ? "border-white/20 hover:border-white/50" : "border-[#dfe2dc] hover:border-[#aeb5ad]"}`} href="/tickets">
            <Ticket size={16} />
            My tickets
          </Link>
        </div>

        <button aria-label={open ? "Close menu" : "Open menu"} className={`rounded-full p-2 sm:hidden ${dark ? "hover:bg-white/10" : "hover:bg-black/5"}`} onClick={() => setOpen(!open)} type="button">
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {open && (
        <div className={`absolute left-4 right-4 top-[68px] rounded-2xl border p-3 shadow-2xl sm:hidden ${dark ? "border-white/10 bg-[#242725]" : "border-[#e1e3dd] bg-white"}`}>
          <nav className="flex flex-col gap-1 text-sm">
            <Link className="rounded-xl px-4 py-3 hover:bg-black/5" href="/events" onClick={() => setOpen(false)}>Discover events</Link>
            <Link className="rounded-xl px-4 py-3 hover:bg-black/5" href="/#categories" onClick={() => setOpen(false)}>Categories</Link>
            <Link className="rounded-xl px-4 py-3 hover:bg-black/5" href="/tickets" onClick={() => setOpen(false)}>My tickets</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
