import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EVENTS, SAMPLE_REVIEWS, formatNaira, isEventSoldOut, minTierPrice } from "@/data/mockData";
import { useEventMate } from "@/context/EventMateContext";
import { ChevronLeft, Heart, BadgeCheck, Calendar, MapPin, Star } from "lucide-react";
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

  const getTicket = () => {
    if (soldOut) { toast("We'll let you know if extra tickets are released."); return; }
    const tier = selected || event.tiers.find(t => t.available > 0)?.id;
    if (!tier) return;
    navigate({ to: "/event/$id/checkout", params: { id: event.id }, search: { tierId: tier, qty: 1 } });
  };

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="relative h-[50vh] md:h-[420px]">
          <img src={event.heroImage} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white" />
          <Link to="/home" className="absolute top-4 left-4 h-10 w-10 grid place-items-center rounded-full bg-white/90"><ChevronLeft className="h-5 w-5 text-brand-ink" /></Link>
          <button onClick={() => toggleSave(event.id)} className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-white/90">
            <Heart className={`h-5 w-5 transition-transform ${isSaved ? "fill-brand-error text-brand-error scale-110" : "text-brand-ink"}`} />
          </button>
        </div>

        <div className="-mt-8 relative bg-white rounded-t-3xl px-5 pt-6">
          <h1 className="text-[26px] leading-tight font-semibold text-brand-indigo tracking-tight">{event.title}</h1>
          <div className="mt-2 flex items-center gap-1 text-sm text-brand-slate">
            <span>{event.organizer}</span>
            {event.organizerVerified && <BadgeCheck className="h-4 w-4 text-brand-indigo" />}
          </div>

          <div className="mt-4 space-y-2 text-sm text-brand-ink">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-brand-indigo" /> {format(new Date(event.date), "EEEE, MMM d • h:mm a")}</div>
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-brand-indigo mt-0.5" /><div>{event.venue}, {event.area} <button className="block text-xs text-brand-indigo font-medium mt-0.5">Show on map</button></div></div>
          </div>

          <div className="mt-5 flex gap-5 border-b border-brand-mist text-sm">
            {(["about", "tickets", "reviews"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`pb-3 capitalize border-b-2 ${tab === t ? "border-brand-indigo text-brand-indigo font-semibold" : "border-transparent text-brand-slate"}`}>{t}</button>
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
                  const few = t.available > 0 && t.available <= 10;
                  return (
                    <button key={t.id} disabled={tSold} onClick={() => setSelected(t.id)}
                      className={`w-full text-left rounded-xl border p-4 transition ${selected === t.id ? "border-brand-indigo bg-brand-indigo/5" : "border-brand-mist"} ${tSold ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-brand-ink flex items-center gap-2">{t.name}
                            {tSold && <span className="text-[10px] bg-brand-ink/10 text-brand-ink px-2 py-0.5 rounded uppercase tracking-wider">Sold out</span>}
                            {few && <span className="text-[10px] bg-brand-warning/15 text-brand-warning px-2 py-0.5 rounded uppercase tracking-wider">Few left</span>}
                          </div>
                          <div className="text-xs text-brand-slate mt-1">{t.description}</div>
                        </div>
                        <div className="text-sm font-semibold text-brand-indigo shrink-0">{t.price === 0 ? "Free" : formatNaira(t.price)}</div>
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

      <div className="shrink-0 absolute bottom-0 left-0 right-0 px-4 pt-3 pb-5 bg-white border-t border-brand-mist flex items-center gap-3">
        <div className="text-xs">
          <div className="text-brand-slate">{soldOut ? "Status" : "Starts from"}</div>
          <div className="text-base font-semibold text-brand-indigo">{soldOut ? "Sold out" : formatNaira(minTierPrice(event))}</div>
        </div>
        <div className="flex-1"><PrimaryButton onClick={getTicket}>{soldOut ? "Notify me if released" : "Get Ticket"}</PrimaryButton></div>
      </div>
    </PhoneFrame>
  );
}