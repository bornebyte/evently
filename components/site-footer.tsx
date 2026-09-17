"use client";

import Link from "next/link";
import { ArrowUpRight, Instagram, Linkedin, Mail } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="bg-[#202321] px-5 pb-8 pt-16 text-white lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-[1.5fr_1fr_1.4fr]">
          <div>
            <Link className="flex items-center gap-2.5" href="/">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f16d55] text-[22px] font-bold leading-none text-[#202321]">e</span>
              <span className="text-[21px] font-semibold tracking-[-0.05em]">evently</span>
            </Link>
            <p className="mt-5 max-w-[250px] text-[13px] leading-6 text-white/55">A better way to find the things that make life feel a little bigger.</p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Linkedin, Mail].map((Icon, index) => <a aria-label={index === 0 ? "Instagram" : index === 1 ? "LinkedIn" : "Email"} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/65 hover:border-[#f16d55] hover:bg-[#f16d55] hover:text-[#202321]" href={index === 2 ? "mailto:hello@evently.co" : "#"} key={index}><Icon size={15} /></a>)}
            </div>
          </div>
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Explore</p>
            <div className="flex flex-col items-start gap-3 text-[13px] text-white/70"><Link className="hover:text-white" href="/events">All events</Link><Link className="hover:text-white" href="/#categories">Categories</Link><Link className="hover:text-white" href="/tickets">My tickets</Link><Link className="hover:text-white" href="/contact">Contact us</Link></div>
          </div>
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Stay in the know</p>
            <p className="mb-4 text-[13px] leading-5 text-white/60">A hand-picked note on what’s happening near you. No noise, ever.</p>
            <form className="flex rounded-xl border border-white/15 bg-white/5 p-1.5" onSubmit={(event) => event.preventDefault()}>
              <input aria-label="Email address" className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-white/35" placeholder="Your email address" type="email" />
              <button aria-label="Subscribe" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f16d55] text-[#202321] hover:bg-white" type="submit"><ArrowUpRight size={16} /></button>
            </form>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-7 text-[11px] text-white/35 sm:flex-row"><span>© evently. Made for the curious.</span><div className="flex gap-5"><Link className="hover:text-white/70" href="/privacy">Privacy</Link><Link className="hover:text-white/70" href="/terms">Terms</Link><Link className="hover:text-white/70" href="/privacy#cookies">Cookies</Link></div></div>
      </div>
    </footer>
  );
}
