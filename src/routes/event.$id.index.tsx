import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EVENTS, SAMPLE_REVIEWS, formatNaira, isEventSoldOut, minTierPrice } from "@/data/mockData";
import { useEventMate } from "@/context/EventMateContext";
import { ChevronLeft, Heart, BadgeCheck, Calendar, MapPin, Star, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/event/$id/")({ component: EventDetail });

function EventDetail() {
  const { id } = Route.useParams();
  const event = EVENTS.find(e => e.id === id);
  const { saved, toggleSave } = useEventMate();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"about" | "tickets" | "reviews">("about");
  const [selected, setSelected] = useState<string | null>(null);

  if (!event) return <PhoneFrame><div className="p-6">Event not found.</div></PhoneFrame>;
  const isSaved = saved.includes(event.id);
  const soldOut = isEventSoldOut(event);

  const orgInitials = event.organizer
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const orgColors = ["bg-brand-indigo", "bg-brand-amber", "bg-brand-success", "bg-brand-error"];
  const orgColor =
    orgColors[event.organizer.charCodeAt(0) % orgColors.length];

  const getTicket = () => {
    if (soldOut) { toast("We'll let you know if extra tickets are released."); return; }
    const tier = selected || event.tiers.find(t => t.available > 0)?.id;
    if (!tier) return;
    navigate({ to: "/event/$id/checkout", params: { id: event.id }, search: { tierId: tier, qty: 1 } });
  };

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="relative h-[55vh]">
          <img src={event.heroImage} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />
          <Link
            to="/home"
            className="absolute top-4 left-4 h-10 w-10 grid place-items-center rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
          <button
            onClick={() => toggleSave(event.id)}
            className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label={isSaved ? "Unsave" : "Save"}
          >
            <Heart className={`h-5 w-5 transition-transform ${isSaved ? "fill-brand-amber text-brand-amber scale-110" : "text-white"}`} />
          </button>
        </div>

        <div className="-mt-[30px] relative bg-white rounded-t-[24px] px-5 pt-6 shadow-[0_-8px_24px_-12px_rgba(14,17,51,0.18)]">
          <h1 className="text-[28px] leading-[1.15] font-semibold text-brand-indigo tracking-tight line-clamp-2">{event.title}</h1>

          <div className="mt-3 flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-full ${orgColor} text-white grid place-items-center text-[11px] font-bold shrink-0`}>
              {orgInitials}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-1.5 text-sm">
              <span className="font-medium text-brand-ink truncate">{event.organizer}</span>
              {event.organizerVerified && <BadgeCheck className="h-4 w-4 text-brand-indigo shrink-0" />}
            </div>
            <button className="text-xs text-brand-indigo font-medium shrink-0">5 past events</button>
          </div>

          <div className="mt-4 space-y-2 text-sm text-brand-ink">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-brand-indigo shrink-0" />
              <span>{format(new Date(event.date), "EEEE, d MMMM")}, doors {event.doorsOpen}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-brand-indigo shrink-0" />
              <span>{event.venue}, {event.area}</span>
            </div>
          </div>

          <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-indigo bg-brand-mist hover:bg-brand-mist/70 px-3 py-1.5 rounded-full transition-colors">
            <MapPin className="h-3.5 w-3.5" /> Show on map
          </button>

          <div className="mt-6 flex gap-6 border-b border-brand-mist text-sm">
            {(["about", "tickets", "reviews"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative pb-3 capitalize transition-colors ${tab === t ? "text-brand-indigo font-semibold" : "text-brand-slate"}`}
              >
                {t}
                {tab === t && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand-amber rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="py-5">
            {tab === "about" && (
              <div className="space-y-4">
                <p className="text-sm text-brand-ink leading-relaxed">{event.description}</p>
                <div className="rounded-xl border border-brand-mist p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-indigo text-white grid place-items-center font-semibold text-sm">{event.organizer[0]}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold flex items-center gap-1">{event.organizer} {event.organizerVerified && <BadgeCheck className="h-4 w-4 text-brand-indigo" />}</div>
                    <button className="text-xs text-brand-indigo font-medium">See 5 other events</button>
                  </div>
                </div>
              </div>
            )}

            {tab === "tickets" && (
              <div className="space-y-3">
                {event.tiers.map(t => {
                  const tSold = t.available === 0;
                  const low = t.available > 0 && t.available < 20;
                  const isSelected = selected === t.id;
                  return (
                    <button
                      key={t.id}
                      disabled={tSold}
                      onClick={() => setSelected(t.id)}
                      className={`relative w-full text-left rounded-[12px] p-4 transition ${
                        isSelected
                          ? "border-2 border-brand-indigo bg-brand-indigo/[0.03] p-[15px]"
                          : "border border-brand-mist"
                      } ${tSold ? "opacity-60" : ""}`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-amber grid place-items-center">
                          <Check className="h-3 w-3 text-brand-indigo" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[16px] font-semibold text-brand-indigo">{t.name}</div>
                        {!isSelected && (
                          <div className="text-[18px] font-bold text-brand-indigo shrink-0">
                            {t.price === 0 ? "Free" : formatNaira(t.price)}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="text-[18px] font-bold text-brand-indigo mt-0.5">
                          {t.price === 0 ? "Free" : formatNaira(t.price)}
                        </div>
                      )}
                      <div className="text-xs text-brand-slate mt-1.5 leading-relaxed">{t.description}</div>
                      <div className="mt-2.5">
                        {tSold ? (
                          <span className="inline-block text-[10px] font-semibold bg-brand-error/10 text-brand-error px-2 py-0.5 rounded uppercase tracking-wider">
                            Sold out
                          </span>
                        ) : low ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-warning">
                            <span className="h-2 w-2 rounded-full bg-brand-warning" />
                            Only {t.available} left
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-success">
                            <span className="h-2 w-2 rounded-full bg-brand-success" />
                            Available
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-semibold text-brand-indigo">{event.rating}</div>
                  <div>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(event.rating) ? "fill-brand-amber text-brand-amber" : "text-brand-mist"}`} />)}</div>
                    <div className="text-xs text-brand-slate mt-0.5">{event.reviewCount} reviews</div>
                  </div>
                </div>
                {SAMPLE_REVIEWS.map(r => (
                  <div key={r.name} className="rounded-xl border border-brand-mist p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= r.rating ? "fill-brand-amber text-brand-amber" : "text-brand-mist"}`} />)}</div>
                    </div>
                    <p className="text-xs text-brand-slate mt-1">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 absolute bottom-0 left-0 right-0 px-4 pt-3 pb-4 bg-white/90 backdrop-blur-md border-t border-brand-mist flex items-center gap-3">
        <div className="text-xs">
          <div className="text-brand-slate">{soldOut ? "Status" : "from"}</div>
          <div className="text-base font-bold text-brand-indigo">{soldOut ? "Sold out" : formatNaira(minTierPrice(event))}</div>
        </div>
        <div className="flex-1">
          <PrimaryButton onClick={getTicket} className="h-12 text-base font-semibold">
            {soldOut ? "Notify me if released" : "Get Ticket"}
          </PrimaryButton>
        </div>
      </div>
    </PhoneFrame>
  );
}