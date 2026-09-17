import Image from "next/image";
import Link from "next/link";
import { Bookmark, CalendarDays, MapPin } from "@/components/icons";
import type { PublicEvent } from "@/lib/contracts";

type EventCardProps = { event: PublicEvent; featured?: boolean; onSave?: (slug: string) => void; saved?: boolean };

export function EventCard({ event, featured = false, onSave, saved = false }: EventCardProps) {
  return (
    <article className="lift-card group overflow-hidden rounded-[22px] border border-[#e4e6e0] bg-white transition-all duration-300">
      <div className={`image-zoom relative overflow-hidden ${featured ? "aspect-[1.3/1]" : "aspect-[1.38/1]"}`}>
        <Image alt={event.title} className="object-cover" fill sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 31vw" src={event.image} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          {event.tags[0] && <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#242725] backdrop-blur">{event.tags[0]}</span>}
          <span className="rounded-full bg-[#242725]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-white backdrop-blur">{event.category}</span>
        </div>
        <button aria-label={saved ? `Remove ${event.title} from saved` : `Save ${event.title}`} className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all ${saved ? "bg-[#f16d55] text-[#242725]" : "bg-white/90 text-[#242725] hover:bg-[#f16d55]"}`} onClick={() => onSave?.(event.slug)} type="button">
          <Bookmark size={16} strokeWidth={saved ? 2.2 : 1.8} />
        </button>
        <div className="absolute bottom-4 left-4 flex h-[52px] w-[52px] flex-col items-center justify-center rounded-[14px] bg-white text-[#242725] shadow-lg">
          <span className="text-[10px] font-bold tracking-[0.16em] text-[#f16d55]">{event.month}</span>
          <span className="font-display text-[24px] leading-5">{event.day}</span>
        </div>
      </div>
      <Link className="block p-5" href={`/events/${event.slug}`}>
        <div className="mb-3 flex items-center justify-between gap-3 text-[11px] font-medium text-[#7c847e]">
          <span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin size={13} /> {event.venueName}</span>
          <span className="flex shrink-0 items-center gap-1.5"><CalendarDays size={13} /> {event.date}</span>
        </div>
        <h3 className="max-w-[280px] text-[20px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#242725] transition-colors group-hover:text-[#d95742]">{event.title}</h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#747c76]">{event.shortDescription}</p>
        <div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-4">
          <span className="text-[13px] font-semibold text-[#242725]">{event.priceLabel ?? "Tickets to be announced"}</span>
          <span className="text-[12px] font-medium text-[#7c847e]">{event.attendees}</span>
        </div>
      </Link>
    </article>
  );
}
