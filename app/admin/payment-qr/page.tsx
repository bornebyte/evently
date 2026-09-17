"use client";
/* eslint-disable @next/next/no-img-element */

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { AdminActionLink, AdminShell } from "@/components/admin-shell";
import { DataLoading, EmptyState } from "@/components/empty-state";
import { ArrowUpRight, CheckCircle2, Copy, CreditCard, Plus, QrCode, Save, Search, ShieldCheck, SlidersHorizontal } from "@/components/icons";

type EventOption = { id: string; slug: string; title: string; status: string };
type QrAssignment = { eventId: string; event: EventOption; isActive: boolean };
type QrRecord = { id: string; label: string; payload: string; imageUrl: string | null; isActive: boolean; assignments: QrAssignment[]; createdAt: string; updatedAt: string };
type FormState = { label: string; payload: string; imageUrl: string; eventIds: string[]; activeEventIds: string[] };
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "UNASSIGNED";

const emptyForm: FormState = { label: "", payload: "", imageUrl: "", eventIds: [], activeEventIds: [] };

export default function PaymentQrPage() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [qrs, setQrs] = useState<QrRecord[]>([]);
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filterEventId, setFilterEventId] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingKey, setUpdatingKey] = useState("");
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/payment-qr", { cache: "no-store" }).then(async (response) => {
      const result = await response.json() as { events?: EventOption[]; qrs?: QrRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load payment QR settings.");
      if (cancelled) return;
      const loadedQrs = result.qrs ?? [];
      setEvents(result.events ?? []);
      setQrs(loadedQrs);
      if (loadedQrs[0]) selectQr(loadedQrs[0]);
      else startNewQr();
      setLoading(false);
    }).catch((error) => {
      if (!cancelled) {
        setNotice({ kind: "error", text: error instanceof Error ? error.message : "Unable to load payment QR settings." });
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (form.imageUrl.trim() || !form.payload.trim()) return () => { cancelled = true; };
    QRCode.toDataURL(form.payload.trim(), { errorCorrectionLevel: "M", margin: 2, width: 512 })
      .then((url) => { if (!cancelled) setGeneratedPreviewUrl(url); })
      .catch(() => { if (!cancelled) setGeneratedPreviewUrl(""); });
    return () => { cancelled = true; };
  }, [form.imageUrl, form.payload]);

  const selectedQr = qrs.find((qr) => qr.id === selectedQrId) ?? null;
  const filteredQrs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return qrs.filter((qr) => {
      const matchesEvent = filterEventId === "ALL" || qr.assignments.some((assignment) => assignment.eventId === filterEventId);
      const hasActive = qr.assignments.some((assignment) => assignment.isActive);
      const matchesStatus = filterStatus === "ALL" || (filterStatus === "ACTIVE" && hasActive) || (filterStatus === "INACTIVE" && qr.assignments.length > 0 && !hasActive) || (filterStatus === "UNASSIGNED" && qr.assignments.length === 0);
      const haystack = `${qr.label} ${qr.payload} ${qr.assignments.map((assignment) => assignment.event.title).join(" ")}`.toLowerCase();
      return matchesEvent && matchesStatus && (!query || haystack.includes(query));
    });
  }, [filterEventId, filterStatus, qrs, search]);
  const assignmentCount = qrs.reduce((total, qr) => total + qr.assignments.length, 0);
  const activeAssignmentCount = qrs.reduce((total, qr) => total + qr.assignments.filter((assignment) => assignment.isActive).length, 0);
  const assignedEventCount = new Set(qrs.flatMap((qr) => qr.assignments.map((assignment) => assignment.eventId))).size;
  const previewImageUrl = form.imageUrl.trim() || (form.payload.trim() ? generatedPreviewUrl : "");

  function selectQr(qr: QrRecord) {
    setSelectedQrId(qr.id);
    setForm({ label: qr.label, payload: qr.payload, imageUrl: qr.imageUrl ?? "", eventIds: qr.assignments.map((assignment) => assignment.eventId), activeEventIds: qr.assignments.filter((assignment) => assignment.isActive).map((assignment) => assignment.eventId) });
    setNotice(null);
  }

  function startNewQr() {
    setSelectedQrId(null);
    setForm(emptyForm);
    setNotice(null);
  }

  function toggleEvent(eventId: string, assigned: boolean) {
    setForm((current) => {
      if (assigned) return { ...current, eventIds: current.eventIds.filter((id) => id !== eventId), activeEventIds: current.activeEventIds.filter((id) => id !== eventId) };
      return { ...current, eventIds: [...current.eventIds, eventId], activeEventIds: [...current.activeEventIds, eventId] };
    });
  }

  function toggleEventStatus(eventId: string) {
    setForm((current) => ({ ...current, activeEventIds: current.activeEventIds.includes(eventId) ? current.activeEventIds.filter((id) => id !== eventId) : [...current.activeEventIds, eventId] }));
  }

  async function saveQr() {
    if (form.label.trim().length < 2 || !form.payload.trim()) {
      setNotice({ kind: "error", text: "Provide a label and UPI QR payload before saving." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/payment-qr", { method: selectedQrId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qrId: selectedQrId ?? undefined, label: form.label, payload: form.payload, imageUrl: form.imageUrl, eventIds: form.eventIds, activeEventIds: form.activeEventIds }) });
      const result = await response.json() as { error?: string; qr?: QrRecord };
      if (!response.ok || !result.qr) throw new Error(result.error ?? "Unable to save the payment QR.");
      setQrs((current) => selectedQrId ? current.map((qr) => qr.id === result.qr!.id ? result.qr! : qr) : [result.qr!, ...current]);
      selectQr(result.qr);
      setNotice({ kind: "success", text: selectedQrId ? "Payment QR updated everywhere it is assigned." : "Payment QR added to the library." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Unable to save the payment QR." });
    } finally {
      setSaving(false);
    }
  }

  async function setAssignmentStatus(qrId: string, eventId: string, isActive: boolean) {
    setUpdatingKey(`${qrId}:${eventId}`);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/payment-qr", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set-status", qrId, eventId, isActive }) });
      const result = await response.json() as { error?: string; qr?: QrRecord };
      if (!response.ok || !result.qr) throw new Error(result.error ?? "Unable to update this QR status.");
      setQrs((current) => current.map((qr) => qr.id === result.qr!.id ? result.qr! : qr));
      if (selectedQrId === result.qr.id) selectQr(result.qr);
      setNotice({ kind: "success", text: isActive ? "QR is now active for this event." : "QR is now inactive for this event." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Unable to update this QR status." });
    } finally {
      setUpdatingKey("");
    }
  }

  async function deleteQr() {
    if (!selectedQrId || !selectedQr) return;
    if (!window.confirm(`Delete “${selectedQr.label}” from the QR library? It will be removed from every event assignment.`)) return;
    setDeleting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/payment-qr", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qrId: selectedQrId }) });
      const result = await response.json() as { error?: string; deletedId?: string };
      if (!response.ok || result.deletedId !== selectedQrId) throw new Error(result.error ?? "Unable to delete the payment QR.");
      const remaining = qrs.filter((qr) => qr.id !== selectedQrId);
      setQrs(remaining);
      if (remaining[0]) selectQr(remaining[0]);
      else startNewQr();
      setNotice({ kind: "success", text: "Payment QR deleted from the library." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Unable to delete the payment QR." });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <AdminShell eyebrow="Payments" title="Your payment destinations." description="Manage every QR code from one clear library."><DataLoading label="Loading payment QR library" /></AdminShell>;
  if (events.length === 0) return <AdminShell eyebrow="Payments" title="Your payment destinations." description="Manage every QR code from one clear library." action={<AdminActionLink href="/admin/events/new">Create an event <ArrowUpRight size={14} /></AdminActionLink>}><EmptyState title="Create an event first." description="Once an event exists, you can attach one or more payment QR codes to it." /></AdminShell>;

  return <AdminShell eyebrow="Payments" title="Your payment destinations." description="See every saved QR, assign it to one or more events, and control which destination appears at checkout." action={<AdminActionLink href="/admin/bookings">Review bookings <ArrowUpRight size={14} /></AdminActionLink>}><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary label="QR codes" value={String(qrs.length)} detail="Saved in your library" tone="coral" /><Summary label="Event assignments" value={String(assignmentCount)} detail={`${assignedEventCount} events connected`} tone="green" /><Summary label="Active at checkout" value={String(activeAssignmentCount)} detail="One active destination per event" tone="amber" /><Summary label="Unassigned" value={String(qrs.filter((qr) => qr.assignments.length === 0).length)} detail="Ready to be connected" tone="lavender" /></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]"><section className="min-w-0 rounded-[20px] border border-[#e1e5df] bg-white p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#e15f49]"><CreditCard size={13} /> QR library</p><h2 className="mt-1 text-[21px] font-semibold tracking-[-0.05em]">All payment QR codes</h2><p className="mt-2 max-w-[480px] text-[12px] leading-5 text-[#7b847d]">A QR can be connected to multiple events. Each event still has its own active or inactive setting.</p></div><button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#242725] px-4 py-3 text-[11px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725]" onClick={startNewQr} type="button"><Plus size={14} /> Add QR code</button></div><div className="mt-6 grid gap-2 sm:grid-cols-[1fr_180px_150px]"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa39b]" size={14} /><input className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] py-3 pl-9 pr-3 text-[11px] outline-none focus:border-[#f16d55]" onChange={(event) => setSearch(event.target.value)} placeholder="Search QR names or events" value={search} /></label><select className="rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3 text-[11px] outline-none focus:border-[#f16d55]" onChange={(event) => setFilterEventId(event.target.value)} value={filterEventId}><option value="ALL">All events</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select><select className="rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3 text-[11px] outline-none focus:border-[#f16d55]" onChange={(event) => setFilterStatus(event.target.value as StatusFilter)} value={filterStatus}><option value="ALL">All statuses</option><option value="ACTIVE">Has active QR</option><option value="INACTIVE">Inactive only</option><option value="UNASSIGNED">Unassigned</option></select></div>{filteredQrs.length === 0 ? <div className="mt-6"><EmptyState title={qrs.length === 0 ? "Your QR library is empty." : "No QR codes match this view."} description={qrs.length === 0 ? "Add a payment QR to connect it with your events." : "Try another event, status, or search term."} action={qrs.length === 0 ? <button className="rounded-xl bg-[#242725] px-4 py-3 text-[11px] font-semibold text-white" onClick={startNewQr} type="button">Add your first QR</button> : undefined} /></div> : <div className="mt-5 space-y-3">{filteredQrs.map((qr) => <QrLibraryCard key={qr.id} qr={qr} selected={selectedQrId === qr.id} updatingKey={updatingKey} onEdit={() => selectQr(qr)} onToggleStatus={(eventId, isActive) => void setAssignmentStatus(qr.id, eventId, isActive)} />)}</div>}</section><section className="min-w-0 rounded-[20px] border border-[#e1e5df] bg-white p-5 sm:p-7 xl:sticky xl:top-6 xl:self-start"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#929b94]">{selectedQr ? "Edit QR code" : "New QR code"}</p><h2 className="mt-1 text-[21px] font-semibold tracking-[-0.05em]">{selectedQr ? selectedQr.label : "Add a destination"}</h2></div>{selectedQr && <div className="flex shrink-0 items-center gap-2"><button className="rounded-lg border border-[#f1c9c0] px-3 py-2 text-[10px] font-semibold text-[#bb503e] hover:border-[#d95742] hover:bg-[#fff7f5] disabled:opacity-50" disabled={deleting} onClick={() => void deleteQr()} type="button">Delete QR</button><button className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe3dd] px-3 py-2 text-[10px] font-semibold text-[#69746c] hover:border-[#f16d55]" onClick={startNewQr} type="button"><Plus size={13} /> New QR</button></div>}</div><div className="mt-6 space-y-4"><Field label="Display label" hint="A friendly name your team will recognize." value={form.label} onChange={(value) => setForm((current) => ({ ...current, label: value }))} /><Field label="UPI QR payload" hint="Paste the complete UPI URI. This is used to generate the QR at checkout." textarea value={form.payload} onChange={(value) => setForm((current) => ({ ...current, payload: value }))} /><Field label="Hosted QR image URL" hint="Optional. If blank, evently generates a QR from the payload." value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))} /></div><div className="mt-5 rounded-2xl bg-[#202321] p-4 text-white"><div className="flex items-center justify-between gap-3"><div><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/45"><CreditCard size={12} /> Live checkout preview</p><p className="mt-1 text-[10px] text-white/55">This is the QR attendees will scan.</p></div>{previewImageUrl && <CheckCircle2 className="text-[#b9d5b1]" size={17} />}</div><div className="mt-4 flex items-center gap-4"><div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-white p-2">{previewImageUrl ? <img alt="Payment QR preview" className="h-full w-full rounded-lg object-contain" src={previewImageUrl} /> : <QrCode className="text-[#a0a8a1]" size={32} />}</div><div className="min-w-0"><p className="truncate text-[12px] font-semibold">{form.label || "Payment destination"}</p><p className="mt-2 text-[10px] leading-4 text-white/55">{previewImageUrl ? "QR ready for checkout." : "Add a UPI payload to preview this QR."}</p></div></div><p className="mt-4 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[10px] text-white/55"><ShieldCheck className="text-[#b9d5b1]" size={13} /> Payment reference will still require admin approval.</p></div><div className="mt-6 rounded-2xl border border-[#e6e9e4] bg-[#fafbf9] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#69746c]">Event assignments</p><p className="mt-1 text-[10px] leading-4 text-[#929b94]">Select every event that can use this QR.</p></div><SlidersHorizontal className="text-[#a0a8a1]" size={16} /></div><div className="mt-4 space-y-2">{events.map((event) => { const assigned = form.eventIds.includes(event.id); const active = form.activeEventIds.includes(event.id); return <div className={`flex items-center gap-3 rounded-xl border p-3 ${assigned ? "border-[#d5e3d0] bg-white" : "border-[#e7eae5] bg-transparent"}`} key={event.id}><input aria-label={`Assign ${form.label || "QR code"} to ${event.title}`} checked={assigned} className="h-4 w-4 accent-[#f16d55]" onChange={() => toggleEvent(event.id, assigned)} type="checkbox" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-[#242725]">{event.title}</p><p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-[#a0a8a1]">{event.status}</p></div>{assigned && <button aria-pressed={active} className={`shrink-0 rounded-full px-2.5 py-1.5 text-[9px] font-bold ${active ? "bg-[#dfe8d9] text-[#5f7659]" : "bg-[#eceeeb] text-[#89938b]"}`} onClick={() => toggleEventStatus(event.id)} type="button">{active ? "Active" : "Inactive"}</button>}</div>; })}</div><p className="mt-3 text-[10px] leading-4 text-[#929b94]">Activating this QR for an event automatically makes any other QR inactive for that event.</p></div>{notice && <p className={`mt-4 rounded-xl px-4 py-3 text-[11px] font-semibold ${notice.kind === "error" ? "bg-[#fbe5e0] text-[#bb503e]" : "bg-[#e7f0e3] text-[#5f7659]"}`}>{notice.text}</p>}<button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#242725] px-5 py-3.5 text-[12px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725] disabled:cursor-wait disabled:opacity-50" disabled={saving || deleting} onClick={() => void saveQr()} type="button"><Save size={15} /> {saving ? "Saving…" : selectedQr ? "Save all changes" : "Add payment QR"}</button></section></div></AdminShell>;
}

function Summary({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "coral" | "green" | "amber" | "lavender" }) {
  const styles = { coral: "bg-[#f7ded7] text-[#bf5542]", green: "bg-[#e7f0e3] text-[#5f7659]", amber: "bg-[#fff2d6] text-[#ac7f35]", lavender: "bg-[#e8e3ef] text-[#6f5d7d]" };
  return <div className="rounded-[18px] border border-[#e1e5df] bg-white p-5"><span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold ${styles[tone]}`}>{label}</span><p className="mt-4 text-[26px] font-semibold tracking-[-0.06em]">{value}</p><p className="mt-1 text-[10px] text-[#89938b]">{detail}</p></div>;
}

function QrLibraryCard({ qr, selected, updatingKey, onEdit, onToggleStatus }: { qr: QrRecord; selected: boolean; updatingKey: string; onEdit: () => void; onToggleStatus: (eventId: string, isActive: boolean) => void }) {
  return <article className={`rounded-2xl border p-4 transition-colors ${selected ? "border-[#f16d55] bg-[#fffaf8]" : "border-[#e5e8e3] bg-[#fafbf9] hover:border-[#cbd8c7]"}`}><div className="flex gap-4"><QrThumbnail imageUrl={qr.imageUrl} label={qr.label} payload={qr.payload} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-[13px] font-semibold text-[#242725]">{qr.label}</h3><p className="mt-1 text-[10px] text-[#929b94]">Updated {new Date(qr.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div><button className="shrink-0 rounded-lg border border-[#dfe3dd] px-3 py-2 text-[10px] font-semibold text-[#69746c] hover:border-[#f16d55] hover:text-[#d95742]" onClick={onEdit} type="button">Edit QR</button></div><div className="mt-3 flex flex-wrap gap-2">{qr.assignments.length === 0 ? <span className="rounded-full bg-[#eceeeb] px-2.5 py-1 text-[9px] font-semibold text-[#89938b]">Not assigned to an event</span> : qr.assignments.map((assignment) => <button className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${assignment.isActive ? "bg-[#dfe8d9] text-[#5f7659]" : "bg-[#eceeeb] text-[#89938b]"}`} disabled={updatingKey === `${qr.id}:${assignment.eventId}`} key={assignment.eventId} onClick={() => onToggleStatus(assignment.eventId, !assignment.isActive)} title={assignment.isActive ? "Make inactive for this event" : "Make active for this event"} type="button">{assignment.event.title} · {assignment.isActive ? "Active" : "Inactive"}</button>)}</div></div></div><div className="mt-3 flex items-center gap-2 border-t border-[#e6e9e4] pt-3 text-[10px] text-[#89938b]"><Copy size={12} /> Select Edit QR to change the payload, image, event assignments, or statuses.</div></article>;
}

function QrThumbnail({ imageUrl, label, payload }: { imageUrl: string | null; label: string; payload: string }) {
  const [generatedUrl, setGeneratedUrl] = useState("");
  useEffect(() => {
    let cancelled = false;
    if (imageUrl || !payload) return () => { cancelled = true; };
    QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 2, width: 200 }).then((url) => { if (!cancelled) setGeneratedUrl(url); }).catch(() => { if (!cancelled) setGeneratedUrl(""); });
    return () => { cancelled = true; };
  }, [imageUrl, payload]);
  const src = imageUrl || generatedUrl;
  return <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e1e5df] bg-white p-2">{src ? <img alt={`${label} QR preview`} className="h-full w-full object-contain" src={src} /> : <QrCode className="text-[#69746c]" size={28} />}</div>;
}

function Field({ label, hint, value, onChange, textarea = false }: { label: string; hint: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">{label}</span>{textarea ? <textarea className="min-h-28 w-full resize-y rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3 text-[12px] leading-5 outline-none focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} placeholder={label} value={value} /> : <input className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3.5 text-[12px] outline-none focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} placeholder={label} value={value} />}{hint && <span className="mt-1 block text-[10px] leading-4 text-[#929b94]">{hint}</span>}</label>;
}
