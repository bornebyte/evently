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

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const queryRange = new URL(request.url).searchParams.get("range") as Range | null;
  const range: Range = queryRange === "Last 90 days" || queryRange === "This year" ? queryRange : "Last 30 days";
  const now = new Date();
  const start = rangeStart(range, now);
  const previousStart = new Date(start.getTime() - (now.getTime() - start.getTime()));

  const [allBookings, periodBookings, previousBookings, eventRows] = await Promise.all([
    prisma.booking.findMany({ select: { status: true } }),
    prisma.booking.findMany({ where: { status: "CONFIRMED", bookedAt: { gte: start } }, select: { total: true, attendeeEmail: true, bookedAt: true, event: { select: { city: true } }, items: { select: { quantity: true } } } }),
    prisma.booking.findMany({ where: { status: "CONFIRMED", bookedAt: { gte: previousStart, lt: start } }, select: { total: true, items: { select: { quantity: true } } } }),
    prisma.event.findMany({ orderBy: { startAt: "asc" }, select: { id: true, title: true, category: true, ticketTypes: { select: { totalQuantity: true, availableQuantity: true } }, bookings: { where: { status: "CONFIRMED" }, select: { total: true, items: { select: { quantity: true } } } } } }),
  ]);

  const currentRevenue = periodBookings.reduce((sum, booking) => sum + Number(booking.total), 0);
  const previousRevenue = previousBookings.reduce((sum, booking) => sum + Number(booking.total), 0);
  const ticketSales = periodBookings.reduce((sum, booking) => sum + booking.items.reduce((total, item) => total + item.quantity, 0), 0);
  const previousTickets = previousBookings.reduce((sum, booking) => sum + booking.items.reduce((total, item) => total + item.quantity, 0), 0);
  const confirmedCount = allBookings.filter((booking) => booking.status === "CONFIRMED").length;
  const refundCount = allBookings.filter((booking) => booking.status === "REFUNDED").length;
  const audienceCounts = periodBookings.reduce<Record<string, number>>((result, booking) => { result[booking.event.city] = (result[booking.event.city] ?? 0) + 1; return result; }, {});
  const audienceTotal = periodBookings.length;
  const attendeeCounts = periodBookings.reduce<Record<string, number>>((result, booking) => { result[booking.attendeeEmail] = (result[booking.attendeeEmail] ?? 0) + 1; return result; }, {});

  const points = Array.from({ length: 12 }, (_, index) => {
    const pointStart = new Date(start.getTime() + ((now.getTime() - start.getTime()) * index) / 12);
    const pointEnd = new Date(start.getTime() + ((now.getTime() - start.getTime()) * (index + 1)) / 12);
    const value = periodBookings.filter((booking) => booking.bookedAt >= pointStart && (index === 11 ? booking.bookedAt <= pointEnd : booking.bookedAt < pointEnd)).reduce((sum, booking) => sum + Number(booking.total), 0);
    return { label: pointStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), value };
  });

  return NextResponse.json({
    hasData: allBookings.length > 0 || eventRows.length > 0,
    metrics: {
      revenue: currentRevenue,
      revenueChange: change(currentRevenue, previousRevenue),
      ticketSales,
      ticketSalesChange: change(ticketSales, previousTickets),
      conversionRate: allBookings.length ? (confirmedCount / allBookings.length) * 100 : 0,
      refundRate: allBookings.length ? (refundCount / allBookings.length) * 100 : 0,
    },
    chart: points,
    performance: eventRows.map((event) => {
      const capacity = event.ticketTypes.reduce((sum, ticket) => sum + ticket.totalQuantity, 0);
      const sold = event.bookings.reduce((sum, booking) => sum + booking.items.reduce((total, item) => total + item.quantity, 0), 0);
      const revenue = event.bookings.reduce((sum, booking) => sum + Number(booking.total), 0);
      return { name: event.title, category: event.category, sold, capacity, revenue, progress: capacity ? (sold / capacity) * 100 : 0 };
    }),
    audience: Object.entries(audienceCounts).sort(([, a], [, b]) => b - a).map(([city, count]) => ({ city, count, percentage: audienceTotal ? (count / audienceTotal) * 100 : 0 })),
    repeatAttendees: Object.values(attendeeCounts).filter((count) => count > 1).length,
    audienceTotal,
  });
}

function change(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}
