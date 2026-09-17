"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminActionLink, AdminShell } from "@/components/admin-shell";
import { EmptyState, DataLoading } from "@/components/empty-state";
import { ArrowUpRight, CheckCircle2, ChevronDown, Clock3, Mail, Search } from "@/components/icons";

type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";
type ContactMessage = { id: string; name: string; email: string; phone: string | null; subject: string; message: string; bookingReference: string | null; status: ContactStatus; createdAt: string; updatedAt: string };

const statusLabels: Record<ContactStatus, string> = { NEW: "New", IN_PROGRESS: "In progress", RESOLVED: "Resolved" };

export default function ContactInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<"ALL" | ContactStatus>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/contact", { cache: "no-store" }).then(async (response) => {
      const result = await response.json() as { messages?: ContactMessage[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load contact messages.");
      if (!cancelled) {
        setMessages(result.messages ?? []);
        setError("");
        setLoading(false);
      }
    }).catch((reason) => {
      if (!cancelled) {
        setError(reason instanceof Error ? reason.message : "Unable to load contact messages.");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const visibleMessages = useMemo(() => messages.filter((message) => {
    const matchesStatus = filter === "ALL" || message.status === filter;
    const haystack = `${message.name} ${message.email} ${message.phone ?? ""} ${message.subject} ${message.message} ${message.bookingReference ?? ""}`.toLowerCase();
    return matchesStatus && haystack.includes(search.toLowerCase());
  }), [filter, messages, search]);
  const newCount = messages.filter((message) => message.status === "NEW").length;
  const openCount = messages.filter((message) => message.status !== "RESOLVED").length;

  async function updateStatus(id: string, status: ContactStatus) {
    setUpdatingId(id);
    try {
      const response = await fetch("/api/admin/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const result = await response.json() as { message?: ContactMessage; error?: string };
      if (!response.ok || !result.message) throw new Error(result.error ?? "Unable to update this message.");
      setMessages((current) => current.map((message) => message.id === id ? result.message! : message));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update this message.");
    } finally {
      setUpdatingId("");
    }
  }

    return <AdminShell eyebrow="Inbox" title="Messages worth answering." description="Read contact requests from attendees and organizers, then keep their status clear for the whole team." action={<AdminActionLink href="/admin/dashboard">Back to overview <ArrowUpRight size={14} /></AdminActionLink>}><div className="reveal grid gap-4 sm:grid-cols-3"><Summary label="New messages" value={String(newCount)} tone="coral" /><Summary label="Open conversations" value={String(openCount)} tone="amber" /><Summary label="All messages" value={String(messages.length)} tone="green" /></div><section className="reveal reveal-delay-1 mt-5 overflow-hidden rounded-[20px] border border-[#e1e5df] bg-white"><div className="flex flex-col gap-4 border-b border-[#e9ece7] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#929b94]">Contact inbox</p><h2 className="mt-1 text-[20px] font-semibold tracking-[-0.045em]">Every note, in one calm place.</h2></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa39b]" size={14} /><input className="w-full rounded-lg border border-[#e1e5df] bg-[#fafbf9] py-2.5 pl-9 pr-3 text-[11px] outline-none focus:border-[#f16d55] sm:w-56" onChange={(event) => setSearch(event.target.value)} placeholder="Search messages" value={search} /></label><div className="relative"><select className="w-full appearance-none rounded-lg border border-[#e1e5df] bg-[#fafbf9] px-3 py-2.5 pr-8 text-[11px] font-semibold outline-none focus:border-[#f16d55]" onChange={(event) => setFilter(event.target.value as typeof filter)} value={filter}><option value="ALL">All statuses</option><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#89938b]" size={13} /></div></div></div>{error ? <div className="p-6"><EmptyState title="The inbox needs a moment." description={error} /></div> : loading ? <div className="p-6"><DataLoading label="Reading contact messages" /></div> : visibleMessages.length === 0 ? <EmptyState title={messages.length === 0 ? "Your inbox is quiet." : "No messages match this view."} description={messages.length === 0 ? "New contact requests from the public page will appear here." : "Try another status or search term."} /> : <div className="divide-y divide-[#eef0ec]">{visibleMessages.map((message, index) => <article className="lift-card reveal p-5 sm:p-7" key={message.id} style={{ animationDelay: `${Math.min(index * 45, 240)}ms` }}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${message.status === "NEW" ? "bg-[#f7ded7] text-[#bf5542]" : message.status === "IN_PROGRESS" ? "bg-[#fff2d6] text-[#ac7f35]" : "bg-[#e5f0e2] text-[#66825f]"}`}>{statusLabels[message.status]}</span><span className="text-[10px] text-[#a0a8a1]">{new Date(message.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span></div><h3 className="mt-3 truncate text-[16px] font-semibold tracking-[-0.03em]">{message.subject}</h3><p className="mt-1 text-[11px] text-[#7b847d]">{message.name} · <a className="text-[#d95742] hover:underline" href={`mailto:${message.email}`}>{message.email}</a>{message.phone && <> · <a className="text-[#66825f] hover:underline" href={`tel:${message.phone}`}>{message.phone}</a></>}{message.bookingReference && <> · Booking {message.bookingReference}</>}</p></div><div className="flex shrink-0 items-center gap-2"><select aria-label={`Update status for ${message.subject}`} className="appearance-none rounded-lg border border-[#e1e5df] bg-[#fafbf9] px-3 py-2 pr-8 text-[10px] font-semibold outline-none focus:border-[#f16d55]" disabled={updatingId === message.id} onChange={(event) => void updateStatus(message.id, event.target.value as ContactStatus)} value={message.status}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><a aria-label={`Reply to ${message.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5df] text-[#69746c] hover:border-[#f16d55]" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}><Mail size={14} /></a></div></div><p className="mt-5 whitespace-pre-wrap rounded-xl bg-[#fafbf9] p-4 text-[12px] leading-6 text-[#69746c]">{message.message}</p>{message.status !== "RESOLVED" && <button className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#66825f] hover:text-[#242725]" disabled={updatingId === message.id} onClick={() => void updateStatus(message.id, "RESOLVED")} type="button"><CheckCircle2 size={14} /> Mark resolved</button>}</article>)}</div>}</section></AdminShell>;
}

function Summary({ label, value, tone }: { label: string; value: string; tone: "coral" | "amber" | "green" }) { const styles = { coral: "bg-[#f7ded7] text-[#bf5542]", amber: "bg-[#fff8e9] text-[#a0782e]", green: "bg-[#e7f0e3] text-[#5f7659]" }; return <div className="rounded-[18px] border border-[#e1e5df] bg-white p-5"><span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold ${styles[tone]}`}>{label}</span><p className="mt-4 text-[26px] font-semibold tracking-[-0.06em]">{value}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#89938b]"><Clock3 size={11} /> From the database</p></div>; }
