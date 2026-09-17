import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { paymentQrs: { where: { isActive: true }, orderBy: { updatedAt: "desc" }, take: 1, select: { label: true, payload: true, imageUrl: true } } } });
  const paymentQr = event?.paymentQrs[0];
  if (!paymentQr) return NextResponse.json({ qr: null }, { headers: { "Cache-Control": "no-store" } });

  const imageUrl = paymentQr.imageUrl ?? await QRCode.toDataURL(paymentQr.payload, { errorCorrectionLevel: "M", margin: 2, width: 512 });
  return NextResponse.json({ qr: { label: paymentQr.label, imageUrl } }, { headers: { "Cache-Control": "no-store" } });
}
