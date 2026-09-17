"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Download, Mail, MapPin, QrCode, Share2 } from "@/components/icons";
import { DataLoading, EmptyState } from "@/components/empty-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatINR } from "@/lib/format";
import type { PublicBooking } from "@/lib/contracts";

export default function TicketsPage() {
  const [active, setActive] = useState<"Upcoming" | "Past">("Upcoming");
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tickets", { cache: "no-store" }).then(async (response) => { const data = await response.json() as { bookings?: PublicBooking[]; error?: string }; if (!response.ok) throw new Error(data.error ?? "Unable to load your tickets."); if (!cancelled) setBookings(data.bookings ?? []); }).catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load your tickets."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const [now] = useState(() => Date.now());
  const upcoming = useMemo(() => bookings.filter((booking) => new Date(booking.event.startAt).getTime() >= now), [bookings, now]);
  const past = useMemo(() => bookings.filter((booking) => new Date(booking.event.startAt).getTime() < now), [bookings, now]);
  const visibleBookings = active === "Upcoming" ? upcoming : past;

  return <main className="min-h-screen bg-[#f7f7f4] text-[#242725]"><div className="border-b border-[#e8eae5]"><SiteHeader /></div><section className="bg-[#e8e3ef] px-5 pb-12 pt-14 lg:px-8 lg:pb-16"><div className="mx-auto max-w-[1280px]"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#746a7d]">Your plans, in one place</p><h1 className="mt-3 font-display text-[clamp(3.2rem,6vw,5.5rem)] leading-[0.88]">My tickets<span className="text-[#968aa0]">.</span></h1><p className="mt-5 max-w-[370px] text-[14px] leading-6 text-[#756d7e]">Your booking status, entry pass and confirmation documents all live here.</p></div></section><section className="mx-auto max-w-[1000px] px-5 py-10 lg:px-8 lg:py-14"><div className="flex gap-1 rounded-xl border border-[#e1e5df] bg-white p-1.5 sm:w-fit">{(["Upcoming", "Past"] as const).map((tab) => <button className={`rounded-lg px-5 py-2.5 text-[12px] font-semibold ${active === tab ? "bg-[#242725] text-white" : "text-[#7c857e] hover:text-[#242725]"}`} key={tab} onClick={() => setActive(tab)} type="button">{tab}<span className="ml-2 opacity-50">{tab === "Upcoming" ? upcoming.length : past.length}</span></button>)}</div>{loading ? <div className="mt-8"><DataLoading label="Finding your tickets" /></div> : error ? <div className="mt-8"><EmptyState title="Your tickets are taking a moment." description={error} /></div> : visibleBookings.length > 0 ? <div className="mt-8 space-y-5">{visibleBookings.map((booking) => <BookingCard booking={booking} key={booking.reference} />)}</div> : <div className="mt-8"><EmptyState title={active === "Upcoming" ? "Your next story starts here." : "No past tickets yet."} description={active === "Upcoming" ? "Browse upcoming events and your booking will appear in this space." : "The best stories are still ahead."} action={active === "Upcoming" ? <Link className="flex items-center gap-2 rounded-full bg-[#242725] px-5 py-3 text-[12px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725]" href="/events">Discover events <ArrowRight size={14} /></Link> : undefined} /></div>}</section><SiteFooter /></main>;
}

function BookingCard({ booking }: { booking: PublicBooking }) {
  const confirmed = booking.status === "CONFIRMED";
  const date = new Date(booking.event.startAt);
  return (
    <div className={`overflow-hidden rounded-[22px] border bg-white shadow-[0_10px_30px_rgba(36,39,37,0.05)] ${confirmed ? "border-[#c9ddc2]" : "border-[#ead8ae]"}`}>
      <div className="grid lg:grid-cols-[190px_1fr_190px]">
        <div className="relative min-h-[170px] bg-[#202321] p-5 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[22px] border-[#f16d55]/70" />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.15em] text-[#f16d55]">{date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</p>
          <p className="relative mt-1 font-display text-[74px] leading-[0.8]">{date.toLocaleDateString("en-IN", { day: "2-digit" })}</p>
          <p className="relative mt-4 text-[11px] text-white/55">{date.toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${confirmed ? "bg-[#e5f0e2] text-[#66825f]" : booking.status === "CANCELLED" ? "bg-[#f0f2ee] text-[#7b847d]" : "bg-[#fff2d6] text-[#ac7f35]"}`}>
              {confirmed ? "Confirmed" : booking.status === "CANCELLED" ? "Not approved" : "Payment under review"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a0a8a1]">{booking.event.category}</span>
          </div>
          <h2 className="mt-4 font-display text-[34px] leading-[0.92]">{booking.event.title}</h2>
          <div className="mt-5 grid gap-2 text-[12px] text-[#737d75] sm:grid-cols-2">
            <span className="flex items-center gap-2"><CalendarDays size={14} className="text-[#e15f49]" /> {date.toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
            <span className="flex items-center gap-2"><Clock3 size={14} className="text-[#e15f49]" /> {date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
            <span className="flex items-center gap-2 sm:col-span-2"><MapPin size={14} className="text-[#e15f49]" /> {booking.event.venueName}, {booking.event.city}</span>
          </div>
          <p className="mt-5 border-t border-[#edf0eb] pt-4 text-[11px] text-[#9aa39b]">{booking.quantity} × {booking.ticket} · <span className="font-semibold text-[#69746c]">{booking.reference}</span> · {formatINR(booking.total)}</p>
        </div>

        <div className="flex flex-col justify-between border-t border-[#edf0eb] bg-[#fafbf9] p-5 lg:border-l lg:border-t-0">
          {confirmed ? (
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a0a8a1]">Entry pass</p>
              <div className="mx-auto mt-4 flex h-[104px] w-[104px] items-center justify-center rounded-xl border border-[#dfe3dd] bg-white text-[#242725]"><QrCode size={38} /></div>
              <p className="mt-2 text-[9px] text-[#a0a8a1]">Open to scan</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff2d6] text-[#ac7f35]"><Clock3 size={19} /></span>
              <p className="mt-3 text-[11px] font-semibold">{booking.status === "CANCELLED" ? "Booking closed" : "Awaiting approval"}</p>
              <p className="mt-1 text-[10px] leading-4 text-[#9b8a69]">The event team will update this booking.</p>
            </div>
          )}
          {confirmed && <Link className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#242725] px-3 py-3 text-[11px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725]" href={`/tickets/${booking.reference}`}><QrCode size={14} /> Open ticket</Link>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3 text-[11px] text-[#8b948d]">
        <span>{confirmed ? "Payment verified" : "Payment submitted · Verification in progress"}</span>
        {confirmed && <div className="flex gap-4"><a className="flex items-center gap-1.5 hover:text-[#242725]" href={`/api/tickets/${booking.reference}/pdf?kind=ticket`}><Download size={13} /> Ticket PDF</a><a className="flex items-center gap-1.5 hover:text-[#242725]" href={`/api/tickets/${booking.reference}/pdf?kind=receipt`}><Download size={13} /> Receipt</a><button className="flex items-center gap-1.5 hover:text-[#242725]" onClick={() => navigator.share?.({ title: booking.event.title, url: `${window.location.origin}/tickets/${booking.reference}` })} type="button"><Share2 size={13} /> Share</button></div>}
      </div>

      {!confirmed && booking.status !== "CANCELLED" && <div className="mt-3 flex items-start gap-3 rounded-[22px] border border-[#ead8ae] bg-[#fff8e9] p-5 sm:p-6"><Mail className="mt-0.5 shrink-0 text-[#ac7f35]" size={18} /><div><p className="text-[12px] font-semibold">Your payment reference is with the event team.</p><p className="mt-1 text-[11px] leading-5 text-[#806f4e]">We’ll verify the payment and send your ticket link to {booking.attendeeEmail} after approval.</p></div></div>}
    </div>
  );
}
