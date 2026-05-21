import { Link } from "@tanstack/react-router";
import { Heart, BadgeCheck } from "lucide-react";
import { EventItem, formatNaira, minTierPrice, isEventSoldOut } from "@/data/mockData";
import { useEventMate } from "@/context/EventMateContext";
import { format } from "date-fns";
import { useState } from "react";

export function EventCard({
  event,
  size = "md",
  variant = "default",
}: {
  event: EventItem;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "trending" | "foryou";
}) {
  const { saved, toggleSave } = useEventMate();
  const isSaved = saved.includes(event.id);
  const soldOut = isEventSoldOut(event);
  const [pop, setPop] = useState(0);

  const widthClass =
    variant === "trending"
      ? "w-[68%] max-w-[260px]"
      : variant === "foryou"
      ? "w-full"
      : size === "sm"
      ? "w-[180px]"
      : size === "lg"
      ? "w-full"
      : "w-[220px]";

  const snapClass = variant === "trending" ? "em-snap-item" : "";

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(event.id);
    setPop(p => p + 1);
  };

  return (
    <Link
      to="/event/$id"
      params={{ id: event.id }}
      className={`${widthClass} ${snapClass} shrink-0 block rounded-2xl overflow-hidden bg-white relative em-fade shadow-sm`}
    >
      <div className="relative aspect-[3/4] bg-brand-mist">
        <img
          src={event.heroImage}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {/* Bottom 50% indigo gradient overlay */}
        <div className="absolute inset-0 em-trending-gradient pointer-events-none" />

        {/* Top-left badge */}
        {variant === "trending" && !soldOut && (
          <span className="absolute top-2 left-2 text-[9px] font-bold tracking-[0.18em] uppercase bg-brand-amber text-brand-indigo px-2 py-1 rounded-md shadow-sm">
            Trending
          </span>
        )}
        {soldOut && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-wider uppercase bg-brand-ink/85 text-white px-2 py-1 rounded">
            Sold out
          </span>
        )}

        {/* Heart top-right */}
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 h-9 w-9 grid place-items-center rounded-full bg-black/25 backdrop-blur-sm hover:bg-black/35 transition-colors"
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <Heart
            key={pop}
            className={`h-4 w-4 ${
              isSaved
                ? "fill-brand-amber text-brand-amber"
                : "text-white"
            } ${pop > 0 ? "em-heart-bounce" : ""}`}
            strokeWidth={2}
          />
        </button>

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-center gap-1 text-[11px] text-brand-amber font-medium">
            <span className="truncate">{event.organizer}</span>
            {event.organizerVerified && <BadgeCheck className="h-3 w-3 text-brand-amber shrink-0" />}
          </div>
          <div className="text-[16px] font-semibold leading-snug line-clamp-2 mt-0.5 text-white">
            {event.title}
          </div>
          <div className="text-[12px] text-white/70 mt-1">
            {format(new Date(event.date), "EEE, MMM d • h:mm a")}
          </div>
          <div className="text-[12px] text-white/70">
            {event.venue}, {event.area}
          </div>
          {variant === "foryou" && (
            <div className="text-[12px] text-white/80 mt-1.5 line-clamp-2 leading-snug">
              {event.description}
            </div>
          )}
          <div className="text-xs font-semibold text-brand-amber mt-1.5">
            from {formatNaira(minTierPrice(event))}
          </div>
        </div>
      </div>
    </Link>
  );
}