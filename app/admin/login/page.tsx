"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowUpRight, LockKeyhole, Mail, ShieldCheck } from "@/components/icons";
import { DEMO_ADMIN } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(DEMO_ADMIN.email);
  const [password, setPassword] = useState<string>(DEMO_ADMIN.password);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Enter your admin email and password to continue.");
      return;
    }
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Unable to sign in right now.");
      return;
    }
    router.replace("/admin/dashboard");
  };

  return <main className="grid min-h-screen bg-[#f5f6f3] text-[#242725] lg:grid-cols-[0.95fr_1.05fr]"><section className="relative hidden overflow-hidden bg-[#202321] p-10 text-white lg:flex lg:flex-col lg:justify-between"><div className="dot-grid absolute inset-0 opacity-30" /><div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full border-[60px] border-[#f16d55]/70" /><div className="relative"><Link className="flex items-center gap-2.5" href="/"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f16d55] text-[22px] font-bold leading-none text-[#202321]">e</span><span className="text-[21px] font-semibold tracking-[-0.05em]">evently</span></Link><div className="mt-32 max-w-[470px]"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f16d55]">Admin portal</p><h1 className="mt-4 font-display text-[clamp(3.3rem,5vw,5.8rem)] leading-[0.87]">Make room for<br /><span className="text-white/40">what’s next.</span></h1><p className="mt-7 max-w-[340px] text-[14px] leading-6 text-white/55">Manage events, verify payments, and welcome every attendee with confidence.</p></div></div><p className="relative text-[11px] text-white/35">Private workspace · Built for event teams</p></section><section className="flex items-center justify-center px-5 py-10 sm:px-8"><div className="w-full max-w-[420px]"><div className="mb-10 flex items-center justify-between lg:hidden"><Link className="flex items-center gap-2.5" href="/"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f16d55] text-[22px] font-bold leading-none text-[#202321]">e</span><span className="text-[21px] font-semibold tracking-[-0.05em]">evently</span></Link><Link className="text-[11px] font-semibold text-[#7b847d]" href="/">Back to site</Link></div><div className="mb-8"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7ded7] text-[#d95742]"><LockKeyhole size={19} /></div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e15f49]">Admin access only</p><h2 className="mt-2 text-[32px] font-semibold tracking-[-0.065em]">Welcome back.</h2><p className="mt-2 text-[13px] text-[#7b847d]">Sign in to manage your event workspace.</p></div><form className="space-y-4" onSubmit={submit}><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#69746c]">Admin email</span><span className="relative block"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa39b]" size={15} /><input autoComplete="email" className="w-full rounded-xl border border-[#dfe3dd] bg-white py-3.5 pl-10 pr-3 text-[13px] outline-none focus:border-[#f16d55]" onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required type="email" value={email} /></span></label><label className="block"><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-semibold text-[#69746c]">Password</span><span className="text-[10px] text-[#9aa39b]">Contact your workspace owner</span></div><span className="relative block"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa39b]" size={15} /><input autoComplete="current-password" className="w-full rounded-xl border border-[#dfe3dd] bg-white py-3.5 pl-10 pr-3 text-[13px] outline-none focus:border-[#f16d55]" onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required type="password" value={password} /></span></label>{error && <p className="rounded-lg bg-[#fbe5e0] px-3 py-2 text-[11px] font-medium text-[#bb503e]">{error}</p>}<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#242725] px-5 py-4 text-[13px] font-bold text-white hover:bg-[#f16d55] hover:text-[#242725]" type="submit">Sign in to admin <ArrowUpRight size={15} /></button></form><div className="mt-6 flex items-start gap-2 rounded-xl bg-[#e7f0e3] p-3.5 text-[11px] leading-4 text-[#64745f]"><ShieldCheck className="mt-0.5 shrink-0" size={14} /><span>Admin accounts are not available on the public site. New accounts can only be created inside this private portal.</span></div><Link className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-[#9aa39b] hover:text-[#242725]" href="/"><ArrowLeft size={13} /> Back to public site</Link></div></section></main>;
}
