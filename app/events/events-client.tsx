"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import { ArrowRight, ChevronDown, Filter, MapPin, Search, SlidersHorizontal } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categories, events } from "@/lib/events";

export default function EventsClient({ initialSearch, initialCategory }: { initialSearch: string; initialCategory: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory || "All");
  const [sort, setSort] = useState("Recommended");
  const [city, setCity] = useState("Mumbai");
  const [saved, setSaved] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = events.filter((event) => {
      const matchesSearch = !query || [event.title, event.category, event.location, event.shortDescription].some((text) => text.toLowerCase().includes(query));
      const matchesCategory = category === "All" || event.category === category;
      const matchesCity = city === "Everywhere" || event.city.includes(city);
      return matchesSearch && matchesCategory && matchesCity;
    });
    if (sort === "Price: low to high") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "Popularity") return [...result].sort((a, b) => b.sold / b.capacity - a.sold / a.capacity);
    if (sort === "Newly added") return [...result].reverse();
    return result;
  }, [category, city, search, sort]);

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <div className="border-b border-[#e8eae5] bg-[#f7f7f4]"><SiteHeader /></div>
      <section className="bg-[#202321] px-5 pb-12 pt-10 text-white sm:pb-16 lg:px-8 lg:pt-14">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f16d55]"><span className="h-1.5 w-1.5 rounded-full bg-[#f16d55]" /> Explore the calendar</div>
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><h1 className="font-display text-[clamp(3.2rem,6vw,5.8rem)] leading-[0.88]">All the good stuff,<br /><span className="text-white/40">in one place.</span></h1></div><p className="max-w-[310px] text-[13px] leading-6 text-white/60">A considered collection of live music, smart ideas, good food and the people worth meeting.</p></div>
          <div className="mt-10 flex max-w-[680px] items-center rounded-[15px] bg-white p-2 text-[#242725] shadow-2xl"><Search className="ml-3 shrink-0 text-[#89928b]" size={18} /><input aria-label="Search events" className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[14px] outline-none placeholder:text-[#a3aaa5]" onChange={(event) => setSearch(event.target.value)} placeholder="Search by event, category or venue" value={search} /><button className="hidden h-11 rounded-[11px] bg-[#f16d55] px-5 text-[13px] font-semibold hover:bg-[#242725] hover:text-white sm:block" onClick={() => setSearch(search)} type="button">Search</button></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[13px] text-[#7a837c]">Showing <span className="font-semibold text-[#242725]">{filteredEvents.length} events</span> near you</p></div><button className="flex items-center gap-2 rounded-full border border-[#dfe3dd] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#242725] hover:border-[#f16d55] lg:hidden" onClick={() => setShowFilters(!showFilters)} type="button"><SlidersHorizontal size={15} /> Filters</button><label className="hidden items-center gap-2 text-[12px] text-[#7a837c] lg:flex">Sort by <span className="relative"><select className="appearance-none rounded-full border border-[#dfe3dd] bg-white py-2.5 pl-4 pr-9 font-semibold text-[#242725] outline-none" onChange={(event) => setSort(event.target.value)} value={sort}><option>Recommended</option><option>Popularity</option><option>Newly added</option><option>Price: low to high</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={14} /></span></label></div>
        <div className={`mt-8 gap-8 lg:grid lg:grid-cols-[225px_1fr] ${showFilters ? "grid" : "hidden lg:grid"}`}>
          <aside className="space-y-8 rounded-[18px] border border-[#e4e6e0] bg-white p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"><div><div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#89928b]"><Filter size={14} /> Filter by</div><div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">{["All", ...categories.map((item) => item.name)].map((item) => <button className={`rounded-full px-3.5 py-2 text-left text-[12px] font-medium lg:w-full lg:rounded-lg ${category === item ? "bg-[#242725] text-white" : "text-[#6e776f] hover:bg-white hover:text-[#242725]"}`} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div></div><div className="border-t border-[#e4e6e0] pt-6"><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#89928b]">Location</p><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89928b]" size={14} /><select className="w-full appearance-none rounded-xl border border-[#dfe3dd] bg-white py-3 pl-9 pr-8 text-[12px] text-[#242725] outline-none" onChange={(event) => setCity(event.target.value)} value={city}><option>Mumbai</option><option>Everywhere</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#89928b]" size={14} /></div></div><div className="border-t border-[#e4e6e0] pt-6"><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#89928b]">Date</p><div className="space-y-2 text-[12px] text-[#69736b]"><label className="flex items-center gap-2"><input className="accent-[#f16d55]" type="checkbox" /> This weekend</label><label className="flex items-center gap-2"><input className="accent-[#f16d55]" type="checkbox" /> Next 30 days</label><label className="flex items-center gap-2"><input className="accent-[#f16d55]" type="checkbox" /> Pick a date</label></div></div></aside>
          <div><div className="mb-5 flex items-center justify-between gap-3 lg:hidden"><label className="flex items-center gap-2 text-[12px] text-[#7a837c]">Sort by <select className="rounded-full border border-[#dfe3dd] bg-white px-3 py-2 font-semibold text-[#242725]" onChange={(event) => setSort(event.target.value)} value={sort}><option>Recommended</option><option>Popularity</option><option>Newly added</option><option>Price: low to high</option></select></label></div>{filteredEvents.length ? <div className="grid gap-5 md:grid-cols-2">{filteredEvents.map((event, index) => <div className="reveal" key={event.slug} style={{ animationDelay: `${index * 70}ms` }}><EventCard event={event} onSave={(slug) => setSaved((items) => items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug])} saved={saved.includes(event.slug)} /></div>)}</div> : <div className="rounded-[22px] border border-dashed border-[#d7dcd5] bg-white px-6 py-20 text-center"><p className="font-display text-3xl text-[#242725]">No events found.</p><p className="mt-2 text-[13px] text-[#7b847d]">Try a different search or clear one of the filters.</p><button className="mt-6 rounded-full bg-[#242725] px-5 py-3 text-[12px] font-semibold text-white" onClick={() => { setSearch(""); setCategory("All"); setCity("Everywhere"); }} type="button">Clear filters</button></div>}<div className="mt-10 flex items-center justify-center gap-2"><button aria-label="Previous page" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e3dd] text-[#8a938c]" type="button">‹</button><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#242725] text-[12px] font-semibold text-white">1</span><button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e3dd] text-[12px] font-semibold text-[#242725] hover:border-[#f16d55]" type="button">2</button><button aria-label="Next page" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e3dd] text-[#242725]" type="button"><ArrowRight size={14} /></button></div></div>
        </div>
      </section>
      <div className="mt-5"><SiteFooter /></div>
    </main>
  );
}
