"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminActionLink, AdminShell } from "@/components/admin-shell";
import { EmptyState, DataLoading } from "@/components/empty-state";
import { CalendarDays, ExternalLink, Pencil, Plus, Search, Ticket } from "@/components/icons";

type EventStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "ARCHIVED";
type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  startAt: string;
  endAt: string;
  city: string;
  venueName: string;
  status: EventStatus;
  featured: boolean;
  updatedAt: string;
  bookings: number;
  ticketTypes: { id: string; name: string; totalQuantity: number; availableQuantity: number; status: string }[];
};

function statusLabel(status: EventStatus) {
  return status === "SOLD_OUT" ? "Sold out" : status.charAt(0) + status.slice(1).toLowerCase();
}

function statusClasses(status: EventStatus) {
  if (status === "PUBLISHED") return "bg-[#e5f0e2] text-[#66825f]";
  if (status === "DRAFT") return "bg-[#fff2d6] text-[#ac7f35]";
  if (status === "SOLD_OUT") return "bg-[#f7ded7] text-[#bf5542]";
  return "bg-[#e8e3ef] text-[#6f5d7d]";
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | EventStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/events", { cache: "no-store" }).then(async (response) => {
      const result = await response.json() as { events?: AdminEvent[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load events.");
      if (!cancelled) {
        setEvents(result.events ?? []);
        setError("");
      }
    }).catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load events.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesStatus = filter === "ALL" || event.status === filter;
      const haystack = `${event.title} ${event.category} ${event.city} ${event.venueName} ${event.slug}`.toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [events, filter, search]);
  const publishedCount = events.filter((event) => event.status === "PUBLISHED").length;
  const draftCount = events.filter((event) => event.status === "DRAFT").length;

  return <AdminShell eyebrow="Events" title="Your event catalog, in one place." description="Create, publish, and keep every event detail current from a single workspace." action={<AdminActionLink href="/admin/events/new"><Plus size={14} /> New event</AdminActionLink>}>
    <div className="grid gap-4 sm:grid-cols-3">
      <Summary label="All events" value={String(events.length)} detail="In this workspace" />
      <Summary label="Published" value={String(publishedCount)} detail="Visible on the public site" />
      <Summary label="Drafts" value={String(draftCount)} detail="Still being shaped" />
    </div>

    <section className="mt-5 overflow-hidden rounded-[20px] border border-[#e1e5df] bg-white">
      <div className="flex flex-col gap-4 border-b border-[#e9ece7] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#929b94]">Event library</p><h2 className="mt-1 text-[20px] font-semibold tracking-[-0.045em]">Shape the experience.</h2></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa39b]" size={14} /><input className="w-full rounded-lg border border-[#e1e5df] bg-[#fafbf9] py-2.5 pl-9 pr-3 text-[11px] outline-none focus:border-[#f16d55] sm:w-56" onChange={(event) => setSearch(event.target.value)} placeholder="Search events" value={search} /></label>
          <select className="rounded-lg border border-[#e1e5df] bg-[#fafbf9] px-3 py-2.5 text-[11px] font-semibold outline-none focus:border-[#f16d55]" onChange={(event) => setFilter(event.target.value as "ALL" | EventStatus)} value={filter}><option value="ALL">All statuses</option>{eventStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
        </div>
      </div>
      {error ? <div className="p-6"><EmptyState title="The event library needs a moment." description={error} /></div> : loading ? <div className="p-6"><DataLoading label="Reading your events" /></div> : visibleEvents.length === 0 ? <EmptyState title={events.length === 0 ? "Your catalog is ready for its first event." : "No events match this view."} description={events.length === 0 ? "Create an event and its public page will start here." : "Try another status or search term."} action={events.length === 0 ? <AdminActionLink href="/admin/events/new">Create your first event</AdminActionLink> : undefined} /> : <div className="divide-y divide-[#eef0ec]">{visibleEvents.map((event) => {
        const capacity = event.ticketTypes.reduce((sum, ticket) => sum + ticket.totalQuantity, 0);
        const available = event.ticketTypes.reduce((sum, ticket) => sum + ticket.availableQuantity, 0);
        return <article className="p-5 sm:p-6" key={event.id}><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div className="flex min-w-0 items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7ded7] text-lg font-semibold text-[#bf5542]">{event.title.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses(event.status)}`}>{statusLabel(event.status)}</span>{event.featured && <span className="rounded-full bg-[#eee5c8] px-2.5 py-1 text-[10px] font-semibold text-[#947b39]">Featured</span>}<span className="text-[10px] text-[#a0a8a1]">{event.category}</span></div><h3 className="mt-2 truncate text-[17px] font-semibold tracking-[-0.035em]">{event.title}</h3><p className="mt-1 truncate text-[11px] text-[#89938b]">{event.venueName} · {event.city}</p></div></div><div className="flex shrink-0 flex-wrap items-center gap-2"><Link className="flex items-center gap-2 rounded-xl bg-[#242725] px-4 py-3 text-[11px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725]" href={`/admin/events/${event.id}/edit`}><Pencil size={13} /> Edit event</Link>{event.status === "PUBLISHED" && <Link className="flex items-center gap-2 rounded-xl border border-[#e1e5df] px-4 py-3 text-[11px] font-semibold text-[#68736b] hover:border-[#f16d55]" href={`/events/${event.slug}`} target="_blank"><ExternalLink size={13} /> View page</Link>}</div></div><div className="mt-5 grid gap-3 border-t border-[#eef0ec] pt-4 text-[11px] text-[#7b847d] sm:grid-cols-3"><div className="flex items-center gap-2"><CalendarDays className="text-[#9aa39b]" size={14} /><span>{formatEventDate(event.startAt)} · {formatEventDate(event.endAt)}</span></div><div className="flex items-center gap-2"><Ticket className="text-[#9aa39b]" size={14} /><span>{available} available of {capacity} tickets</span></div><div className="flex items-center gap-2"><span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e7f0e3] px-1.5 text-[9px] font-bold text-[#5f7659]">{event.bookings}</span><span>{event.bookings === 1 ? "booking" : "bookings"}</span></div></div></article>;
      })}</div>}
    </section>
  </AdminShell>;
}

const eventStatusOptions: { value: EventStatus; label: string }[] = [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "SOLD_OUT", label: "Sold out" }, { value: "ARCHIVED", label: "Archived" }];

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-[18px] border border-[#e1e5df] bg-white p-5"><p className="text-[11px] font-semibold text-[#89938b]">{label}</p><p className="mt-4 text-[27px] font-semibold tracking-[-0.06em]">{value}</p><p className="mt-1 text-[10px] text-[#879088]">{detail}</p></div>; }
