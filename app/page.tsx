"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, Search, Sparkles, Users } from "@/components/icons";
import { EventCard } from "@/components/event-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categories, events } from "@/lib/events";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);

  const curatedEvents = useMemo(() => category === "All" ? events.slice(0, 3) : events.filter((event) => event.category === category).slice(0, 3), [category]);
  const handleSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); router.push(search.trim() ? `/events?search=${encodeURIComponent(search.trim())}` : "/events"); };
  const toggleSaved = (slug: string) => setSaved((items) => items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug]);

  return (
    <main className="overflow-hidden bg-[#f7f7f4]">
      <section className="grain relative bg-[#dfe8d9]">
        <div className="absolute -left-28 top-24 h-64 w-64 rounded-full bg-[#f16d55]/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[#e9dfd1]/35 [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" />
        <SiteHeader />
        <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-14 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-8 lg:pb-[104px] lg:pt-20">
          <div className="reveal max-w-[570px]">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.19em] text-[#5c6f5d]"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f16d55] text-[#242725]"><Sparkles size={13} /></span> Make space for something good</div>
            <h1 className="font-display text-[clamp(3.7rem,7vw,6.7rem)] leading-[0.88] text-[#202321]">Find your next <span className="text-[#e45f49]">story.</span></h1>
            <p className="mt-7 max-w-[450px] text-[16px] leading-7 text-[#536056] sm:text-[17px]">Discover intimate gatherings, big nights out and everything in between. Your calendar is about to get interesting.</p>
            <form className="mt-9 flex max-w-[500px] items-center rounded-[18px] border border-[#cbd7c8] bg-white p-2 shadow-[0_12px_30px_rgba(46,63,47,0.08)] focus-within:border-[#f16d55] focus-within:ring-4 focus-within:ring-[#f16d55]/10" onSubmit={handleSearch}>
              <Search className="ml-3 shrink-0 text-[#7d887f]" size={19} />
              <input aria-label="Search events" className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[#242725] outline-none placeholder:text-[#9aa39b]" onChange={(event) => setSearch(event.target.value)} placeholder="Search events, places or vibes" value={search} />
              <button className="flex h-11 items-center gap-2 rounded-[13px] bg-[#242725] px-4 text-[13px] font-semibold text-white hover:bg-[#f16d55] hover:text-[#242725]" type="submit">Search <ArrowUpRight size={15} /></button>
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#68766a]"><span>Popular now</span><button className="rounded-full border border-[#b9c9b9] bg-white/40 px-3 py-1.5 hover:border-[#f16d55]" onClick={() => { setSearch("live music"); router.push("/events?search=live%20music"); }} type="button">Live music</button><button className="rounded-full border border-[#b9c9b9] bg-white/40 px-3 py-1.5 hover:border-[#f16d55]" onClick={() => { setSearch("workshops"); router.push("/events?search=workshops"); }} type="button">Workshops</button><button className="rounded-full border border-[#b9c9b9] bg-white/40 px-3 py-1.5 hover:border-[#f16d55]" onClick={() => { setSearch("food"); router.push("/events?search=food"); }} type="button">Food & drink</button></div>
          </div>

          <div className="reveal reveal-delay-2 relative mx-auto w-full max-w-[570px] lg:ml-auto">
            <div className="absolute -right-4 -top-7 z-10 hidden rounded-2xl bg-[#f16d55] px-4 py-3 shadow-[5px_5px_0_#202321] sm:block float-slow"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#202321]/60">This week</p><p className="mt-0.5 text-[15px] font-semibold text-[#202321]">42 moments to find</p></div>
            <div className="relative aspect-[0.98/1] overflow-hidden rounded-[30px] bg-[#242725] shadow-[10px_14px_0_rgba(36,39,37,0.13)] sm:aspect-[1.08/1]">
              <Image alt="People gathering at The Future of Making" className="object-cover opacity-85" fill priority sizes="(max-width: 1024px) 92vw, 50vw" src={events[0].image} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#202321] via-[#202321]/15 to-transparent" /><div className="dot-grid absolute inset-0 opacity-30" />
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-[#f16d55]" /> Featured event</div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"><div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f3c4b8]"><CalendarDays size={14} /> Sunday, 18 May 2025</div><h2 className="font-display max-w-[390px] text-[clamp(2.35rem,4vw,4rem)] leading-[0.91] text-white">The future of making</h2><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/20 pt-4 text-[12px] text-white/70"><span className="flex items-center gap-1.5"><MapPin size={14} /> The Roundhouse, London</span><span className="font-semibold text-white">From £42</span></div></div>
              <Link aria-label="View The future of making" className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#f16d55] text-[#242725] hover:scale-105 hover:bg-white" href="/events/future-of-making"><ArrowUpRight size={19} /></Link>
            </div>
            <div className="absolute -bottom-8 -left-5 hidden items-center gap-3 rounded-[16px] border border-white/70 bg-white/90 px-4 py-3 shadow-xl backdrop-blur sm:flex"><div className="flex -space-x-2">{["#e9ae8d", "#9eaba1", "#c9a6a6", "#6e7e84"].map((color, i) => <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white" key={i} style={{ backgroundColor: color }}>{["A", "M", "J", "+"][i]}</span>)}</div><div><p className="text-[11px] font-semibold text-[#242725]">Join 2,400 curious people</p><p className="text-[10px] text-[#7b847d]">going to this event</p></div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 pb-16 pt-20 sm:pt-24 lg:px-8 lg:pb-24" id="discover">
        <div className="reveal flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e15f49]">Worth leaving the house for</p><h2 className="font-display text-[clamp(2.5rem,4.3vw,4.1rem)] leading-[0.92] text-[#242725]">A little inspiration,<br /><span className="text-[#929b94]">hand-picked.</span></h2></div><Link className="group flex items-center gap-2 text-[13px] font-semibold text-[#242725] hover:text-[#e15f49]" href="/events">View all events <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe3dd] group-hover:border-[#f16d55] group-hover:bg-[#f16d55]"><ArrowRight size={15} /></span></Link></div>
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]"><button className={`shrink-0 rounded-full px-5 py-2.5 text-[12px] font-semibold ${category === "All" ? "bg-[#242725] text-white" : "border border-[#e0e3dd] bg-white text-[#717a73] hover:border-[#b9c0b9]"}`} onClick={() => setCategory("All")} type="button">All picks</button>{categories.map((item) => <button className={`shrink-0 rounded-full px-5 py-2.5 text-[12px] font-semibold ${category === item.name ? "bg-[#242725] text-white" : "border border-[#e0e3dd] bg-white text-[#717a73] hover:border-[#b9c0b9]"}`} key={item.name} onClick={() => setCategory(item.name)} type="button">{item.name}</button>)}</div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{curatedEvents.map((event, index) => <div className={`reveal reveal-delay-${index + 1}`} key={event.slug}><EventCard event={event} onSave={toggleSaved} saved={saved.includes(event.slug)} /></div>)}</div>
        {curatedEvents.length === 0 && <div className="rounded-2xl border border-dashed border-[#d5d9d3] bg-white p-10 text-center text-sm text-[#717a73]">New events for this category are landing soon. Try another filter.</div>}
      </section>

      <section className="border-y border-[#e7e9e4] bg-white" id="categories"><div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e15f49]">Follow your curiosity</p><h2 className="font-display text-[clamp(2.5rem,4vw,3.8rem)] leading-[0.94] text-[#242725]">What are you<br /><span className="text-[#929b94]">in the mood for?</span></h2></div><p className="max-w-[250px] text-[13px] leading-5 text-[#7b847d]">From the spontaneous to the meticulously planned, there’s a place for you here.</p></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{categories.map((item) => <Link className={`group relative overflow-hidden rounded-[20px] ${item.color} p-5 transition-transform hover:-translate-y-1`} href={`/events?category=${encodeURIComponent(item.name)}`} key={item.name}><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 font-display text-[28px] text-[#242725]">{item.symbol}</span><h3 className="mt-12 text-[16px] font-semibold tracking-[-0.03em] text-[#242725]">{item.name}</h3><div className="mt-1 flex items-center justify-between text-[11px] text-[#677168]"><span>{item.count}</span><ArrowUpRight className="opacity-0 transition-opacity group-hover:opacity-100" size={15} /></div></Link>)}</div></div></section>

      <section className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8" id="how-it-works"><div><div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f16d55] text-[#242725] shadow-[4px_4px_0_#242725]"><Sparkles size={26} /></div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e15f49]">The evently edit</p><h2 className="font-display text-[clamp(2.7rem,4.6vw,4.4rem)] leading-[0.91] text-[#242725]">Good plans<br />start <span className="text-[#e15f49]">here.</span></h2><p className="mt-6 max-w-[360px] text-[14px] leading-6 text-[#747d76]">We believe the best memories are the ones you almost didn’t make. That’s why we make finding your next yes feel effortless.</p><Link className="mt-7 inline-flex items-center gap-2 text-[13px] font-semibold text-[#242725] hover:text-[#e15f49]" href="/events">Explore the edit <ArrowRight size={16} /></Link></div><div className="grid gap-3 sm:grid-cols-2"><div className="relative min-h-[240px] overflow-hidden rounded-[24px] bg-[#202321] p-6 text-white sm:row-span-2 sm:min-h-[400px]"><div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[28px] border-[#f16d55]/80" /><div className="absolute bottom-5 left-6 right-6"><p className="text-[11px] uppercase tracking-[0.15em] text-white/45">01 / Discover</p><h3 className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">Follow the feeling</h3><p className="mt-2 max-w-[240px] text-[12px] leading-5 text-white/55">Find the places, people and ideas you didn’t know you were looking for.</p></div></div><div className="relative min-h-[190px] overflow-hidden rounded-[24px] bg-[#eee5c8] p-6 text-[#242725]"><div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#242725]/20"><CalendarDays size={19} /></div><p className="text-[11px] uppercase tracking-[0.15em] text-[#242725]/45">02 / Save</p><h3 className="mt-12 text-[20px] font-semibold tracking-[-0.04em]">Make a little room</h3></div><div className="relative min-h-[190px] overflow-hidden rounded-[24px] bg-[#e8e3ef] p-6 text-[#242725]"><div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#242725]/20"><Users size={19} /></div><p className="text-[11px] uppercase tracking-[0.15em] text-[#242725]/45">03 / Go</p><h3 className="mt-12 text-[20px] font-semibold tracking-[-0.04em]">Bring your people</h3></div></div></section>

      <section className="relative mx-5 mb-16 overflow-hidden rounded-[28px] bg-[#f16d55] px-6 py-12 sm:px-12 sm:py-16 lg:mx-auto lg:mb-24 lg:max-w-[1232px] lg:px-20"><div className="absolute right-[-70px] top-[-90px] h-72 w-72 rounded-full border-[50px] border-[#202321]/10" /><div className="absolute bottom-[-100px] left-[42%] h-64 w-64 rounded-full border-[35px] border-white/10" /><div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#202321]/55">For the ones making it happen</p><h2 className="font-display max-w-[620px] text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.91] text-[#202321]">Your next full house<br /><span className="text-white">starts with a hello.</span></h2></div><Link className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-[#202321] px-5 py-3.5 text-[13px] font-semibold text-white hover:bg-white hover:text-[#202321]" href="/admin/events/new">Create an event <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f16d55] text-[#202321]"><ArrowUpRight size={15} /></span></Link></div></section>

      <SiteFooter />
    </main>
  );
}
