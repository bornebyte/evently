"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "@/components/icons";

type ContactFormValues = { name: string; email: string; phone: string; subject: string; bookingReference: string; message: string };

const emptyForm: ContactFormValues = { name: "", email: "", phone: "", subject: "", bookingReference: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState<ContactFormValues>(emptyForm);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const update = (field: keyof ContactFormValues, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "We could not send your message.");
      setForm(emptyForm);
      setNotice({ kind: "success", text: "Your message is safely with our team. We’ll get back to you soon." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "We could not send your message. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required value={form.name} onChange={(value) => update("name", value)} />
        <Field label="Email address" required type="email" value={form.email} onChange={(value) => update("email", value)} />
      </div>
      <Field label="Phone number" hint="Prefer a call or WhatsApp reply." type="tel" value={form.phone} onChange={(value) => update("phone", value)} />
      <Field label="Subject" required value={form.subject} onChange={(value) => update("subject", value)} />
      <Field label="Booking reference" hint="Optional — useful for ticket questions." value={form.bookingReference} onChange={(value) => update("bookingReference", value)} />
      <Field label="Message" required textarea value={form.message} onChange={(value) => update("message", value)} />
      {notice && <div aria-live="polite" className={`rounded-xl px-4 py-3 text-[11px] font-semibold ${notice.kind === "success" ? "bg-[#e7f0e3] text-[#5f7659]" : "bg-[#fbe5e0] text-[#bb503e]"}`}>{notice.kind === "success" && <CheckCircle2 className="mr-1.5 inline" size={14} />}{notice.text}</div>}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#242725] px-5 py-4 text-[12px] font-bold text-white transition-colors hover:bg-[#f16d55] hover:text-[#242725] disabled:cursor-wait disabled:opacity-60" disabled={sending} type="submit">{sending ? "Sending your note…" : "Send message"} {!sending && <ArrowUpRight size={15} />}</button>
      <p className="text-[10px] leading-4 text-[#929b94]">Please don’t include passwords, payment PINs, or other sensitive financial information.</p>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false, required = false, hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; textarea?: boolean; required?: boolean; hint?: string }) {
  return <label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">{label}{required && <span className="ml-1 text-[#e15f49]">*</span>}</span>{hint && <span className="mb-2 block text-[10px] text-[#929b94]">{hint}</span>}{textarea ? <textarea className="min-h-32 w-full resize-y rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3 text-[12px] leading-5 outline-none placeholder:text-[#a5ada6] focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} required={required} value={value} /> : <input className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] px-3 py-3.5 text-[12px] outline-none placeholder:text-[#a5ada6] focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} required={required} type={type} value={value} />}</label>;
}
