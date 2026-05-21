import { Link } from "@tanstack/react-router";
import { Heart, BadgeCheck } from "lucide-react";
import { EventItem, formatNaira, minTierPrice, isEventSoldOut } from "@/data/mockData";
import { useEventMate } from "@/context/EventMateContext";
import { format } from "date-fns";

export function EventCard({ event, size = "md" }: { event: EventItem; size?: "sm" | "md" | "lg" }) {
  const { saved, toggleSave } = useEventMate();
  const isSaved = saved.includes(event.id);
  const w = size === "sm" ? "w-[180px]" : size === "lg" ? "w-full" : "w-[220px]";
  const soldOut = isEventSoldOut(event);
  return (
    <Link to="/event/$id" params={{ id: event.id }} className={`${w} shrink-0 block rounded-xl overflow-hidden bg-white relative em-fade`}>
      <div className="relative aspect-[3/4] bg-brand-mist">
        <img src={event.heroImage} alt={event.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(event.id); }}
          className="absolute top-2 right-2 h-9 w-9 grid place-items-center rounded-full bg-white/90 backdrop-blur"
          aria-label="Save"
        >
          <Heart className={`h-4 w-4 transition-transform ${isSaved ? "fill-brand-error text-brand-error scale-110" : "text-brand-ink"}`} />
        </button>
        {soldOut && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-wider uppercase bg-brand-ink/85 text-white px-2 py-1 rounded">Sold out</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-center gap-1 text-[11px] opacity-90">
            <span className="truncate">{event.organizer}</span>
            {event.organizerVerified && <BadgeCheck className="h-3 w-3 text-brand-amber" />}
          </div>
          <div className="text-sm font-semibold leading-tight line-clamp-2 mt-0.5">{event.title}</div>
          <div className="text-[11px] opacity-90 mt-1">{format(new Date(event.date), "EEE, MMM d • h:mm a")}</div>
          <div className="text-[11px] opacity-80">{event.venue}, {event.area}</div>
          <div className="text-xs font-semibold text-brand-amber mt-1">from {formatNaira(minTierPrice(event))}</div>
        </div>
      </div>
    </Link>
  );
}