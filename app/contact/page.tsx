import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ArrowLeft, ArrowUpRight, Clock3, Mail, MapPin } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Contact us — evently",
  description: "Send a question to the evently team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#242725]">
      <div className="border-b border-[#e8eae5]"><SiteHeader /></div>
      <section className="bg-[#e8e3ef] px-5 pb-14 pt-14 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-[1100px]">
          <Link className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#746a7d] hover:text-[#242725]" href="/"><ArrowLeft size={14} /> Back to evently</Link>
          <p className="mt-12 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e15f49]">Contact us</p>
          <h1 className="mt-3 max-w-[760px] font-display text-[clamp(3.2rem,7vw,6.2rem)] leading-[0.86]">Let’s make<br /><span className="text-[#968aa0]">things clearer.</span></h1>
          <p className="mt-6 max-w-[560px] text-[15px] leading-7 text-[#756d7e]">Have a question about an event, a booking, or the evently experience? Send us a note and our team will take a look.</p>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-[1100px] gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-5">
            <section className="rounded-[22px] bg-[#202321] p-6 text-white sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#f16d55]">Reach the team</p>
              <h2 className="mt-3 font-display text-[34px] leading-[0.92]">A real person<br />will read it.</h2>
              <p className="mt-5 text-[12px] leading-5 text-white/55">Your message goes into the evently admin inbox, where it can be reviewed and answered by the team.</p>
              <a className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5 text-[12px] font-semibold text-white hover:text-[#f16d55]" href="mailto:hello@evently.co"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f16d55] text-[#242725]"><Mail size={15} /></span> hello@evently.co <ArrowUpRight className="ml-auto" size={14} /></a>
            </section>
            <section className="rounded-[22px] border border-[#e1e5df] bg-white p-6 sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#e15f49]">Before you write</p>
              <div className="mt-5 space-y-4 text-[12px] leading-5 text-[#69746c]">
                <p className="flex gap-3"><Clock3 className="mt-0.5 shrink-0 text-[#e15f49]" size={16} /> For booking questions, include your booking reference so we can find the right record.</p>
                <p className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-[#e15f49]" size={16} /> For event-specific changes, the organizer listed on the event page is usually the fastest contact.</p>
              </div>
              <Link className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold text-[#d95742] hover:text-[#242725]" href="/events">Browse events <ArrowUpRight size={13} /></Link>
            </section>
          </aside>

          <section className="rounded-[22px] border border-[#e1e5df] bg-white p-6 shadow-[0_15px_35px_rgba(36,39,37,0.05)] sm:p-8 lg:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#929b94]">Send a message</p>
            <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.05em]">What can we help with?</h2>
            <p className="mt-2 max-w-lg text-[12px] leading-5 text-[#7b847d]">The details below are saved securely so an admin can follow up without losing the thread.</p>
            <div className="mt-7"><ContactForm /></div>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
