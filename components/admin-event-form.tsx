"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminActionLink, AdminShell } from "@/components/admin-shell";
import { DataLoading, EmptyState } from "@/components/empty-state";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, ExternalLink, Plus, Save, X } from "@/components/icons";

type EventStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "ARCHIVED";
type TicketStatus = "ACTIVE" | "PAUSED" | "SOLD_OUT";

type TicketForm = {
  id?: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  availableQuantity?: number;
  reservedQuantity?: number;
  minPerOrder: string;
  maxPerOrder: string;
  salesStart: string;
  salesEnd: string;
  status: TicketStatus;
};

type EventForm = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string;
  coverImage: string;
  galleryImages: string;
  startAt: string;
  endAt: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  organizerName: string;
  organizerDescription: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerWebsite: string;
  status: EventStatus;
  featured: boolean;
};

type AdminEventDetail = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  galleryImages: string[];
  startAt: string;
  endAt: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  status: EventStatus;
  featured: boolean;
  organizer: { name: string; description: string | null; email: string; phone: string | null; website: string | null };
  ticketTypes: { id: string; name: string; description: string | null; price: number; totalQuantity: number; availableQuantity: number; salesStart: string | null; salesEnd: string | null; minPerOrder: number; maxPerOrder: number; status: TicketStatus }[];
};

const eventStatusOptions: { value: EventStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SOLD_OUT", label: "Sold out" },
  { value: "ARCHIVED", label: "Archived" },
];
const ticketStatusOptions: { value: TicketStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "SOLD_OUT", label: "Sold out" },
];

const emptyTicket = (): TicketForm => ({ name: "", description: "", price: "", quantity: "", minPerOrder: "1", maxPerOrder: "8", salesStart: "", salesEnd: "", status: "ACTIVE" });
const emptyForm: EventForm = { title: "", slug: "", shortDescription: "", description: "", category: "", tags: "", coverImage: "", galleryImages: "", startAt: "", endAt: "", timezone: "Asia/Kolkata", venueName: "", address: "", city: "", state: "", country: "India", postalCode: "", latitude: "", longitude: "", organizerName: "", organizerDescription: "", organizerEmail: "", organizerPhone: "", organizerWebsite: "", status: "PUBLISHED", featured: false };

function dateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formFromEvent(event: AdminEventDetail): { form: EventForm; tickets: TicketForm[] } {
  return {
    form: {
      title: event.title,
      slug: event.slug,
      shortDescription: event.shortDescription,
      description: event.description,
      category: event.category,
      tags: event.tags.join(", "),
      coverImage: event.coverImage,
      galleryImages: event.galleryImages.join(", "),
      startAt: dateTimeLocal(event.startAt),
      endAt: dateTimeLocal(event.endAt),
      timezone: event.timezone,
      venueName: event.venueName,
      address: event.address,
      city: event.city,
      state: event.state ?? "",
      country: event.country,
      postalCode: event.postalCode ?? "",
      latitude: event.latitude === null ? "" : String(event.latitude),
      longitude: event.longitude === null ? "" : String(event.longitude),
      organizerName: event.organizer.name,
      organizerDescription: event.organizer.description ?? "",
      organizerEmail: event.organizer.email,
      organizerPhone: event.organizer.phone ?? "",
      organizerWebsite: event.organizer.website ?? "",
      status: event.status,
      featured: event.featured,
    },
    tickets: event.ticketTypes.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      description: ticket.description ?? "",
      price: String(ticket.price),
      quantity: String(ticket.totalQuantity),
      availableQuantity: ticket.availableQuantity,
      reservedQuantity: ticket.totalQuantity - ticket.availableQuantity,
      minPerOrder: String(ticket.minPerOrder),
      maxPerOrder: String(ticket.maxPerOrder),
      salesStart: dateTimeLocal(ticket.salesStart),
      salesEnd: dateTimeLocal(ticket.salesEnd),
      status: ticket.status,
    })),
  };
}

export default function AdminEventForm({ mode, eventId }: { mode: "create" | "edit"; eventId?: string }) {
  const router = useRouter();
  const editing = mode === "edit";
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [tickets, setTickets] = useState<TicketForm[]>([emptyTicket()]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!editing || !eventId) return;
    let cancelled = false;
    fetch(`/api/admin/events/${eventId}`, { cache: "no-store" }).then(async (response) => {
      const result = await response.json() as { event?: AdminEventDetail; error?: string };
      if (!response.ok || !result.event) throw new Error(result.error ?? "Unable to load this event.");
      if (cancelled) return;
      const loaded = formFromEvent(result.event);
      setEvent(result.event);
      setForm(loaded.form);
      setTickets(loaded.tickets.length > 0 ? loaded.tickets : [emptyTicket()]);
      setNotice("");
    }).catch((error) => {
      if (!cancelled) setNotice(error instanceof Error ? error.message : "Unable to load this event.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [editing, eventId]);

  const missingFields = useMemo(() => [
    { value: form.title, label: "event title" },
    { value: form.slug, label: "URL slug" },
    { value: form.shortDescription, label: "short description" },
    { value: form.description, label: "full description" },
    { value: form.category, label: "category" },
    { value: form.coverImage, label: "cover image URL" },
    { value: form.startAt, label: "start date and time" },
    { value: form.endAt, label: "end date and time" },
    { value: form.venueName, label: "venue name" },
    { value: form.address, label: "address" },
    { value: form.city, label: "city" },
    { value: form.country, label: "country" },
    { value: form.organizerName, label: "organizer name" },
    { value: form.organizerEmail, label: "organizer email" },
  ].filter((field) => !field.value.trim()).map((field) => field.label), [form]);

  const ticketProblems = useMemo(() => tickets.map((ticket, index) => {
    const problems: string[] = [];
    if (!ticket.name.trim()) problems.push("name");
    if (!ticket.price.trim() || !Number.isFinite(Number(ticket.price)) || Number(ticket.price) < 0) problems.push("valid price");
    if (!ticket.quantity.trim() || !Number.isInteger(Number(ticket.quantity)) || Number(ticket.quantity) <= 0) problems.push("quantity greater than 0");
    if (!ticket.minPerOrder.trim() || !Number.isInteger(Number(ticket.minPerOrder)) || Number(ticket.minPerOrder) < 1) problems.push("valid minimum order");
    if (!ticket.maxPerOrder.trim() || !Number.isInteger(Number(ticket.maxPerOrder)) || Number(ticket.maxPerOrder) < Number(ticket.minPerOrder)) problems.push("maximum order at least the minimum");
    if (ticket.salesStart && ticket.salesEnd && new Date(ticket.salesEnd) <= new Date(ticket.salesStart)) problems.push("sales end after sales start");
    return problems.length > 0 ? `Ticket ${index + 1}: ${problems.join(", ")}` : "";
  }).filter(Boolean), [tickets]);
  const ready = missingFields.length === 0;
  const ticketReady = ticketProblems.length === 0;
  const update = (key: keyof EventForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value } as EventForm));
  const updateTicket = (index: number, key: keyof TicketForm, value: string) => setTickets((current) => current.map((ticket, ticketIndex) => ticketIndex === index ? { ...ticket, [key]: value } : ticket));

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!ready || !ticketReady) {
      setNotice(`Please complete: ${[...missingFields, ...ticketProblems].join(" · ")}.`);
      return;
    }
    setSaving(true);
    setNotice("");
    const payload = {
      ...form,
      tags: form.tags.split(","),
      galleryImages: form.galleryImages.split(","),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      ticketTypes: tickets.map((ticket) => ({ id: ticket.id, name: ticket.name, description: ticket.description, price: Number(ticket.price), quantity: Number(ticket.quantity), minPerOrder: Number(ticket.minPerOrder), maxPerOrder: Number(ticket.maxPerOrder), salesStart: ticket.salesStart || null, salesEnd: ticket.salesEnd || null, status: ticket.status })),
    };
    try {
      const response = await fetch(editing ? `/api/admin/events/${eventId}` : "/api/admin/events", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string; event?: { id: string; slug: string; status: EventStatus } };
      if (!response.ok || !result.event) throw new Error(result.error ?? `Unable to ${editing ? "save" : "create"} this event.`);
      if (editing) {
        setEvent((current) => current ? { ...current, title: form.title, slug: result.event!.slug, status: result.event!.status, featured: form.featured } : current);
        setNotice("Event changes saved successfully.");
      } else {
        router.push(`/admin/events/${result.event.id}/edit`);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Unable to ${editing ? "save" : "create"} this event.`);
    } finally {
      setSaving(false);
    }
  };

  const shellTitle = editing ? event?.title ? `Edit ${event.title}.` : "Edit your event." : "Give the next gathering a place to live.";
  const shellDescription = editing ? "Update every important part of the event, from its public story and schedule to ticket inventory and sales rules." : "Everything entered here is saved to the database and becomes the source of truth for the public event page.";
  const action = <><Link className="hidden items-center gap-2 rounded-xl border border-[#e1e5df] bg-white px-4 py-3 text-[11px] font-semibold text-[#68736b] hover:border-[#f16d55] sm:flex" href="/admin/events"><ArrowLeft size={14} /> Back to events</Link>{editing && event?.status === "PUBLISHED" && <Link className="hidden items-center gap-2 rounded-xl border border-[#e1e5df] bg-white px-4 py-3 text-[11px] font-semibold text-[#68736b] hover:border-[#f16d55] sm:flex" href={`/events/${event.slug}`} target="_blank"><ExternalLink size={14} /> View public page</Link>}<button className="flex items-center gap-2 rounded-xl bg-[#242725] px-4 py-3 text-[11px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725] disabled:opacity-50" disabled={saving || loading} form="event-form" type="submit">{saving ? "Saving…" : editing ? "Save changes" : "Create event"} {editing ? <Save size={14} /> : <ArrowUpRight size={14} />}</button></>;

  if (editing && loading) return <AdminShell eyebrow="Events" title="Edit your event." description={shellDescription} action={action}><DataLoading label="Loading event details" /></AdminShell>;
  if (editing && !event) return <AdminShell eyebrow="Events" title="Event unavailable." description="This event could not be loaded from the workspace." action={<AdminActionLink href="/admin/events">Back to events</AdminActionLink>}><EmptyState title="We could not find that event." description={notice || "It may have been removed or the link may be out of date."} /></AdminShell>;

  return <AdminShell eyebrow="Events" title={shellTitle} description={shellDescription} action={action}>
    <form className="grid gap-5 xl:grid-cols-[1fr_380px]" id="event-form" onSubmit={submit}>
      <div className="space-y-5">
        <FormSection eyebrow="The story" title="Basic information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event title" placeholder="Enter the event title" value={form.title} onChange={(value) => update("title", value)} />
            <Field label="URL slug" placeholder="your-event-slug" value={form.slug} onChange={(value) => update("slug", value)} />
            <Field label="Category" placeholder="Enter a category" value={form.category} onChange={(value) => update("category", value)} />
            <Field label="Tags" placeholder="Separate tags with commas" value={form.tags} onChange={(value) => update("tags", value)} />
          </div>
          <div className="mt-4 space-y-4">
            <Field label="Short description" placeholder="One clear line for the event card" value={form.shortDescription} onChange={(value) => update("shortDescription", value)} />
            <Field label="Full description" placeholder="Tell people what makes this experience worth showing up for" textarea value={form.description} onChange={(value) => update("description", value)} />
          </div>
        </FormSection>

        <FormSection eyebrow="When it happens" title="Schedule">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start" type="datetime-local" placeholder="Choose a start" icon={<CalendarDays size={15} />} value={form.startAt} onChange={(value) => update("startAt", value)} />
            <Field label="End" type="datetime-local" placeholder="Choose an end" icon={<Clock3 size={15} />} value={form.endAt} onChange={(value) => update("endAt", value)} />
          </div>
          <div className="mt-4"><Field label="Timezone" placeholder="For example, Asia/Kolkata" value={form.timezone} onChange={(value) => update("timezone", value)} /></div>
        </FormSection>

        <FormSection eyebrow="Where to find it" title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue name" placeholder="Enter the venue" value={form.venueName} onChange={(value) => update("venueName", value)} />
            <Field label="Address" placeholder="Enter the street address" value={form.address} onChange={(value) => update("address", value)} />
            <Field label="City" placeholder="Enter the city" value={form.city} onChange={(value) => update("city", value)} />
            <Field label="State" placeholder="Enter the state" value={form.state} onChange={(value) => update("state", value)} />
            <Field label="Country" placeholder="Enter the country" value={form.country} onChange={(value) => update("country", value)} />
            <Field label="Postal code" placeholder="Enter the postal code" value={form.postalCode} onChange={(value) => update("postalCode", value)} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Latitude" placeholder="Optional map latitude" value={form.latitude} onChange={(value) => update("latitude", value)} />
            <Field label="Longitude" placeholder="Optional map longitude" value={form.longitude} onChange={(value) => update("longitude", value)} />
          </div>
        </FormSection>

        <FormSection eyebrow="The people behind it" title="Organizer">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organizer name" placeholder="Enter the organizer name" value={form.organizerName} onChange={(value) => update("organizerName", value)} />
            <Field label="Contact email" placeholder="Organizer email" type="email" value={form.organizerEmail} onChange={(value) => update("organizerEmail", value)} />
            <Field label="Contact phone" placeholder="Optional phone number" value={form.organizerPhone} onChange={(value) => update("organizerPhone", value)} />
            <Field label="Website" placeholder="Optional website URL" value={form.organizerWebsite} onChange={(value) => update("organizerWebsite", value)} />
          </div>
          <div className="mt-4"><Field label="Organizer description" placeholder="A short introduction to the team" textarea value={form.organizerDescription} onChange={(value) => update("organizerDescription", value)} /></div>
        </FormSection>

        <FormSection eyebrow="Make it memorable" title="Media">
          <div className="space-y-4">
            <Field label="Cover image URL" placeholder="HTTPS image URL" value={form.coverImage} onChange={(value) => update("coverImage", value)} />
            <Field label="Gallery image URLs" placeholder="Separate HTTPS image URLs with commas" value={form.galleryImages} onChange={(value) => update("galleryImages", value)} />
          </div>
        </FormSection>
      </div>

      <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <FormSection eyebrow="Make it count" title="Ticket types">
          <div className="space-y-3">
            {tickets.map((ticket, index) => <div className="rounded-2xl border border-[#e1e5df] bg-[#fafbf9] p-4" key={ticket.id ?? `new-${index}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#89938b]">Ticket {index + 1}</span>{ticket.id && <p className="mt-1 text-[10px] text-[#89938b]">{ticket.availableQuantity} available · {ticket.reservedQuantity} reserved</p>}</div>
                {tickets.length > 1 && <button aria-label={`Remove ticket ${index + 1}`} className="text-[#9aa39b] hover:text-[#d95742]" onClick={() => setTickets((current) => current.filter((_, ticketIndex) => ticketIndex !== index))} type="button"><X size={14} /></button>}
              </div>
              <div className="space-y-3">
                <Field label="Ticket name" placeholder="General admission" value={ticket.name} onChange={(value) => updateTicket(index, "name", value)} />
                <Field label="Description" placeholder="What this ticket includes" value={ticket.description} onChange={(value) => updateTicket(index, "description", value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price (INR)" inputMode="decimal" placeholder="0" value={ticket.price} onChange={(value) => updateTicket(index, "price", value)} />
                  <Field label="Total quantity" inputMode="numeric" placeholder="100" value={ticket.quantity} onChange={(value) => updateTicket(index, "quantity", value)} />
                  <Field label="Min/order" inputMode="numeric" placeholder="1" value={ticket.minPerOrder} onChange={(value) => updateTicket(index, "minPerOrder", value)} />
                  <Field label="Max/order" inputMode="numeric" placeholder="8" value={ticket.maxPerOrder} onChange={(value) => updateTicket(index, "maxPerOrder", value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <Field label="Sales start" type="datetime-local" value={ticket.salesStart} onChange={(value) => updateTicket(index, "salesStart", value)} />
                  <Field label="Sales end" type="datetime-local" value={ticket.salesEnd} onChange={(value) => updateTicket(index, "salesEnd", value)} />
                </div>
                <SelectField label="Ticket status" value={ticket.status} options={ticketStatusOptions} onChange={(value) => updateTicket(index, "status", value as TicketStatus)} />
              </div>
            </div>)}
          </div>
          <button className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#e15f49] hover:text-[#242725]" onClick={() => setTickets((current) => [...current, emptyTicket()])} type="button"><Plus size={14} /> Add another ticket type</button>
          {editing && <p className="mt-4 rounded-xl bg-[#fff8e9] px-3 py-2.5 text-[10px] leading-4 text-[#92702d]">Reserved tickets are protected. Increasing capacity adds availability; lowering it cannot go below tickets already reserved.</p>}
        </FormSection>

        <FormSection eyebrow="Visibility" title="Publishing controls">
          <div className="space-y-4">
            <SelectField label="Event status" value={form.status} options={eventStatusOptions} onChange={(value) => update("status", value as EventStatus)} />
            <label className="flex items-start gap-3 rounded-xl border border-[#e1e5df] bg-[#fafbf9] p-3.5"><input checked={form.featured} className="mt-0.5 h-4 w-4 accent-[#f16d55]" onChange={(event) => update("featured", event.target.checked)} type="checkbox" /><span><span className="block text-[11px] font-semibold">Feature this event</span><span className="mt-1 block text-[10px] leading-4 text-[#89938b]">Show it prominently in the public event catalog.</span></span></label>
          </div>
        </FormSection>

        <section className="rounded-[20px] border border-[#e1e5df] bg-[#202321] p-5 text-white sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">{editing ? "Save checklist" : "Publishing checklist"}</p>
          <div className="mt-5 space-y-4"><ChecklistItem label="Event details" done={ready} /><ChecklistItem label="Ticket inventory" done={ticketReady} /><ChecklistItem label="Cover image" done={Boolean(form.coverImage)} /></div>
          {notice && <p className="mt-5 rounded-xl bg-[#fbe5e0] px-4 py-3 text-[11px] font-semibold text-[#bb503e]">{notice}</p>}
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f16d55] px-4 py-3 text-[11px] font-bold text-[#242725] hover:bg-white disabled:opacity-50" disabled={saving || loading} type="submit">{saving ? "Saving…" : editing ? "Save changes" : "Create event"} {editing ? <Save size={14} /> : <ArrowUpRight size={14} />}</button>
        </section>
        <AdminActionLink href="/admin/payment-qr">Connect a payment QR</AdminActionLink>
      </div>
    </form>
  </AdminShell>;
}

function FormSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <section className="rounded-[20px] border border-[#e1e5df] bg-white p-5 sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e15f49]">{eyebrow}</p><h2 className="mt-2 text-[20px] font-semibold tracking-[-0.045em]">{title}</h2><div className="mt-6">{children}</div></section>; }

function Field({ label, placeholder, value, onChange, textarea = false, type = "text", icon, inputMode }: { label: string; placeholder?: string; value: string; onChange: (value: string) => void; textarea?: boolean; type?: string; icon?: ReactNode; inputMode?: "decimal" | "numeric" }) { return <label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">{label}</span><span className="relative block">{textarea ? <textarea className="min-h-[106px] w-full resize-y rounded-xl border border-[#e1e5df] bg-[#fafbf9] px-3 py-3 text-[12px] outline-none placeholder:text-[#a0a8a1] focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} /> : <><input className={`w-full rounded-xl border border-[#e1e5df] bg-[#fafbf9] py-3 text-[12px] outline-none placeholder:text-[#a0a8a1] focus:border-[#f16d55] ${icon ? "pl-9 pr-3" : "px-3"}`} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938b]">{icon}</span>}</>}</span></label>; }

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) { return <label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">{label}</span><select className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3 text-[12px] outline-none focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} value={value}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }

function ChecklistItem({ label, done }: { label: string; done: boolean }) { return <div className="flex items-center gap-3 text-[11px]"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${done ? "bg-[#dfe8d9] text-[#5f7659]" : "border border-white/20 text-white/35"}`}>{done ? "✓" : ""}</span><span className={done ? "text-white/75" : "text-white/40"}>{label}</span></div>; }
