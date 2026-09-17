import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";
import { events } from "../lib/events.ts";

neonConfig.webSocketConstructor = ws;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: databaseUrl }) });
const adminEmail = process.env.INITIAL_ADMIN_EMAIL ?? "admin@evently.com";
const adminPassword = process.env.INITIAL_ADMIN_PASSWORD ?? "admin";

try {
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword, name: "Evently Admin", role: "ADMIN" },
    create: { email: adminEmail, password: adminPassword, name: "Evently Admin", role: "ADMIN" },
  });

  const existingOrganizer = await prisma.organizer.findFirst({ where: { email: "hello@fieldnotes.events" } });
  const organizer = existingOrganizer ?? await prisma.organizer.create({ data: { name: "Field Notes", email: "hello@fieldnotes.events", description: "Independent event studio", phone: "+91 98765 43210" } });
  if (existingOrganizer) await prisma.organizer.update({ where: { id: existingOrganizer.id }, data: { name: "Field Notes", description: "Independent event studio", phone: "+91 98765 43210" } });

  for (const event of events) {
    const savedEvent = await prisma.event.upsert({
      where: { slug: event.slug },
      update: { title: event.title, shortDescription: event.shortDescription, description: event.description, category: event.category, coverImage: event.image, startAt: new Date(event.date), endAt: new Date(event.date), venueName: event.location, address: "Bandra Kurla Complex, Mumbai", city: event.city, featured: event.featured ?? false, status: "PUBLISHED" },
      create: { slug: event.slug, title: event.title, shortDescription: event.shortDescription, description: event.description, category: event.category, tags: [event.category], coverImage: event.image, galleryImages: [], startAt: new Date(event.date), endAt: new Date(event.date), venueName: event.location, address: "Bandra Kurla Complex, Mumbai", city: event.city, featured: event.featured ?? false, status: "PUBLISHED", organizerId: organizer.id },
    });

    await prisma.ticketType.deleteMany({ where: { eventId: savedEvent.id } });
    await prisma.ticketType.createMany({ data: event.ticketTiers.map((ticket) => ({ eventId: savedEvent.id, name: ticket.name, description: ticket.description, price: ticket.price, currency: "INR", totalQuantity: ticket.total, availableQuantity: ticket.remaining, maxPerOrder: 8, status: "ACTIVE" })) });
    await prisma.paymentQr.upsert({ where: { eventId: savedEvent.id }, update: { label: "Field Notes Events", payload: "upi://pay?pa=fieldnotes@upi&pn=Field%20Notes%20Events", isActive: true }, create: { eventId: savedEvent.id, label: "Field Notes Events", payload: "upi://pay?pa=fieldnotes@upi&pn=Field%20Notes%20Events", isActive: true } });
  }

  console.log(`Seeded ${adminEmail} and ${events.length} events.`);
} finally {
  await prisma.$disconnect();
}
