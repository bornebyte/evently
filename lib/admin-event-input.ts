export const eventStatuses = ["DRAFT", "PUBLISHED", "SOLD_OUT", "ARCHIVED"] as const;
export type EventStatusValue = (typeof eventStatuses)[number];

export const ticketStatuses = ["ACTIVE", "PAUSED", "SOLD_OUT"] as const;
export type TicketStatusValue = (typeof ticketStatuses)[number];

export type NormalizedTicketInput = {
  id?: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStart: Date | null;
  salesEnd: Date | null;
  status: TicketStatusValue;
};

export type NormalizedEventInput = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  galleryImages: string[];
  startAt: Date;
  endAt: Date;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  mapEmbedUrl: string | null;
  organizerName: string;
  organizerDescription: string | null;
  organizerEmail: string;
  organizerPhone: string | null;
  organizerWebsite: string | null;
  featured: boolean;
  status: EventStatusValue;
  ticketTypes: NormalizedTicketInput[];
};

export class EventInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventInputError";
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new EventInputError("Please send valid event details.");
  return value as Record<string, unknown>;
}

function requiredString(body: Record<string, unknown>, key: string, label: string) {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) throw new EventInputError(`Enter the ${label}.`);
  return value.trim();
}

function optionalString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArray(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new EventInputError(`Use a list of values for ${key}.`);
  return value.map((item) => item.trim()).filter(Boolean);
}

function dateValue(value: unknown, label: string, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new EventInputError(`Choose the ${label}.`);
    return null;
  }
  if (typeof value !== "string") throw new EventInputError(`Choose a valid ${label}.`);
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new EventInputError(`Choose a valid ${label}.`);
  return date;
}

function numberValue(value: unknown, label: string, options: { integer?: boolean; min?: number; max?: number } = {}) {
  const number = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
  if (!Number.isFinite(number) || (options.integer && !Number.isInteger(number)) || (options.min !== undefined && number < options.min) || (options.max !== undefined && number > options.max)) {
    throw new EventInputError(`Enter a valid ${label}.`);
  }
  return number;
}

function optionalCoordinate(body: Record<string, unknown>, key: "latitude" | "longitude") {
  const value = body[key];
  if (value === undefined || value === null || value === "") return null;
  return numberValue(value, key, { min: key === "latitude" ? -90 : -180, max: key === "latitude" ? 90 : 180 });
}

function optionalMapEmbedUrl(body: Record<string, unknown>) {
  const value = optionalString(body, "mapEmbedUrl");
  if (!value) return null;
  const iframeSource = value.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  const rawUrl = (iframeSource ?? value).replaceAll("&amp;", "&");
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new EventInputError("Paste the Google Maps embed URL or the complete iframe code from Google Maps.");
  }
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || !(hostname === "google.com" || hostname.endsWith(".google.com")) || !url.pathname.startsWith("/maps/")) {
    if (hostname === "maps.app.goo.gl") throw new EventInputError("That maps.app.goo.gl link is a share link. In Google Maps choose Share → Embed a map, then paste the complete iframe code here.");
    throw new EventInputError("Use the Google Maps embed URL or complete iframe code from Share → Embed a map.");
  }
  return url.toString();
}

function normalizeTicket(value: unknown, index: number): NormalizedTicketInput {
  const ticket = objectValue(value);
  const id = typeof ticket.id === "string" && ticket.id.trim() ? ticket.id.trim() : undefined;
  const name = requiredString(ticket, "name", `ticket ${index + 1} name`);
  const price = numberValue(ticket.price, `price for ticket ${index + 1}`, { min: 0 });
  const quantity = numberValue(ticket.quantity, `quantity for ticket ${index + 1}`, { integer: true, min: 1 });
  const minPerOrder = numberValue(ticket.minPerOrder ?? 1, `minimum order for ticket ${index + 1}`, { integer: true, min: 1 });
  const maxPerOrder = numberValue(ticket.maxPerOrder ?? 8, `maximum order for ticket ${index + 1}`, { integer: true, min: minPerOrder });
  const salesStart = dateValue(ticket.salesStart, `ticket ${index + 1} sales start`);
  const salesEnd = dateValue(ticket.salesEnd, `ticket ${index + 1} sales end`);
  if (salesStart && salesEnd && salesEnd <= salesStart) throw new EventInputError(`Ticket ${index + 1} sales end must be after its sales start.`);
  const status = ticket.status === undefined ? "ACTIVE" : ticketStatuses.includes(ticket.status as TicketStatusValue) ? ticket.status as TicketStatusValue : null;
  if (!status) throw new EventInputError(`Choose a valid status for ticket ${index + 1}.`);

  return { id, name, description: typeof ticket.description === "string" && ticket.description.trim() ? ticket.description.trim() : null, price, quantity, minPerOrder, maxPerOrder, salesStart, salesEnd, status };
}

export function normalizeEventInput(value: unknown): NormalizedEventInput {
  const body = objectValue(value);
  const startAt = dateValue(body.startAt, "event start", true)!;
  const endAt = dateValue(body.endAt, "event end", true)!;
  if (endAt <= startAt) throw new EventInputError("Choose a schedule with an end after the start.");
  const rawTickets = body.ticketTypes;
  if (!Array.isArray(rawTickets) || rawTickets.length === 0) throw new EventInputError("Add at least one ticket type.");
  const ticketTypes = rawTickets.map((ticket, index) => normalizeTicket(ticket, index));
  const ids = ticketTypes.map((ticket) => ticket.id).filter((id): id is string => Boolean(id));
  if (new Set(ids).size !== ids.length) throw new EventInputError("Each ticket type can only appear once.");

  const status = body.status === undefined ? "DRAFT" : eventStatuses.includes(body.status as EventStatusValue) ? body.status as EventStatusValue : null;
  if (!status) throw new EventInputError("Choose a valid event status.");

  return {
    title: requiredString(body, "title", "event title"),
    slug: requiredString(body, "slug", "URL slug").toLowerCase(),
    shortDescription: requiredString(body, "shortDescription", "short description"),
    description: requiredString(body, "description", "full description"),
    category: requiredString(body, "category", "category"),
    tags: stringArray(body, "tags"),
    coverImage: requiredString(body, "coverImage", "cover image URL"),
    galleryImages: stringArray(body, "galleryImages"),
    startAt,
    endAt,
    timezone: typeof body.timezone === "string" && body.timezone.trim() ? body.timezone.trim() : "UTC",
    venueName: requiredString(body, "venueName", "venue name"),
    address: requiredString(body, "address", "address"),
    city: requiredString(body, "city", "city"),
    state: optionalString(body, "state"),
    country: requiredString(body, "country", "country"),
    postalCode: optionalString(body, "postalCode"),
    latitude: optionalCoordinate(body, "latitude"),
    longitude: optionalCoordinate(body, "longitude"),
    mapEmbedUrl: optionalMapEmbedUrl(body),
    organizerName: requiredString(body, "organizerName", "organizer name"),
    organizerDescription: optionalString(body, "organizerDescription"),
    organizerEmail: requiredString(body, "organizerEmail", "organizer email").toLowerCase(),
    organizerPhone: optionalString(body, "organizerPhone"),
    organizerWebsite: optionalString(body, "organizerWebsite"),
    featured: typeof body.featured === "boolean" ? body.featured : false,
    status,
    ticketTypes,
  };
}
