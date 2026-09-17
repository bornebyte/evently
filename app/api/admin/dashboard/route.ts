import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

type Range = "Last 30 days" | "Last 90 days" | "This year";

function rangeStart(range: Range, now = new Date()) {
  if (range === "This year") return new Date(now.getFullYear(), 0, 1);
  const start = new Date(now);
  start.setDate(start.getDate() - (range === "Last 90 days" ? 90 : 30));
  return start;
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const requestedRange = url.searchParams.get("range") as Range | null;
  const range: Range = requestedRange === "Last 90 days" || requestedRange === "This year" ? requestedRange : "Last 30 days";
  const now = new Date();
  const start = rangeStart(range, now);

  const [revenue, ticketsSold, activeEvents, bookings, recentBookings, periodBookings, confirmedAttendees] = await Promise.all([
    prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { total: true } }),
    prisma.bookingItem.aggregate({ where: { booking: { status: "CONFIRMED" } }, _sum: { quantity: true } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.booking.findMany({ select: { status: true, attendeeEmail: true } }),
    prisma.booking.findMany({ orderBy: { bookedAt: "desc" }, take: 6, include: { event: { select: { title: true } }, items: { include: { ticketType: { select: { name: true } } } } } }),
    prisma.booking.findMany({ where: { status: "CONFIRMED", bookedAt: { gte: start } }, select: { total: true, bookedAt: true } }),
    prisma.booking.findMany({ where: { status: "CONFIRMED" }, select: { attendeeEmail: true } }),
  ]);

  const revenueValue = Number(revenue._sum.total ?? 0);
  const ticketsValue = ticketsSold._sum.quantity ?? 0;
  const statusCount = bookings.reduce<Record<string, number>>((result, booking) => { result[booking.status] = (result[booking.status] ?? 0) + 1; return result; }, {});
  const emailCounts = confirmedAttendees.reduce<Record<string, number>>((result, booking) => { result[booking.attendeeEmail] = (result[booking.attendeeEmail] ?? 0) + 1; return result; }, {});
  const repeatAttendees = Object.values(emailCounts).filter((count) => count > 1).length;

  const points = Array.from({ length: 12 }, (_, index) => {
    const pointStart = new Date(start.getTime() + ((now.getTime() - start.getTime()) * index) / 12);
    const pointEnd = new Date(start.getTime() + ((now.getTime() - start.getTime()) * (index + 1)) / 12);
    const value = periodBookings.filter((booking) => booking.bookedAt >= pointStart && (index === 11 ? booking.bookedAt <= pointEnd : booking.bookedAt < pointEnd)).reduce((sum, booking) => sum + Number(booking.total), 0);
    return { label: pointStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value };
  });

  return NextResponse.json({
    admin: { name: admin.name, email: admin.email, role: admin.role, initials: initials(admin.name) },
    hasData: bookings.length > 0 || activeEvents > 0,
    stats: { revenue: revenueValue, ticketsSold: ticketsValue, activeEvents, averageTicketValue: ticketsValue ? revenueValue / ticketsValue : 0 },
    health: { sellThrough: await sellThrough(), bookingConversion: bookings.length ? ((statusCount.CONFIRMED ?? 0) / bookings.length) * 100 : 0, repeatAttendees: confirmedAttendees.length ? (repeatAttendees / new Set(confirmedAttendees.map((booking) => booking.attendeeEmail)).size) * 100 : 0 },
    chart: points,
    recentBookings: recentBookings.map((booking) => ({ name: booking.attendeeName, initials: initials(booking.attendeeName), event: booking.event.title, ticket: booking.items[0]?.ticketType.name ?? "Ticket", amount: Number(booking.total), status: booking.status, reference: booking.reference })),
  });
}

async function sellThrough() {
  const inventory = await prisma.ticketType.aggregate({ _sum: { totalQuantity: true, availableQuantity: true } });
  const total = inventory._sum.totalQuantity ?? 0;
  return total ? ((total - (inventory._sum.availableQuantity ?? 0)) / total) * 100 : 0;
}
