import nodemailer from "nodemailer";
import { formatDate, formatMoney, formatTime, makePdf, type BookingDocumentPayload } from "@/lib/ticket-documents";

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error("Gmail SMTP credentials are not configured.");
  return nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendBookingConfirmationEmail(payload: BookingDocumentPayload) {
  const eventDate = formatDate(payload.eventStartAt, payload.eventTimezone);
  const eventTime = `${formatTime(payload.eventStartAt, payload.eventTimezone)} - ${formatTime(payload.eventEndAt, payload.eventTimezone)}`;
  const total = formatMoney(payload.total, payload.currency);
  const itemLines = payload.items.map((item) => `${item.quantity} × ${item.name} · ${formatMoney(item.unitPrice * item.quantity, payload.currency)}`).join("\n");
  const [ticketPdf, receiptPdf] = await Promise.all([
    makePdf("ticket", payload),
    makePdf("receipt", payload),
  ]);
  const transporter = getTransporter();
  const attendeeName = escapeHtml(payload.attendeeName);
  const eventTitle = escapeHtml(payload.eventTitle);
  const ticketUrl = payload.ticketUrl;
  await transporter.sendMail({
    from: `evently <${process.env.GMAIL_USER}>`,
    to: payload.attendeeEmail,
    subject: `Your evently ticket is confirmed · ${payload.reference}`,
    text: `Hi ${payload.attendeeName},

Your booking is confirmed and your payment has been verified.

EVENT
${payload.eventTitle}
${eventDate} · ${eventTime} · ${payload.eventTimezone}
${payload.venueName}, ${payload.city}

ATTENDEE
${payload.attendeeName} · ${payload.attendeeEmail}

ORDER
${itemLines || "Ticket"}
Total paid: ${total}
Booking reference: ${payload.reference}
Payment reference: ${payload.paymentReference}

Open your unique ticket: ${ticketUrl}
Your ticket and payment receipt are attached as polished PDFs. The QR code on the ticket can be scanned at entry.

Thank you for choosing evently.`,
    html: `<div style="margin:0;background:#f5f6f3;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#242725"><div style="max-width:580px;margin:0 auto;background:#fff;border:1px solid #e1e5df;border-radius:24px;overflow:hidden"><div style="background:#202321;padding:30px 32px;color:#fff"><p style="margin:0;color:#f16d55;font-size:13px;font-weight:700;letter-spacing:2px">evently</p><p style="margin:28px 0 8px;color:#f16d55;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Booking confirmed</p><h1 style="margin:0;font-size:34px;line-height:1.05">You’re going, ${attendeeName}.</h1><p style="margin:16px 0 0;color:#c9d0ca;font-size:14px;line-height:1.6">Your payment is verified and your place is secured for <strong style="color:#fff">${eventTitle}</strong>.</p></div><div style="padding:28px 32px"><div style="background:#e7f0e3;border-radius:16px;padding:20px"><p style="margin:0;color:#66825f;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Your event</p><p style="margin:10px 0 6px;font-size:20px;font-weight:700">${eventTitle}</p><p style="margin:0;color:#69746c;font-size:13px;line-height:1.6">${escapeHtml(eventDate)} · ${escapeHtml(eventTime)} · ${escapeHtml(payload.eventTimezone)}<br>${escapeHtml(payload.venueName)}, ${escapeHtml(payload.city)}</p></div><div style="margin:24px 0;border-bottom:1px solid #edf0eb;padding-bottom:20px"><p style="margin:0 0 12px;color:#929b94;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Order summary</p>${payload.items.map((item) => `<div style="display:flex;justify-content:space-between;gap:16px;margin:8px 0;font-size:13px"><span>${escapeHtml(`${item.quantity} × ${item.name}`)}</span><strong>${escapeHtml(formatMoney(item.unitPrice * item.quantity, payload.currency))}</strong></div>`).join("") || "<p style=\"margin:0;color:#69746c;font-size:13px\">Ticket</p>"}<div style="display:flex;justify-content:space-between;gap:16px;margin-top:16px;padding-top:14px;border-top:1px solid #edf0eb;font-size:15px"><strong>Total paid</strong><strong style="color:#d95742">${escapeHtml(total)}</strong></div></div><div style="display:flex;flex-wrap:wrap;gap:18px;margin-bottom:24px"><div style="min-width:180px"><p style="margin:0 0 5px;color:#929b94;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Attendee</p><p style="margin:0;font-size:13px;font-weight:700">${attendeeName}</p><p style="margin:4px 0 0;color:#69746c;font-size:12px">${escapeHtml(payload.attendeeEmail)}</p></div><div style="min-width:180px"><p style="margin:0 0 5px;color:#929b94;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Reference</p><p style="margin:0;font-family:monospace;font-size:12px">${escapeHtml(payload.reference)}</p><p style="margin:4px 0 0;color:#69746c;font-size:12px">Payment: ${escapeHtml(payload.paymentReference)}</p></div></div><a href="${escapeHtml(ticketUrl)}" style="display:inline-block;background:#242725;color:#fff;text-decoration:none;border-radius:12px;padding:15px 20px;font-size:13px;font-weight:700">Open unique ticket link</a><p style="margin:22px 0 0;color:#89938b;font-size:12px;line-height:1.6">Two polished PDF attachments are included: your entry ticket with a scannable QR code and your payment receipt. Keep them handy for the event.</p></div></div></div>`,
    attachments: [
      { filename: `${payload.reference}-evently-ticket.pdf`, content: ticketPdf, contentType: "application/pdf" },
      { filename: `${payload.reference}-evently-receipt.pdf`, content: receiptPdf, contentType: "application/pdf" },
    ],
  });
  return ticketUrl;
}
