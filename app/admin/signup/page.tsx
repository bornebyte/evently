"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowUpRight, LockKeyhole, Mail, ShieldCheck, UserRound } from "@/components/icons";
import { useRouter } from "next/navigation";

export default function AdminSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password.length < 8) return setError("Use at least 8 characters for your password.");
    if (form.password !== form.confirm) return setError("Your passwords do not match.");
    const response = await fetch("/api/admin/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) return setError(result.error ?? "Unable to create the admin account.");
    router.replace("/admin/dashboard");
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#f5f6f3] px-5 py-12 text-[#242725]"><div className="w-full max-w-[460px]"><div className="mb-10 flex items-center justify-between"><Link className="flex items-center gap-2.5" href="/"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f16d55] text-[22px] font-bold leading-none text-[#202321]">e</span><span className="text-[21px] font-semibold tracking-[-0.05em]">evently</span></Link><Link className="text-[11px] font-semibold text-[#7b847d] hover:text-[#242725]" href="/admin/login">Already an admin? Sign in</Link></div><div className="rounded-[24px] border border-[#e1e5df] bg-white p-6 shadow-[0_15px_35px_rgba(36,39,37,0.06)] sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dfe8d9] text-[#61795e]"><UserRound size={19} /></div><p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#e15f49]">Private admin portal</p><h1 className="mt-2 text-[31px] font-semibold tracking-[-0.065em]">Create an admin account.</h1><p className="mt-2 text-[13px] leading-5 text-[#7b847d]">This form is only available inside the admin workspace. There is no public signup.</p><form className="mt-7 space-y-4" onSubmit={submit}><AuthInput icon={<UserRound size={15} />} label="Full name" placeholder="Olivia Wilson" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><AuthInput icon={<Mail size={15} />} label="Work email" placeholder="you@company.com" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} /><AuthInput icon={<LockKeyhole size={15} />} label="Password" placeholder="At least 8 characters" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} /><AuthInput icon={<LockKeyhole size={15} />} label="Confirm password" placeholder="Repeat your password" type="password" value={form.confirm} onChange={(value) => setForm({ ...form, confirm: value })} />{error && <p className="rounded-lg bg-[#fbe5e0] px-3 py-2 text-[11px] font-medium text-[#bb503e]">{error}</p>}<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#242725] px-5 py-4 text-[13px] font-bold text-white hover:bg-[#f16d55] hover:text-[#242725]" type="submit">Create admin account <ArrowUpRight size={15} /></button></form><div className="mt-6 flex items-start gap-2 border-t border-[#edf0eb] pt-5 text-[10px] leading-4 text-[#8b948d]"><ShieldCheck className="mt-0.5 shrink-0" size={14} /><span>In production, account creation should be protected by an admin invite or organization access policy.</span></div></div></div></main>;
}

function AuthInput({ icon, label, placeholder, type = "text", value, onChange }: { icon: React.ReactNode; label: string; placeholder: string; type?: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">{label}</span><span className="relative block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa39b]">{icon}</span><input className="w-full rounded-xl border border-[#dfe3dd] bg-[#fafbf9] py-3.5 pl-10 pr-3 text-[13px] outline-none placeholder:text-[#a5ada6] focus:border-[#f16d55]" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required type={type} value={value} /></span></label>; }
