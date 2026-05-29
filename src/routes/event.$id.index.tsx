import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SAMPLE_REVIEWS } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Heart, BadgeCheck, Calendar, MapPin, Star, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/event/$id/")({ component: EventDetail });

function EventDetail() {
  const { id } = Route.useParams();
  const { savedIds, toggleSave, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"about" | "tickets" | "reviews">("about");
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["event-detail", id],
    queryFn: async () => {
      const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      if (!event) return null;
      const [{ data: tiers }, { data: organizer }] = await Promise.all([
        supabase.from("ticket_tiers").select("*").eq("event_id", id).order("display_order"),
        supabase.from("profiles").select("full_name,organization_name,organization_verified").eq("id", event.organizer_id).maybeSingle(),
      ]);
      return { event, tiers: tiers ?? [], organizer };
    },
  });

  if (isLoading) return <PhoneFrame><div className="p-6 text-sm text-brand-slate">Loading…</div></PhoneFrame>;
  if (!data || !data.event) return <PhoneFrame><div className="p-6">Event not found.</div></PhoneFrame>;

  const event: any = data.event;
  const tiers: any[] = data.tiers;
  const organizerName = data.organizer?.organization_name || data.organizer?.full_name || "Organizer";
  const organizerVerified = !!data.organizer?.organization_verified;
  const isSaved = savedIds.has(event.id);

  const orgInitials = organizerName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const orgColors = ["bg-brand-indigo", "bg-brand-amber", "bg-brand-success", "bg-brand-error"];
  const orgColor = orgColors[organizerName.charCodeAt(0) % orgColors.length];

  const onHeart = () => {
    if (!user) { toast("Sign in to save events"); return; }
    toggleSave(event.id);
  };

  const getTicket = () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const tier = selected || tiers[0]?.id;
    if (!tier) return;
    navigate({ to: "/event/$id/checkout", params: { id: event.id }, search: { tierId: tier, qty: 1 } });
  };

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="relative h-[55vh]">
          <img src={event.hero_image} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />
          <Link to="/home" className="absolute top-4 left-4 h-10 w-10 grid place-items-center rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/50 transition-colors" aria-label="Back">
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
          <button onClick={onHeart} className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/50 transition-colors" aria-label={isSaved ? "Unsave" : "Save"}>
            <Heart className={`h-5 w-5 transition-transform ${isSaved ? "fill-brand-amber text-brand-amber scale-110" : "text-white"}`} />
          </button>
        </div>

        <div className="-mt-[30px] relative bg-white rounded-t-[24px] px-5 pt-6 shadow-[0_-8px_24px_-12px_rgba(14,17,51,0.18)]">
          <h1 className="text-[28px] leading-[1.15] font-semibold text-brand-indigo tracking-tight line-clamp-2">{event.title}</h1>

          <div className="mt-3 flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-full ${orgColor} text-white grid place-items-center text-[11px] font-bold shrink-0`}>{orgInitials}</div>
            <div className="flex-1 min-w-0 flex items-center gap-1.5 text-sm">
              <span className="font-medium text-brand-ink truncate">{organizerName}</span>
              {organizerVerified && <BadgeCheck className="h-4 w-4 text-brand-indigo shrink-0" />}
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-brand-ink">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-brand-indigo shrink-0" />
              <span>{format(new Date(event.event_date), "EEEE, d MMMM")}{event.doors_open ? `, doors ${event.doors_open}` : ""}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-brand-indigo shrink-0" />
              <span>{event.venue}, {event.area}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-6 border-b border-brand-mist text-sm">
            {(["about", "tickets", "reviews"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`relative pb-3 capitalize transition-colors ${tab === t ? "text-brand-indigo font-semibold" : "text-brand-slate"}`}>
                {t}
                {tab === t && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand-amber rounded-full" />}
              </button>
            ))}
          </div>

          <div className="py-5">
            {tab === "about" && (
              <p className="text-sm text-brand-ink leading-relaxed">{event.description}</p>
            )}

            {tab === "tickets" && (
              <div className="space-y-3">
                {tiers.map((t) => {
                  const remaining = (t.quantity_total ?? 0) - (t.quantity_sold ?? 0);
                  const tSold = remaining <= 0;
                  const low = remaining > 0 && remaining < 20;
                  const isSelected = selected === t.id;
                  return (
                    <button key={t.id} disabled={tSold} onClick={() => setSelected(t.id)}
                      className={`relative w-full text-left rounded-[12px] p-4 transition ${isSelected ? "border-2 border-brand-indigo bg-brand-indigo/[0.03] p-[15px]" : "border border-brand-mist"} ${tSold ? "opacity-60" : ""}`}>
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-amber grid place-items-center">
                          <Check className="h-3 w-3 text-brand-indigo" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[16px] font-semibold text-brand-indigo">{t.name}</div>
                        <div className="text-[18px] font-bold text-brand-indigo shrink-0">Free</div>
                      </div>
                      <div className="text-xs text-brand-slate mt-1.5 leading-relaxed">{t.description}</div>
                      <div className="mt-2.5">
                        {tSold ? (
                          <span className="inline-block text-[10px] font-semibold bg-brand-error/10 text-brand-error px-2 py-0.5 rounded uppercase tracking-wider">Sold out</span>
                        ) : low ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-warning">
                            <span className="h-2 w-2 rounded-full bg-brand-warning" />Only {remaining} left
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-success">
                            <span className="h-2 w-2 rounded-full bg-brand-success" />Available
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
                  <div className="text-3xl font-semibold text-brand-indigo">{event.rating ?? 0}</div>
                  <div>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(event.rating ?? 0) ? "fill-brand-amber text-brand-amber" : "text-brand-mist"}`} />)}</div>
                    <div className="text-xs text-brand-slate mt-0.5">{event.review_count ?? 0} reviews</div>
                  </div>
                </div>
                {SAMPLE_REVIEWS.map(r => (
                  <div key={r.name} className="rounded-xl border border-brand-mist p-3">
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-xs text-brand-slate mt-0.5">{r.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 absolute bottom-0 left-0 right-0 px-4 pt-3 pb-4 bg-white/90 backdrop-blur-md border-t border-brand-mist flex items-center gap-3">
        <div className="text-xs">
          <div className="text-brand-slate">Price</div>
          <div className="text-base font-bold text-brand-indigo">Free in demo</div>
        </div>
        <div className="flex-1">
          <PrimaryButton onClick={getTicket} className="h-12 text-base font-semibold">Get Ticket</PrimaryButton>
        </div>
      </div>
    </PhoneFrame>
  );
}
