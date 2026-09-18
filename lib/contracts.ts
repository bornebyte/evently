export type PublicTicketTier = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  totalQuantity: number;
  availableQuantity: number;
  maxPerOrder: number;
};

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
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
  featured: boolean;
  organizer: {
    name: string;
    description: string | null;
    email: string;
    phone: string | null;
    website: string | null;
  };
  ticketTiers: PublicTicketTier[];
  price: number | null;
  priceLabel: string | null;
  date: string;
  dateLong: string;
  time: string;
  month: string;
  day: string;
};

export type PublicCategory = { name: string; count: number };

export type PublicBooking = {
  reference: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketToken: string;
  total: number;
  currency: string;
  status: string;
  bookedAt: string;
  event: Pick<PublicEvent, "slug" | "title" | "category" | "startAt" | "endAt" | "venueName" | "address" | "city">;
  ticket: string;
  quantity: number;
};
