"use client";
/* eslint-disable @next/next/no-img-element */

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { AdminActionLink, AdminShell } from "@/components/admin-shell";
import { ArrowUpRight, CheckCircle2, Copy, CreditCard, QrCode, Save, ShieldCheck, Plus } from "@/components/icons";
import { EmptyState } from "@/components/empty-state";

type QrRecord = { id: string; label: string; payload: string; imageUrl: string | null; isActive: boolean };
type EventQr = { slug: string; title: string; qrs: QrRecord[] };

function emptyForm() {
  return { label: "", payload: "", imageUrl: "" };
}

export default function PaymentQrPage() {
  const [events, setEvents] = useState<EventQr[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [editingQrId, setEditingQrId] = useState("");
  const [label, setLabel] = useState("");
  const [payload, setPayload] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activateNewQr, setActivateNewQr] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [rotatingQrId, setRotatingQrId] = useState("");
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/payment-qr")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const result = await response.json() as { events: EventQr[] };
        if (cancelled) return;
        setEvents(result.events);
        const firstEvent = result.events[0];
        if (firstEvent) {
          setSelectedSlug(firstEvent.slug);
          const firstQr = firstEvent.qrs.find((qr) => qr.isActive) ?? firstEvent.qrs[0];
          if (firstQr) selectQr(firstQr);
          else {
            setEditingQrId("");
            setLabel("");
            setPayload("");
            setImageUrl("");
            setActivateNewQr(true);
          }
        }
      })
      .catch(() => { if (!cancelled) setNotice("Unable to load payment QR settings."); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (imageUrl || !payload.trim()) return () => { cancelled = true; };
    QRCode.toDataURL(payload.trim(), { errorCorrectionLevel: "M", margin: 2, width: 512 })
      .then((url) => { if (!cancelled) setGeneratedPreviewUrl(url); })
      .catch(() => { if (!cancelled) setGeneratedPreviewUrl(""); });
    return () => { cancelled = true; };
  }, [imageUrl, payload]);

  const selectedEvent = events.find((event) => event.slug === selectedSlug);
  const previewImageUrl = imageUrl || (payload.trim() ? generatedPreviewUrl : "");

  function selectQr(qr: QrRecord) {
    setEditingQrId(qr.id);
    setLabel(qr.label);
    setPayload(qr.payload);
    setImageUrl(qr.imageUrl ?? "");
    setActivateNewQr(false);
  }

  function startNewQr() {
    const form = emptyForm();
    setEditingQrId("");
    setLabel("");
    setPayload(form.payload);
    setImageUrl(form.imageUrl);
    setActivateNewQr(selectedEvent?.qrs.length === 0);
    setNotice("");
  }

  function selectEvent(slug: string) {
    setSelectedSlug(slug);
    const event = events.find((item) => item.slug === slug);
    const qr = event?.qrs.find((item) => item.isActive) ?? event?.qrs[0];
    if (qr) selectQr(qr);
    else {
      setEditingQrId("");
      setLabel("");
      setPayload("");
      setImageUrl("");
      setActivateNewQr(true);
    }
  }

  async function save() {
    if (!selectedSlug || !label.trim() || !payload.trim()) {
      setNotice("Provide a label and UPI payload before saving.");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      const editing = Boolean(editingQrId);
      const response = await fetch("/api/admin/payment-qr", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing
          ? { eventSlug: selectedSlug, qrId: editingQrId, action: "update", label, payload, imageUrl }
          : { eventSlug: selectedSlug, label, payload, imageUrl, isActive: activateNewQr }),
      });
      const result = await response.json() as { error?: string; qr?: QrRecord };
      if (!response.ok || !result.qr) throw new Error(result.error ?? "Unable to save payment QR.");

      setEvents((current) => current.map((event) => {
        if (event.slug !== selectedSlug) return event;
        if (!editing) {
          const qrs = result.qr!.isActive ? event.qrs.map((qr) => ({ ...qr, isActive: false })) : event.qrs;
          return { ...event, qrs: [...qrs, result.qr!] };
        }
        return { ...event, qrs: event.qrs.map((qr) => qr.id === result.qr!.id ? result.qr! : qr) };
      }));
      setEditingQrId(result.qr.id);
      setActivateNewQr(false);
      setNotice(editing ? "Payment QR updated." : "Payment QR added. Use the button beside any saved QR to rotate checkout to it.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save payment QR.");
    } finally {
      setSaving(false);
    }
  }

  async function activateQr(qrId: string) {
    setRotatingQrId(qrId);
    setNotice("");
    try {
      const response = await fetch("/api/admin/payment-qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", eventSlug: selectedSlug, qrId }),
      });
      const result = await response.json() as { error?: string; qr?: QrRecord };
      if (!response.ok || !result.qr) throw new Error(result.error ?? "Unable to activate payment QR.");
      setEvents((current) => current.map((event) => event.slug === selectedSlug ? { ...event, qrs: event.qrs.map((qr) => ({ ...qr, isActive: qr.id === qrId })) } : event));
      selectQr(result.qr);
      setNotice("Payment QR rotated. New checkout sessions will use it immediately, and open checkouts update within a second.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to activate payment QR.");
    } finally {
      setRotatingQrId("");
    }
  }

  if (events.length === 0) return <AdminShell eyebrow="Payments" title="Make payment simple and clear." description="Connect payment destinations to events that exist in your workspace." action={<AdminActionLink href="/admin/events/new">Create an event <ArrowUpRight size={14} /></AdminActionLink>}><EmptyState title="Payment has no destination yet." description="Create and publish an event first. Its payment QR settings will appear here." /></AdminShell>;

  return <AdminShell eyebrow="Payments" title="Make payment simple and clear." description="Save multiple UPI QRs per event and switch the active payment destination whenever you need." action={<AdminActionLink href="/admin/bookings">Review bookings <ArrowUpRight size={14} /></AdminActionLink>}><div className="grid gap-5 xl:grid-cols-[1fr_380px]"><section className="rounded-[20px] border border-[#e1e5df] bg-white p-5 sm:p-7"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7ded7] text-[#bf5542]"><CreditCard size={19} /></span><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#e15f49]">Payment destinations</p><h2 className="mt-1 text-[21px] font-semibold tracking-[-0.05em]">Manage event QR codes</h2><p className="mt-2 text-[12px] leading-5 text-[#7b847d]">The active QR is shown at checkout. Keep backup payment destinations saved and rotate between them with one click.</p></div></div><div className="mt-7 space-y-5"><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">Event</span><select className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3.5 text-[12px] font-semibold outline-none focus:border-[#f16d55]" onChange={(event) => selectEvent(event.target.value)} value={selectedSlug}>{events.map((event) => <option key={event.slug} value={event.slug}>{event.title}</option>)}</select></label><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-semibold text-[#69746c]">{editingQrId ? "Edit saved QR" : "Add a new QR"}</p>{editingQrId && <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe3dd] px-3 py-2 text-[10px] font-semibold text-[#69746c] hover:border-[#f16d55]" onClick={startNewQr} type="button"><Plus size={13} /> Add another QR</button>}</div><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">Display label</span><input className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3.5 text-[12px] outline-none focus:border-[#f16d55]" onChange={(event) => setLabel(event.target.value)} placeholder="Payment destination" value={label} /></label><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">UPI QR payload</span><textarea className="min-h-24 w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3 text-[12px] outline-none focus:border-[#f16d55]" onChange={(event) => setPayload(event.target.value)} placeholder="Paste your UPI payment payload" value={payload} /><span className="mt-1 block text-[10px] text-[#929b94]">Checkout creates a real QR from this UPI URI automatically.</span></label><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">Hosted QR image URL <span className="font-normal text-[#a0a8a1]">(optional)</span></span><input className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3.5 text-[12px] outline-none focus:border-[#f16d55]" onChange={(event) => setImageUrl(event.target.value)} placeholder="Optional image URL" value={imageUrl} /><span className="mt-1 block text-[10px] text-[#929b94]">If provided, checkout uses this image instead of generating one.</span></label>{!editingQrId && selectedEvent && selectedEvent.qrs.length > 0 && <label className="flex items-center justify-between rounded-xl border border-[#e1e5df] bg-[#fafbf9] p-4"><span><span className="block text-[12px] font-semibold">Make active immediately</span><span className="mt-1 block text-[10px] text-[#89938b]">This will switch checkout to the new QR as soon as it is saved.</span></span><input checked={activateNewQr} className="h-4 w-4 accent-[#f16d55]" onChange={(event) => setActivateNewQr(event.target.checked)} type="checkbox" /></label>}</div>{notice && <p className="mt-5 rounded-xl bg-[#e7f0e3] px-4 py-3 text-[11px] font-semibold text-[#5f7659]">{notice}</p>}<button className="mt-6 flex items-center gap-2 rounded-xl bg-[#242725] px-5 py-3.5 text-[12px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725] disabled:opacity-50" disabled={saving || !selectedSlug} onClick={() => void save()} type="button"><Save size={15} /> {saving ? "Saving…" : editingQrId ? "Save QR changes" : "Add payment QR"}</button><div className="mt-8 border-t border-[#edf0eb] pt-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#929b94]">Saved QR codes</p><p className="mt-1 text-[10px] text-[#89938b]">Only the active QR appears at checkout.</p></div>{selectedEvent && <span className="rounded-full bg-[#f7f7f4] px-2.5 py-1 text-[10px] font-semibold text-[#89938b]">{selectedEvent.qrs.length} saved</span>}</div><div className="mt-4 space-y-2">{selectedEvent?.qrs.map((qr) => <div className={`flex items-center gap-3 rounded-xl border p-3 ${qr.isActive ? "border-[#c9ddc2] bg-[#f4f8f2]" : "border-[#e5e8e3] bg-[#fafbf9]"}`} key={qr.id}><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e1e5df] bg-white">{qr.imageUrl ? <img alt="" className="h-full w-full object-contain" src={qr.imageUrl} /> : <QrCode className="text-[#69746c]" size={20} />}</div><button className="min-w-0 flex-1 text-left" onClick={() => selectQr(qr)} type="button"><p className="truncate text-[12px] font-semibold">{qr.label}</p><p className="mt-1 text-[10px] text-[#89938b]">{qr.isActive ? "Active at checkout" : "Saved backup"}</p></button>{qr.isActive ? <span className="shrink-0 rounded-full bg-[#dfe8d9] px-2 py-1 text-[9px] font-bold text-[#5f7659]">Active</span> : <button className="shrink-0 rounded-lg bg-[#f16d55] px-2.5 py-2 text-[10px] font-bold text-[#242725] hover:bg-[#242725] hover:text-white disabled:opacity-50" disabled={rotatingQrId !== ""} onClick={() => void activateQr(qr.id)} type="button">{rotatingQrId === qr.id ? "Switching…" : "Use this QR"}</button>}</div>)}</div></div></section><section className="rounded-[20px] border border-[#e1e5df] bg-[#202321] p-5 text-white sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Checkout preview</p><div className="mt-7 flex justify-center"><div className="grid h-52 w-52 place-items-center rounded-2xl border-[10px] border-white bg-white p-3 shadow-2xl">{previewImageUrl ? <img alt="Payment QR preview" className="h-full w-full rounded-lg object-contain" src={previewImageUrl} /> : <div className="flex flex-col items-center gap-2 text-center text-[#929b94]"><QrCode size={34} /><span className="text-[10px] leading-4">Add a UPI payload<br />to preview the QR</span></div>}</div></div><p className="mt-7 text-center text-[12px] font-semibold">{label || "Payment destination"}</p><p className="mt-1 text-center font-mono text-[10px] text-white/45">{previewImageUrl ? "QR ready for checkout" : "Add a UPI payload to activate"}</p><div className="mt-7 space-y-3 border-t border-white/10 pt-5 text-[11px] text-white/65"><p className="flex items-center gap-2"><CheckCircle2 className="text-[#b9d5b1]" size={14} /> Payment reference captured at checkout</p><p className="flex items-center gap-2"><ShieldCheck className="text-[#b9d5b1]" size={14} /> Admin approval required before ticket release</p><p className="flex items-center gap-2"><Copy className="text-[#f16d55]" size={14} /> Switch between saved payment destinations anytime</p></div></section></div></AdminShell>;
}
