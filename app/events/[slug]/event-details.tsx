"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Clock3, CreditCard, Heart, MapPin, Mail, Minus, Plus, QrCode, Share2, ShieldCheck } from "@/components/icons";
import { EmptyState, DataLoading } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatINR } from "@/lib/format";
import type { PublicEvent } from "@/lib/contracts";

type BuyerDetails = { fullName: string; email: string; phone: string; paymentReference: string };

export default function EventDetails({ event, related }: { event: PublicEvent; related: PublicEvent[] }) {
  const [tierIndex, setTierIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [buyer, setBuyer] = useState<BuyerDetails>({ fullName: "", email: "", phone: "", paymentReference: "" });
  const tier = event.ticketTiers[tierIndex];
  const total = useMemo(() => (tier?.price ?? 0) * quantity, [quantity, tier?.price]);

  const submitBooking = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!tier || !buyer.fullName.trim() || !buyer.email.trim() || !buyer.phone.trim() || !buyer.paymentReference.trim()) {
      setError("Please complete every field so the payment can be verified.");
      return;
    }
    setError("");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventSlug: event.slug, ticketName: tier.name, quantity, ...buyer }) });
      const result = await response.json() as { error?: string; booking?: { reference: string; status: string; total: number } };
      if (!response.ok || !result.booking) {
        setError(result.error ?? "We could not submit this booking. Please try again.");
        return;
      }
      setBookingReference(result.booking.reference);
      setSubmitted(true);
      setCheckoutOpen(false);
    } catch {
      setError("We could not reach the booking service. Please check your connection and try again.");
    }
  };

  const destination = event.latitude !== null && event.longitude !== null ? `${event.latitude},${event.longitude}` : `${event.address}, ${event.city}, ${event.country}`;
  const mapHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#242725]"><div className="border-b border-[#e8eae5]"><SiteHeader /></div><div className="mx-auto max-w-[1280px] px-5 pb-20 pt-7 lg:px-8 lg:pt-9">
      <div className="mb-7 flex items-center gap-3 text-[11px] font-medium text-[#8a938c]"><Link className="inline-flex items-center gap-1.5 hover:text-[#242725]" href="/events"><ArrowLeft size={14} /> All events</Link><span>/</span><span>{event.category}</span><span>/</span><span className="truncate text-[#242725]">{event.title}</span></div>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-14"><div className="reveal"><div className="image-zoom relative aspect-[1.2/0.82] overflow-hidden rounded-[26px] bg-[#202321] shadow-[7px_8px_0_#e5e1db]"><Image alt={event.title} className="object-cover" fill priority sizes="(max-width: 1024px) 92vw, 60vw" src={event.image} /><div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" /><div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"><span className="h-1.5 w-1.5 rounded-full bg-[#f16d55]" /> {event.category}</div><div className="absolute bottom-5 left-5 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-[#f16d55] text-[#242725]"><span className="text-[10px] font-bold tracking-[0.14em]">{event.month}</span><span className="font-display text-[30px] leading-7">{event.day}</span></div></div>
        <div className="mt-8 flex flex-wrap items-start justify-between gap-5"><div><p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#e15f49]">{event.tags[0] ?? event.category}</p><h1 className="font-display max-w-[650px] text-[clamp(3rem,5.5vw,5.4rem)] leading-[0.88]">{event.title}</h1></div><div className="flex gap-2"><button aria-label={saved ? "Unsave event" : "Save event"} className={`flex h-11 w-11 items-center justify-center rounded-full border ${saved ? "border-[#f16d55] bg-[#f16d55]" : "border-[#dfe3dd] bg-white hover:border-[#f16d55]"}`} onClick={() => setSaved(!saved)} type="button"><Heart size={17} /></button><button aria-label="Share event" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe3dd] bg-white hover:border-[#f16d55]" onClick={() => navigator.clipboard?.writeText(window.location.href)} type="button"><Share2 size={17} /></button></div></div>
        <p className="mt-5 max-w-[620px] text-[16px] leading-7 text-[#6f7871]">{event.description}</p>
        <div className="mt-7 grid max-w-[620px] gap-3 sm:grid-cols-2"><DetailCard icon={<CalendarDays size={18} />} title={event.dateLong} detail={event.time} /><DetailCard icon={<Clock3 size={18} />} title={event.time} detail={event.timezone} /><DetailCard icon={<MapPin size={18} />} title={event.venueName} detail={`${event.address}, ${event.city}`} wide /></div>
        {event.galleryImages.length > 0 && <div className="mt-7 grid gap-3 sm:grid-cols-2">{event.galleryImages.map((image, index) => <div className="relative aspect-[1.35/1] overflow-hidden rounded-2xl bg-[#e8e3ef]" key={`${image}-${index}`}><img alt={`${event.title} gallery ${index + 1}`} className="h-full w-full object-cover" loading="lazy" src={image} /></div>)}</div>}
      </div>
      <aside className="reveal reveal-delay-2 lg:sticky lg:top-6">{submitted ? <PendingConfirmation event={event} reference={bookingReference} tier={tier?.name ?? ""} quantity={quantity} total={total} /> : checkoutOpen ? <PaymentForm buyer={buyer} error={error} eventSlug={event.slug} onBack={() => { setCheckoutOpen(false); setError(""); }} onChange={setBuyer} onSubmit={submitBooking} total={total} /> : <TicketSelector event={event} quantity={quantity} setQuantity={setQuantity} setTierIndex={setTierIndex} tier={tier} tierIndex={tierIndex} total={total} onContinue={() => setCheckoutOpen(true)} />}</aside></div>
      <div className="mt-20 grid gap-12 border-t border-[#e4e6e0] pt-14 lg:grid-cols-[1fr_0.72fr]"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#e15f49]">The details</p><h2 className="font-display text-[clamp(2.5rem,4vw,3.7rem)] leading-[0.92]">Come for the<br /><span className="text-[#9aa29b]">whole story.</span></h2><div className="mt-9 divide-y divide-[#e4e6e0]"><DetailRow label="Description">{event.description}</DetailRow>{event.tags.length > 0 && <DetailRow label="Tags">{event.tags.join(" · ")}</DetailRow>}</div></div><div id="venue"><div className="rounded-[22px] bg-[#e8e3ef] p-6 sm:p-7"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#72647c]">Your destination</p><h3 className="mt-2 text-[23px] font-semibold tracking-[-0.05em]">{event.venueName}</h3></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60"><MapPin size={17} /></span></div>{event.mapEmbedUrl ? <div className="mt-8 overflow-hidden rounded-[16px] border border-[#c9c4d1] bg-[#ddd8e4]"><iframe allowFullScreen className="h-64 w-full border-0 sm:h-72" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={event.mapEmbedUrl} title={`Map showing ${event.venueName}`} /></div> : <div className="mt-8 flex min-h-44 items-center justify-center rounded-[16px] border border-[#c9c4d1] bg-[#ddd8e4] text-center"><MapPin className="text-[#d95742]" size={32} /><p className="sr-only">Event location</p></div>}<p className="mt-4 text-[12px] leading-5 text-[#6f6679]">{event.address}<br />{[event.city, event.state, event.country, event.postalCode].filter(Boolean).join(", ")}</p><a className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-[#242725] hover:text-[#e15f49]" href={mapHref} rel="noreferrer" target="_blank">Get directions from your location <ArrowUpRight size={14} /></a></div><div className="mt-4 rounded-[22px] border border-[#e4e6e0] bg-white p-6"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#919a93]">Hosted by</p><div className="mt-4 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#202321] font-display text-xl text-[#f16d55]">{event.organizer.name.slice(0, 1).toUpperCase()}</span><div><p className="text-[13px] font-semibold">{event.organizer.name}</p>{event.organizer.description && <p className="mt-1 text-[11px] text-[#8b948d]">{event.organizer.description}</p>}<a className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#e15f49]" href={`mailto:${event.organizer.email}`}><Mail size={13} /> Contact organizer</a></div></div></div></div></div>
    </div>{related.length > 0 && <section className="border-t border-[#e4e6e0] bg-white"><div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#e15f49]">Keep exploring</p><h2 className="font-display text-[clamp(2.4rem,4vw,3.7rem)] leading-[0.92]">More like this.</h2></div><Link className="hidden items-center gap-2 text-[12px] font-semibold hover:text-[#e15f49] sm:flex" href="/events">See all events <ArrowRight size={15} /></Link></div><div className="mt-9 grid gap-5 md:grid-cols-2">{related.map((item) => <EventCard event={item} key={item.slug} />)}</div></div></section>}<SiteFooter /></main>
  );
}

function DetailCard({ icon, title, detail, wide = false }: { icon: React.ReactNode; title: string; detail: string; wide?: boolean }) { return <div className={`flex gap-3 rounded-2xl border border-[#e4e6e0] bg-white p-4 ${wide ? "sm:col-span-2" : ""}`}><span className="mt-0.5 shrink-0 text-[#e15f49]">{icon}</span><div><p className="text-[12px] font-semibold">{title}</p><p className="mt-1 text-[11px] text-[#879088]">{detail}</p></div></div>; }

function TicketSelector({ event, tier, tierIndex, setTierIndex, quantity, setQuantity, total, onContinue }: { event: PublicEvent; tier: PublicEvent["ticketTiers"][number] | undefined; tierIndex: number; setTierIndex: (value: number) => void; quantity: number; setQuantity: (value: number) => void; total: number; onContinue: () => void }) {
  if (!tier || event.ticketTiers.length === 0) return <EmptyState title="Tickets are on the way." description="This event has no published ticket types yet. Check back when the organizer opens sales." />;
  const remaining = Math.max(0, tier.availableQuantity);
  const maxQuantity = Math.min(8, tier.maxPerOrder, remaining);
  return (
    <div className="rounded-[24px] border border-[#e1e4df] bg-white p-5 shadow-[0_15px_35px_rgba(36,39,37,0.08)] sm:p-6">
      <div className="flex items-center justify-between border-b border-[#edf0eb] pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#879088]">Tickets from</p>
          <p className="mt-1 text-[28px] font-semibold tracking-[-0.06em]">{event.price === null ? "—" : formatINR(event.price)}</p>
        </div>
        <span className="rounded-full bg-[#f7ded7] px-3 py-2 text-[11px] font-semibold text-[#b84e3c]">{remaining} spots left</span>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.13em] text-[#879088]" htmlFor="ticket-tier">Choose a ticket</label>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-4 py-3.5 pr-10 text-[13px] font-semibold outline-none focus:border-[#f16d55]"
            id="ticket-tier"
            onChange={(e) => {
              setTierIndex(Number(e.target.value));
              setQuantity(1);
            }}
            value={tierIndex}
          >
            {event.ticketTiers.map((item, index) => (
              <option key={item.id} value={index}>{item.name} · {formatINR(item.price)}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" size={16} />
        </div>
        <p className="mt-2 text-[11px] text-[#89928b]">{tier.description ?? "Ticket access for this event"} · {remaining} remaining</p>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f7f7f4] px-4 py-3">
        <span className="text-[12px] font-semibold">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            aria-label="Decrease quantity"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d9ded8] bg-white hover:border-[#f16d55] disabled:opacity-40"
            disabled={quantity === 1}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            type="button"
          >
            <Minus size={13} />
          </button>
          <span className="w-4 text-center text-[13px] font-semibold">{quantity}</span>
          <button
            aria-label="Increase quantity"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d9ded8] bg-white hover:border-[#f16d55] disabled:opacity-40"
            disabled={quantity >= maxQuantity}
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            type="button"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-5 text-[13px]">
        <span className="text-[#7b847d]">Total</span>
        <span className="text-[19px] font-semibold">{formatINR(total)}</span>
      </div>

      <button
        className="pulse-soft mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f16d55] px-5 py-4 text-[13px] font-bold text-[#242725] hover:bg-[#242725] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={remaining === 0}
        onClick={onContinue}
        type="button"
      >
        <CreditCard size={17} /> {remaining === 0 ? "Sold out" : "Continue to payment"}
      </button>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#8c958e]">
        <ShieldCheck size={13} /> Manual payment verification
      </div>
    </div>
  );
}

function PaymentForm({ buyer, onChange, onSubmit, onBack, total, error, eventSlug }: { buyer: BuyerDetails; onChange: (buyer: BuyerDetails) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onBack: () => void; total: number; error: string; eventSlug: string }) {
  const [paymentQr, setPaymentQr] = useState<{ label: string; imageUrl: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  useEffect(() => { let cancelled = false; fetch(`/api/payment-qr/${encodeURIComponent(eventSlug)}`, { cache: "no-store" }).then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<{ qr: { label: string; imageUrl: string } | null }>; }).then((result) => { if (!cancelled) setPaymentQr(result.qr); }).catch(() => { if (!cancelled) setPaymentQr(null); }).finally(() => { if (!cancelled) setQrLoading(false); }); return () => { cancelled = true; }; }, [eventSlug]);
  if (!qrLoading && !paymentQr) return <EmptyState title="Payment details are resting." description="The organizer has not connected an active payment QR for this event yet. Please try again later." action={<button className="rounded-full bg-[#242725] px-5 py-3 text-[12px] font-semibold text-white" onClick={onBack} type="button">Back to tickets</button>} />;
  return <div className="rounded-[24px] border border-[#e1e4df] bg-white p-5 shadow-[0_15px_35px_rgba(36,39,37,0.08)] sm:p-6"><button className="mb-5 flex items-center gap-1 text-[11px] font-semibold text-[#7a847c] hover:text-[#242725]" onClick={onBack} type="button"><ArrowLeft size={13} /> Back to tickets</button><div className="border-b border-[#edf0eb] pb-5"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e15f49]">Step 2 of 2</p><h2 className="mt-2 text-[23px] font-semibold tracking-[-0.05em]">Complete your booking</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e3ef] text-[#6f5d7d]"><QrCode size={19} /></span></div><p className="mt-3 text-[12px] leading-5 text-[#7b847d]">Scan the payment QR, then share the reference so the event team can verify it.</p></div><div className="mt-5 rounded-2xl border border-[#e6e9e4] bg-[#f7f7f4] p-4 sm:p-5"><div className="flex flex-col items-center gap-4 sm:flex-row"><div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-2xl border border-[#e1e5df] bg-white p-3 shadow-[0_5px_16px_rgba(36,39,37,0.06)]">{qrLoading ? <DataLoading label="Loading payment QR" /> : <img alt={`UPI payment QR for ${paymentQr?.label ?? "payment"}`} className="block h-full w-full rounded-lg object-contain" decoding="async" src={paymentQr!.imageUrl} />}</div><div className="min-w-0 text-center sm:text-left"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#e15f49]">Scan to pay</p><p className="mt-1 text-[15px] font-semibold">{paymentQr?.label}</p><p className="mt-2 text-[11px] leading-4 text-[#879088]">Open your preferred payment app and scan this code.</p><p className="mt-3 text-[11px] text-[#879088]">Amount due: <span className="font-semibold text-[#242725]">{formatINR(total)}</span></p></div></div></div><form className="mt-5 space-y-3" onSubmit={onSubmit}><InputField label="Full name" placeholder="Your full name" type="text" value={buyer.fullName} onChange={(value) => onChange({ ...buyer, fullName: value })} /><div className="grid gap-3 sm:grid-cols-2"><InputField label="Email address" placeholder="you@example.com" type="email" value={buyer.email} onChange={(value) => onChange({ ...buyer, email: value })} /><InputField label="Mobile number" placeholder="Your mobile number" type="tel" value={buyer.phone} onChange={(value) => onChange({ ...buyer, phone: value })} /></div><InputField label="Payment reference / UTR" placeholder="Reference from your payment" type="text" value={buyer.paymentReference} onChange={(value) => onChange({ ...buyer, paymentReference: value })} />{error && <p className="rounded-lg bg-[#fbe5e0] px-3 py-2 text-[11px] font-medium text-[#bb503e]">{error}</p>}<button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#242725] px-5 py-4 text-[13px] font-bold text-white hover:bg-[#f16d55] hover:text-[#242725]" type="submit">Submit payment for review <ArrowUpRight size={15} /></button></form><p className="mt-4 text-center text-[10px] leading-4 text-[#929b94]">By submitting, you agree that your details may be used to verify this booking and send your ticket.</p></div>;
}

function InputField({ label, placeholder, type, value, onChange }: { label: string; placeholder: string; type: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#879088]">{label}</span><input className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3 text-[12px] outline-none placeholder:text-[#a5ada6] focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required type={type} value={value} /></label>; }

function PendingConfirmation({ event, reference, tier, quantity, total }: { event: PublicEvent; reference: string; tier: string; quantity: number; total: number }) { return <div className="rounded-[24px] border border-[#ead8ae] bg-[#fff8e9] p-6 shadow-[0_15px_35px_rgba(36,39,37,0.08)]"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0cb75] text-[#6c5728]"><Clock3 size={24} /></div><p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a0782e]">Payment submitted</p><h2 className="mt-2 font-display text-[38px] leading-[0.9]">You’re almost in.</h2><p className="mt-4 text-[13px] leading-5 text-[#796d55]">The event team will verify your payment and release your ticket after approval.</p><div className="mt-6 rounded-2xl border border-[#ead8ae] bg-white/70 p-4"><div className="flex items-center justify-between text-[11px] text-[#8d7b58]"><span>Booking reference</span><span className="font-mono font-semibold text-[#242725]">{reference}</span></div><div className="mt-3 flex items-center justify-between border-t border-[#ead8ae] pt-3 text-[12px]"><span>{quantity} × {tier}</span><span className="font-semibold">{formatINR(total)}</span></div></div><div className="mt-5 flex items-start gap-2 text-[11px] leading-4 text-[#806f4e]"><Mail className="mt-0.5 shrink-0" size={14} /> Your booking is stored in the database and available from My Tickets on this device.</div><Link className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#242725] px-5 py-3.5 text-[13px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725]" href="/tickets">Track my booking <ArrowRight size={15} /></Link><p className="mt-4 text-center text-[10px] text-[#9b8a69]">{event.title}</p></div>; }

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-3 py-5 sm:grid-cols-[145px_1fr]"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#919a93]">{label}</p><p className="text-[13px] leading-6 text-[#6e776f]">{children}</p></div>; }
