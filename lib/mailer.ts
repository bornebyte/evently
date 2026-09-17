import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import nodemailer from "nodemailer";

type ConfirmationPayload = {
  reference: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  ticketName: string;
  quantity: number;
  total: number;
};

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error("Gmail SMTP credentials are not configured.");
  return nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
}

export async function makePdf(title: string, lines: string[]) {
  const document = await PDFDocument.create();
  const page = document.addPage([595, 842]);
  const heading = await document.embedFont(StandardFonts.HelveticaBold);
  const body = await document.embedFont(StandardFonts.Helvetica);
  page.drawText("evently", { x: 48, y: 778, size: 24, font: heading, color: rgb(0.13, 0.14, 0.14) });
  page.drawText(title, { x: 48, y: 700, size: 30, font: heading, color: rgb(0.13, 0.14, 0.14) });
  let y = 650;
  for (const line of lines) {
    page.drawText(line, { x: 48, y, size: 13, font: body, color: rgb(0.35, 0.39, 0.36) });
    y -= 30;
  }
  page.drawText("Keep this document handy for event entry.", { x: 48, y: 90, size: 11, font: body, color: rgb(0.55, 0.58, 0.55) });
  return Buffer.from(await document.save());
}

export async function sendBookingConfirmationEmail(payload: ConfirmationPayload) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const ticketUrl = `${appUrl}/tickets/${payload.reference}`;
  const [ticketPdf, receiptPdf] = await Promise.all([
    makePdf("Event ticket", [payload.eventTitle, payload.eventDate, payload.eventVenue, `${payload.quantity} × ${payload.ticketName}`, `Booking reference: ${payload.reference}`]),
    makePdf("Payment receipt", [`Paid for: ${payload.eventTitle}`, `Amount: INR ${payload.total.toLocaleString("en-IN")}`, `Ticket: ${payload.ticketName}`, `Booking reference: ${payload.reference}`]),
  ]);
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `evently <${process.env.GMAIL_USER}>`,
    to: payload.attendeeEmail,
    subject: `Your evently ticket is confirmed · ${payload.reference}`,
    text: `Hi ${payload.attendeeName}, your payment has been verified. Open your ticket: ${ticketUrl}. Your ticket and receipt are attached as PDFs.`,
    html: `<div style="font-family:Arial,sans-serif;color:#242725;max-width:560px"><p style="font-size:22px;font-weight:700">evently</p><p style="color:#e15f49;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:700">Booking confirmed</p><h1 style="font-size:34px;line-height:1">You’re going, ${payload.attendeeName}.</h1><p style="font-size:15px;line-height:1.6;color:#69746c">Your payment has been verified and your spot is confirmed for <strong>${payload.eventTitle}</strong>.</p><div style="background:#e7f0e3;border-radius:16px;padding:20px;margin:24px 0"><p style="margin:0 0 8px"><strong>${payload.eventDate}</strong></p><p style="margin:0;color:#69746c">${payload.eventVenue}</p><p style="margin:12px 0 0;font-family:monospace">${payload.reference}</p></div><a href="${ticketUrl}" style="display:inline-block;background:#242725;color:#fff;text-decoration:none;border-radius:10px;padding:14px 20px;font-weight:700">Open unique ticket link</a><p style="font-size:12px;line-height:1.5;color:#8b948d;margin-top:28px">Your ticket PDF and payment receipt are attached to this email. Please keep both for your records.</p></div>`,
    attachments: [{ filename: `${payload.reference}-ticket.pdf`, content: ticketPdf }, { filename: `${payload.reference}-receipt.pdf`, content: receiptPdf }],
  });
  return ticketUrl;
}
