import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ContactInput = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  bookingReference?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json() as ContactInput;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const phone = body.phone?.trim() || null;
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const bookingReference = body.bookingReference?.trim() || null;

    if (name.length < 2 || name.length > 100) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!emailPattern.test(email) || email.length > 160) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (phone && (phone.length > 30 || !/^[+()0-9\s-]+$/.test(phone))) return NextResponse.json({ error: "Please enter a valid phone number or leave it blank." }, { status: 400 });
    if (subject.length < 3 || subject.length > 120) return NextResponse.json({ error: "Please add a short subject." }, { status: 400 });
    if (message.length < 10 || message.length > 5000) return NextResponse.json({ error: "Please write a message between 10 and 5,000 characters." }, { status: 400 });
    if (bookingReference && bookingReference.length > 80) return NextResponse.json({ error: "That booking reference is too long." }, { status: 400 });

    const contactMessage = await prisma.contactMessage.create({ data: { name, email, phone, subject, message, bookingReference } });
    return NextResponse.json({ ok: true, submittedAt: contactMessage.createdAt.toISOString() }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "We could not save your message right now. Please try again." }, { status: 500 });
  }
}
