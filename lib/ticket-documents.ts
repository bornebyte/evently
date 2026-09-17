import QRCode from "qrcode";
import { PDFDocument, PDFImage, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 42;

const palette = {
  ink: rgb(0.13, 0.14, 0.14),
  muted: rgb(0.42, 0.46, 0.43),
  softMuted: rgb(0.57, 0.6, 0.57),
  coral: rgb(0.95, 0.43, 0.33),
  coralDark: rgb(0.78, 0.26, 0.19),
  sage: rgb(0.9, 0.94, 0.88),
  sageDark: rgb(0.36, 0.46, 0.34),
  lavender: rgb(0.91, 0.89, 0.94),
  paper: rgb(0.97, 0.97, 0.95),
  white: rgb(1, 1, 1),
  line: rgb(0.87, 0.89, 0.86),
  paleLine: rgb(0.93, 0.94, 0.92),
};

type DateValue = Date | string;

export type TicketDocumentItem = {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
};

export type BookingDocumentPayload = {
  reference: string;
  ticketToken: string;
  attendeeName: string;
  attendeeEmail: string;
  phone: string;
  eventTitle: string;
  eventCategory: string;
  eventDescription?: string | null;
  eventStartAt: DateValue;
  eventEndAt: DateValue;
  eventTimezone: string;
  venueName: string;
  address: string;
  city: string;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  organizerName?: string | null;
  organizerEmail?: string | null;
  organizerPhone?: string | null;
  organizerWebsite?: string | null;
  items: TicketDocumentItem[];
  total: number;
  currency: string;
  paymentReference: string;
  bookedAt: DateValue;
  verifiedAt?: DateValue | null;
  ticketUrl: string;
};

type Fonts = {
  regular: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
  oblique: PDFFont;
};

type PdfContext = {
  document: PDFDocument;
  page: PDFPage;
  fonts: Fonts;
};

function safeText(value: unknown) {
  return String(value ?? "")
    .replace(/₹/g, "INR ")
    .replace(/[—–]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[×]/g, "x")
    .replace(/[·•]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "?");
}

function toDate(value: DateValue | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: DateValue | null | undefined, timezone: string, includeWeekday = true) {
  const date = toDate(value);
  if (!date) return "Date unavailable";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
      weekday: includeWeekday ? "long" : undefined,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString("en-IN", { dateStyle: includeWeekday ? "full" : "long" });
  }
}

function formatTime(value: DateValue | null | undefined, timezone: string) {
  const date = toDate(value);
  if (!date) return "Time unavailable";
  try {
    return new Intl.DateTimeFormat("en-IN", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(date);
  } catch {
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
}

function formatTimeRange(payload: BookingDocumentPayload) {
  const start = formatTime(payload.eventStartAt, payload.eventTimezone);
  const end = formatTime(payload.eventEndAt, payload.eventTimezone);
  return end !== "Time unavailable" && end !== start ? `${start} - ${end}` : start;
}

function formatDateTime(value: DateValue | null | undefined, timezone: string) {
  const date = toDate(value);
  if (!date) return "Not available";
  try {
    return new Intl.DateTimeFormat("en-IN", { timeZone: timezone, dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }
}

function formatMoney(amount: number, currency: string) {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", currencyDisplay: "code", minimumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency || "INR"} ${value.toFixed(2)}`;
  }
}

function eventAddress(payload: BookingDocumentPayload) {
  return [payload.address, payload.city, payload.state, payload.postalCode, payload.country].filter(Boolean).join(", ");
}

function wrapLines(value: unknown, font: PDFFont, size: number, maxWidth: number) {
  const paragraphs = safeText(value).split(/\r?\n/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawWrapped(ctx: PdfContext, value: unknown, x: number, topY: number, maxWidth: number, size: number, font: PDFFont, color = palette.muted, lineHeight = size * 1.35, maxLines = 8) {
  let lines = wrapLines(value, font, size, maxWidth);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines.at(-1) ?? "";
    lines[lines.length - 1] = `${last.replace(/\.{3}$/, "")}...`;
  }
  lines.forEach((line, index) => {
    ctx.page.drawText(line, { x, y: topY - index * lineHeight, size, font, color });
  });
  return topY - lines.length * lineHeight;
}

function drawRight(ctx: PdfContext, value: unknown, rightX: number, y: number, size: number, font: PDFFont, color = palette.ink) {
  const text = safeText(value);
  ctx.page.drawText(text, { x: rightX - font.widthOfTextAtSize(text, size), y, size, font, color });
}

function drawBox(page: PDFPage, x: number, y: number, width: number, height: number, color = palette.white, borderColor?: typeof palette.line) {
  page.drawRectangle({ x, y, width, height, color, borderColor, borderWidth: borderColor ? 1 : 0 });
}

function drawLabel(ctx: PdfContext, value: string, x: number, y: number, color = palette.softMuted) {
  ctx.page.drawText(safeText(value).toUpperCase(), { x, y, size: 7.5, font: ctx.fonts.bold, color });
}

function drawPill(ctx: PdfContext, value: string, x: number, y: number, background = palette.sage, foreground = palette.sageDark) {
  const text = safeText(value).toUpperCase();
  const width = ctx.fonts.bold.widthOfTextAtSize(text, 7.5) + 18;
  ctx.page.drawRectangle({ x, y, width, height: 21, color: background });
  ctx.page.drawText(text, { x: x + 9, y: y + 7, size: 7.5, font: ctx.fonts.bold, color: foreground });
  return width;
}

function drawDashedLine(page: PDFPage, x1: number, x2: number, y: number, color = palette.line) {
  for (let x = x1; x < x2; x += 10) page.drawLine({ start: { x, y }, end: { x: Math.min(x + 5, x2), y }, thickness: 1, color });
}

async function createContext(title: string, author: string) {
  const document = await PDFDocument.create();
  document.setTitle(title);
  document.setAuthor(author);
  document.setCreator("evently");
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fonts: Fonts = {
    regular: await document.embedFont(StandardFonts.Helvetica),
    bold: await document.embedFont(StandardFonts.HelveticaBold),
    mono: await document.embedFont(StandardFonts.Courier),
    oblique: await document.embedFont(StandardFonts.HelveticaOblique),
  };
  return { document, page, fonts } satisfies PdfContext;
}

async function embedQr(document: PDFDocument, value: string) {
  const dataUrl = await QRCode.toDataURL(value, { errorCorrectionLevel: "H", margin: 1, width: 480, color: { dark: "#202321", light: "#ffffff" } });
  const encoded = dataUrl.split(",")[1];
  if (!encoded) throw new Error("Unable to create ticket QR code.");
  return document.embedPng(Buffer.from(encoded, "base64"));
}

function drawQrCard(ctx: PdfContext, qr: PDFImage, x: number, y: number, size: number, caption: string, detail: string) {
  drawBox(ctx.page, x, y, size, size, palette.white);
  ctx.page.drawRectangle({ x: x + 9, y: y + 27, width: size - 18, height: size - 36, color: palette.white });
  ctx.page.drawImage(qr, { x: x + 16, y: y + 30, width: size - 32, height: size - 32 });
  ctx.page.drawText(safeText(caption).toUpperCase(), { x: x + 10, y: y + 12, size: 7, font: ctx.fonts.bold, color: palette.ink });
  ctx.page.drawText(safeText(detail), { x: x + 10, y: y + 3, size: 5.8, font: ctx.fonts.regular, color: palette.softMuted });
}

function drawItemsTable(ctx: PdfContext, payload: BookingDocumentPayload, topY: number, compact = false) {
  const left = MARGIN;
  const right = PAGE_WIDTH - MARGIN;
  const headerHeight = compact ? 25 : 28;
  const rowHeight = compact ? 25 : 28;
  const items = payload.items.length > 0 ? payload.items.slice(0, compact ? 8 : 6) : [{ name: "Ticket", quantity: 1, unitPrice: payload.total }];
  const tableBottom = topY - headerHeight - items.length * rowHeight;

  ctx.page.drawRectangle({ x: left, y: topY - headerHeight, width: right - left, height: headerHeight, color: palette.ink });
  ctx.page.drawText("ITEM", { x: left + 14, y: topY - headerHeight + 9, size: 7, font: ctx.fonts.bold, color: palette.white });
  ctx.page.drawText("QTY", { x: right - 205, y: topY - headerHeight + 9, size: 7, font: ctx.fonts.bold, color: palette.white });
  ctx.page.drawText("UNIT", { x: right - 140, y: topY - headerHeight + 9, size: 7, font: ctx.fonts.bold, color: palette.white });
  ctx.page.drawText("AMOUNT", { x: right - 66, y: topY - headerHeight + 9, size: 7, font: ctx.fonts.bold, color: palette.white });

  items.forEach((item, index) => {
    const rowY = topY - headerHeight - (index + 1) * rowHeight;
    if (index % 2 === 0) ctx.page.drawRectangle({ x: left, y: rowY, width: right - left, height: rowHeight, color: rgb(0.985, 0.987, 0.98) });
    ctx.page.drawLine({ start: { x: left, y: rowY }, end: { x: right, y: rowY }, thickness: 0.6, color: palette.paleLine });
    const itemName = safeText(item.name || "Ticket");
    ctx.page.drawText(itemName.slice(0, 42), { x: left + 14, y: rowY + 10, size: compact ? 8.5 : 9, font: ctx.fonts.bold, color: palette.ink });
    const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
    const unitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
    drawRight(ctx, quantity, right - 177, rowY + 10, compact ? 8.5 : 9, ctx.fonts.regular, palette.muted);
    drawRight(ctx, formatMoney(unitPrice, payload.currency), right - 76, rowY + 10, compact ? 8.5 : 9, ctx.fonts.regular, palette.muted);
    drawRight(ctx, formatMoney(unitPrice * quantity, payload.currency), right - 14, rowY + 10, compact ? 8.5 : 9, ctx.fonts.bold, palette.ink);
  });
  ctx.page.drawRectangle({ x: left, y: tableBottom, width: right - left, height: headerHeight + items.length * rowHeight, borderColor: palette.line, borderWidth: 1 });
  return { tableBottom, itemCount: items.length };
}

export async function makeTicketPdf(payload: BookingDocumentPayload) {
  const ctx = await createContext(`Event ticket - ${payload.reference}`, payload.organizerName || "evently");
  const { page, fonts } = ctx;
  const qr = await embedQr(ctx.document, payload.ticketUrl || payload.ticketToken);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: palette.paper });
  page.drawRectangle({ x: 0, y: 620, width: PAGE_WIDTH, height: 222, color: palette.ink });
  page.drawCircle({ x: 555, y: 795, size: 115, color: palette.coral, opacity: 0.9 });

  page.drawText("evently", { x: MARGIN, y: 792, size: 22, font: fonts.bold, color: palette.white });
  drawLabel(ctx, payload.eventCategory || "Event", MARGIN, 757, palette.coral);
  drawWrapped(ctx, payload.eventTitle, MARGIN, 733, 342, 27, fonts.bold, palette.white, 31, 2);
  page.drawText("CONFIRMED ADMISSION", { x: MARGIN, y: 645, size: 8, font: fonts.bold, color: palette.white });
  drawQrCard(ctx, qr, 408, 649, 145, "Scan at entry", "One-time verified pass");

  drawBox(page, MARGIN, 528, PAGE_WIDTH - MARGIN * 2, 70, palette.white, palette.line);
  drawLabel(ctx, "Date & time", MARGIN + 16, 576);
  page.drawText(formatDate(payload.eventStartAt, payload.eventTimezone), { x: MARGIN + 16, y: 557, size: 11, font: fonts.bold, color: palette.ink });
  page.drawText(`${formatTimeRange(payload)} · ${payload.eventTimezone || "local time"}`, { x: MARGIN + 16, y: 541, size: 8.5, font: fonts.regular, color: palette.muted });
  drawLabel(ctx, "Venue", 230, 576);
  page.drawText(safeText(payload.venueName), { x: 230, y: 557, size: 11, font: fonts.bold, color: palette.ink });
  drawWrapped(ctx, eventAddress(payload), 230, 541, 300, 8.5, fonts.regular, palette.muted, 11, 2);

  drawBox(page, MARGIN, 435, PAGE_WIDTH - MARGIN * 2, 75, palette.sage, palette.line);
  drawLabel(ctx, "Attendee", MARGIN + 16, 487, palette.sageDark);
  page.drawText(safeText(payload.attendeeName), { x: MARGIN + 16, y: 467, size: 14, font: fonts.bold, color: palette.ink });
  page.drawText(safeText(`${payload.attendeeEmail}  ·  ${payload.phone}`), { x: MARGIN + 16, y: 450, size: 8.5, font: fonts.regular, color: palette.muted });
  drawLabel(ctx, "Booking reference", 380, 487, palette.sageDark);
  drawRight(ctx, payload.reference, PAGE_WIDTH - MARGIN - 16, 467, 9, fonts.mono, palette.ink);
  drawPill(ctx, "Payment verified", 380, 439, palette.white, palette.sageDark);

  drawLabel(ctx, "Ticket breakdown", MARGIN, 408);
  const table = drawItemsTable(ctx, payload, 390);
  const totalY = Math.max(164, table.tableBottom - 78);
  drawBox(page, MARGIN, totalY, PAGE_WIDTH - MARGIN * 2, 58, palette.white, palette.line);
  drawLabel(ctx, "Total paid", MARGIN + 16, totalY + 37, palette.coralDark);
  page.drawText("Your ticket is ready at the door.", { x: MARGIN + 16, y: totalY + 18, size: 8.5, font: fonts.regular, color: palette.muted });
  drawRight(ctx, formatMoney(payload.total, payload.currency), PAGE_WIDTH - MARGIN - 16, totalY + 25, 19, fonts.bold, palette.ink);

  drawDashedLine(page, MARGIN, PAGE_WIDTH - MARGIN, 127);
  page.drawCircle({ x: MARGIN, y: 127, size: 7, color: palette.paper });
  page.drawCircle({ x: PAGE_WIDTH - MARGIN, y: 127, size: 7, color: palette.paper });
  page.drawText(safeText(payload.organizerName || "evently events"), { x: MARGIN, y: 95, size: 8.5, font: fonts.bold, color: palette.ink });
  page.drawText(safeText([payload.organizerEmail, payload.organizerPhone].filter(Boolean).join("  ·  ") || "Present this QR code at the entrance."), { x: MARGIN, y: 80, size: 7.5, font: fonts.regular, color: palette.softMuted });
  drawRight(ctx, `Issued ${formatDateTime(payload.verifiedAt || payload.bookedAt, payload.eventTimezone)}`, PAGE_WIDTH - MARGIN, 95, 7.5, fonts.regular, palette.softMuted);
  drawRight(ctx, safeText(payload.reference), PAGE_WIDTH - MARGIN, 80, 7.5, fonts.mono, palette.softMuted);
  return Buffer.from(await ctx.document.save());
}

export async function makeReceiptPdf(payload: BookingDocumentPayload) {
  const ctx = await createContext(`Payment receipt - ${payload.reference}`, payload.organizerName || "evently");
  const { page, fonts } = ctx;
  const qr = await embedQr(ctx.document, payload.ticketUrl || payload.ticketToken);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: palette.paper });
  page.drawRectangle({ x: 0, y: 690, width: PAGE_WIDTH, height: 152, color: palette.ink });
  page.drawCircle({ x: 545, y: 800, size: 100, color: palette.lavender, opacity: 0.85 });
  page.drawText("evently", { x: MARGIN, y: 792, size: 22, font: fonts.bold, color: palette.white });
  drawLabel(ctx, "Payment receipt", MARGIN, 758, palette.coral);
  page.drawText("A clear record of your booking.", { x: MARGIN, y: 731, size: 20, font: fonts.bold, color: palette.white });
  page.drawText(safeText(`Receipt reference  ${payload.reference}`), { x: MARGIN, y: 706, size: 8.5, font: fonts.mono, color: palette.white });
  drawQrCard(ctx, qr, 430, 703, 123, "View ticket", "Scan to open securely");

  drawBox(page, MARGIN, 578, PAGE_WIDTH - MARGIN * 2, 72, palette.white, palette.line);
  drawLabel(ctx, "Paid for", MARGIN + 16, 628);
  page.drawText(safeText(payload.eventTitle), { x: MARGIN + 16, y: 608, size: 14, font: fonts.bold, color: palette.ink });
  page.drawText(`${formatDate(payload.eventStartAt, payload.eventTimezone)}  ·  ${formatTimeRange(payload)}  ·  ${safeText(payload.venueName)}`, { x: MARGIN + 16, y: 590, size: 8.5, font: fonts.regular, color: palette.muted });
  drawPill(ctx, "Paid & verified", PAGE_WIDTH - MARGIN - 105, 602, palette.sage, palette.sageDark);

  drawBox(page, MARGIN, 452, PAGE_WIDTH - MARGIN * 2, 100, palette.white, palette.line);
  drawLabel(ctx, "Billed to", MARGIN + 16, 530);
  page.drawText(safeText(payload.attendeeName), { x: MARGIN + 16, y: 510, size: 11, font: fonts.bold, color: palette.ink });
  page.drawText(safeText(payload.attendeeEmail), { x: MARGIN + 16, y: 494, size: 8.5, font: fonts.regular, color: palette.muted });
  page.drawText(safeText(payload.phone), { x: MARGIN + 16, y: 480, size: 8.5, font: fonts.regular, color: palette.muted });
  drawLabel(ctx, "Event location", 315, 530);
  page.drawText(safeText(payload.venueName), { x: 315, y: 510, size: 10, font: fonts.bold, color: palette.ink });
  drawWrapped(ctx, eventAddress(payload), 315, 494, 220, 8.5, fonts.regular, palette.muted, 11, 3);

  drawLabel(ctx, "Purchase summary", MARGIN, 426);
  const table = drawItemsTable(ctx, payload, 408, true);
  const totalY = Math.max(244, table.tableBottom - 78);
  drawBox(page, MARGIN, totalY, PAGE_WIDTH - MARGIN * 2, 64, palette.ink);
  drawLabel(ctx, "Amount paid", MARGIN + 16, totalY + 43, palette.coral);
  page.drawText("No balance remains on this booking.", { x: MARGIN + 16, y: totalY + 22, size: 8.5, font: fonts.regular, color: palette.white });
  drawRight(ctx, formatMoney(payload.total, payload.currency), PAGE_WIDTH - MARGIN - 16, totalY + 28, 19, fonts.bold, palette.white);

  const detailsY = Math.max(142, totalY - 70);
  drawBox(page, MARGIN, detailsY, PAGE_WIDTH - MARGIN * 2, 52, palette.white, palette.line);
  drawLabel(ctx, "Payment reference", MARGIN + 16, detailsY + 35);
  page.drawText(safeText(payload.paymentReference), { x: MARGIN + 16, y: detailsY + 17, size: 9, font: fonts.mono, color: palette.ink });
  drawLabel(ctx, "Verified", 300, detailsY + 35);
  page.drawText(formatDateTime(payload.verifiedAt, payload.eventTimezone), { x: 300, y: detailsY + 17, size: 8.5, font: fonts.regular, color: palette.ink });
  drawDashedLine(page, MARGIN, PAGE_WIDTH - MARGIN, 108);
  page.drawText(safeText(payload.organizerName || "evently events"), { x: MARGIN, y: 82, size: 8.5, font: fonts.bold, color: palette.ink });
  page.drawText(safeText([payload.organizerPhone, payload.organizerWebsite].filter(Boolean).join("  ·  ") || "Keep this receipt with your ticket for your records."), { x: MARGIN, y: 67, size: 7.5, font: fonts.regular, color: palette.softMuted });
  drawRight(ctx, safeText(payload.organizerEmail || "Thank you for choosing evently"), PAGE_WIDTH - MARGIN, 82, 7.5, fonts.regular, palette.softMuted);
  drawRight(ctx, safeText(payload.reference), PAGE_WIDTH - MARGIN, 67, 7.5, fonts.mono, palette.softMuted);
  return Buffer.from(await ctx.document.save());
}

export async function makePdf(kind: "ticket" | "receipt", payload: BookingDocumentPayload) {
  return kind === "receipt" ? makeReceiptPdf(payload) : makeTicketPdf(payload);
}

export { formatDate, formatDateTime, formatTime, formatMoney };
