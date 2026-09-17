export type TicketTier = {
  name: string;
  description: string;
  price: number;
  remaining: number;
  total: number;
  accent: string;
};

export type EventItem = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  location: string;
  city: string;
  date: string;
  dateLong: string;
  time: string;
  month: string;
  day: string;
  image: string;
  price: number;
  priceLabel: string;
  attendees: string;
  organizer: string;
  organizerRole: string;
  featured?: boolean;
  tag?: string;
  palette: string;
  ticketTiers: TicketTier[];
  capacity: number;
  sold: number;
};

export const categories = [
  { name: "Music", count: "128 events", color: "bg-[#f7ded7]", symbol: "♪" },
  { name: "Wellness", count: "64 events", color: "bg-[#dfe8d9]", symbol: "✦" },
  { name: "Food & drink", count: "82 events", color: "bg-[#e8e1ef]", symbol: "◒" },
  { name: "Ideas & tech", count: "96 events", color: "bg-[#eee5c8]", symbol: "⌁" },
  { name: "Arts & culture", count: "57 events", color: "bg-[#d9e4ed]", symbol: "✺" },
];

export const events: EventItem[] = [
  {
    slug: "future-of-making",
    title: "The future of making",
    shortDescription: "A day of ideas, craft and the people building what comes next.",
    description: "A full-day gathering for curious people who make things happen. Hear from the designers, founders and artists shaping a more human future — then stay for a long-table dinner with your new favourite people.",
    category: "Ideas & tech",
    location: "Jio World Convention Centre",
    city: "Mumbai, India",
    date: "May 18, 2025",
    dateLong: "Sunday, 18 May 2025",
    time: "10:00 AM – 6:00 PM",
    month: "MAY",
    day: "18",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85",
    price: 1800,
    priceLabel: "From ₹1,800",
    attendees: "2.4k going",
    organizer: "Field Notes",
    organizerRole: "Independent event studio",
    featured: true,
    tag: "Editor’s pick",
    palette: "#dfe8d9",
    capacity: 800,
    sold: 612,
    ticketTiers: [
      { name: "General admission", description: "Full day access + lunch", price: 1800, remaining: 188, total: 500, accent: "#202321" },
      { name: "Front row", description: "Priority seating + dinner", price: 3200, remaining: 42, total: 150, accent: "#f16d55" },
      { name: "Student", description: "Valid student ID required", price: 950, remaining: 28, total: 150, accent: "#8b779f" },
    ],
  },
  {
    slug: "midnight-in-montreal",
    title: "Midnight in Montréal",
    shortDescription: "An all-night celebration of jazz, light and late-night energy.",
    description: "Follow the blue hour through a city-inspired night of live jazz, analogue projections and unexpected collaborations. Come for one set, stay until the lights come up.",
    category: "Music",
    location: "antiSOCIAL",
    city: "Mumbai, India",
    date: "Jun 06, 2025",
    dateLong: "Friday, 6 June 2025",
    time: "8:00 PM – 1:00 AM",
    month: "JUN",
    day: "06",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=85",
    price: 850,
    priceLabel: "From ₹850",
    attendees: "1.8k going",
    organizer: "After Dark",
    organizerRole: "Nightlife & music collective",
    tag: "Selling fast",
    palette: "#e8e3ef",
    capacity: 1200,
    sold: 948,
    ticketTiers: [
      { name: "Early bird", description: "Entry before 10 PM", price: 850, remaining: 31, total: 400, accent: "#202321" },
      { name: "Standard", description: "All-night entry", price: 1100, remaining: 252, total: 650, accent: "#f16d55" },
    ],
  },
  {
    slug: "the-great-table",
    title: "The great table",
    shortDescription: "A slow Sunday lunch with brilliant cooks and new friends.",
    description: "A long-table lunch celebrating the local growers, bakers and makers that make a neighbourhood sing. A changing menu, good wine, and no rush to leave.",
    category: "Food & drink",
    location: "The Bombay Canteen",
    city: "Mumbai, India",
    date: "Jun 14, 2025",
    dateLong: "Saturday, 14 June 2025",
    time: "12:30 PM – 4:00 PM",
    month: "JUN",
    day: "14",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=85",
    price: 2700,
    priceLabel: "From ₹2,700",
    attendees: "168 going",
    organizer: "Common Table",
    organizerRole: "Food culture & community",
    featured: true,
    palette: "#eee5c8",
    capacity: 220,
    sold: 168,
    ticketTiers: [
      { name: "A seat at the table", description: "Five course lunch + welcome drink", price: 2700, remaining: 52, total: 220, accent: "#f16d55" },
    ],
  },
  {
    slug: "slow-sunday-club",
    title: "Slow Sunday Club",
    shortDescription: "A gentle morning to reset, move and make space for the week.",
    description: "A low-pressure morning of yoga, guided journaling, seasonal breakfast and the kind of conversation that leaves you feeling lighter.",
    category: "Wellness",
    location: "The Yoga Institute",
    city: "Mumbai, India",
    date: "Jun 22, 2025",
    dateLong: "Sunday, 22 June 2025",
    time: "9:00 AM – 12:30 PM",
    month: "JUN",
    day: "22",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=85",
    price: 1200,
    priceLabel: "From ₹1,200",
    attendees: "92 going",
    organizer: "Good Company",
    organizerRole: "Wellbeing for busy people",
    palette: "#dfe8d9",
    capacity: 140,
    sold: 92,
    ticketTiers: [
      { name: "Slow Sunday pass", description: "Workshop + breakfast", price: 1200, remaining: 48, total: 140, accent: "#8aa17e" },
    ],
  },
  {
    slug: "kinetic-light",
    title: "Kinetic light",
    shortDescription: "An immersive late-night exhibition of light, sound and movement.",
    description: "Step into a living canvas. Kinetic Light brings together six artists working across projection, sound and movement for an exhibition you experience from the inside.",
    category: "Arts & culture",
    location: "Nita Mukesh Ambani Cultural Centre",
    city: "Mumbai, India",
    date: "Jul 03, 2025",
    dateLong: "Thursday, 3 July 2025",
    time: "6:30 PM – 10:30 PM",
    month: "JUL",
    day: "03",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=85",
    price: 1450,
    priceLabel: "From ₹1,450",
    attendees: "640 going",
    organizer: "Signal House",
    organizerRole: "Contemporary culture platform",
    featured: true,
    tag: "New",
    palette: "#d9e4ed",
    capacity: 900,
    sold: 640,
    ticketTiers: [
      { name: "Timed entry", description: "One-hour arrival window", price: 1450, remaining: 260, total: 900, accent: "#536f84" },
    ],
  },
  {
    slug: "night-shift-radio",
    title: "Night Shift Radio",
    shortDescription: "A live broadcast, dancefloor and love letter to the underground.",
    description: "The studio doors are open. Expect live radio, two rooms of DJs, and a dancefloor that refuses to call it a night.",
    category: "Music",
    location: "The Stables",
    city: "Mumbai, India",
    date: "Jul 12, 2025",
    dateLong: "Saturday, 12 July 2025",
    time: "9:00 PM – 3:00 AM",
    month: "JUL",
    day: "12",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1000&q=85",
    price: 750,
    priceLabel: "From ₹750",
    attendees: "2.1k going",
    organizer: "Night Shift",
    organizerRole: "Independent radio & events",
    palette: "#f7ded7",
    capacity: 1500,
    sold: 1210,
    ticketTiers: [
      { name: "Advance", description: "Entry all night", price: 750, remaining: 182, total: 500, accent: "#202321" },
      { name: "On the door", description: "Subject to availability", price: 1000, remaining: 108, total: 1000, accent: "#f16d55" },
    ],
  },
];

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
