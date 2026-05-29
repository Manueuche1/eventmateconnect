import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Minus, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/event/$id/checkout")({
  component: Checkout,
  validateSearch: z.object({ tierId: z.string(), qty: z.number().optional() }),
});

function Checkout() {
  useRequireAuth();
  const { id } = Route.useParams();
  const { tierId, qty: initialQty } = useSearch({ from: "/event/$id/checkout" });
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [qty, setQty] = useState<number>(initialQty || 1);
  const [seconds, setSeconds] = useState(10 * 60);
  const [claiming, setClaiming] = useState(false);

  // Hold timer (cosmetic for demo, but kept for realism)
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // Fetch the event + tier from Supabase
  const { data, isLoading } = useQuery({
    queryKey: ["checkout-event", id, tierId],
    queryFn: async () => {
      const [{ data: event }, { data: tier }] = await Promise.all([
        supabase.from("events").select("id, title, venue, area, event_date").eq("id", id).maybeSingle(),
        supabase.from("ticket_tiers").select("id, name, description, price_ngn").eq("id", tierId).maybeSingle(),
      ]);
      return { event, tier };
    },
  });

  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  const onClaim = async () => {
    if (!user || !profile) {
      toast.error("Please sign in to continue");
      return;
    }
    if (!data?.event || !data?.tier) {
      toast.error("Something went wrong loading this event");
      return;
    }

    setClaiming(true);
    try {
      // Insert N ticket rows, one per quantity. The DB trigger generates ticket_code automatically.
      const rows = Array.from({ length: qty }, () => ({
        user_id: user.id,
        event_id: id,
        tier_id: tierId,
        holder_name: profile.full_name,
        status: "active" as const,
      }));

      const { data: inserted, error } = await supabase
        .from("tickets")
        .insert(rows)
        .select("id");

      if (error) throw error;
      if (!inserted || inserted.length === 0) throw new Error("No tickets created");

      toast.success(qty > 1 ? `${qty} tickets claimed` : "Ticket claimed");

      // Navigate to the first new ticket's detail page
      navigate({ to: "/ticket/$id", params: { id: inserted[0].id } });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't claim ticket. Try again.");
      setClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <PhoneFrame>
        <TopBar title="Your order" back={`/event/${id}`} />
        <div className="p-5 space-y-3">
          <div className="h-24 rounded-xl bg-brand-mist animate-pulse" />
          <div className="h-32 rounded-xl bg-brand-mist animate-pulse" />
        </div>
      </PhoneFrame>
    );
  }

  if (!data?.event || !data?.tier) {
    return (
      <PhoneFrame>
        <TopBar title="Your order" back={`/event/${id}`} />
        <div className="p-6 text-sm text-brand-slate">
          We couldn't find that event or tier.{" "}
          <Link to="/home" className="text-brand-indigo font-medium">Back to home</Link>
        </div>
      </PhoneFrame>
    );
  }

  const event = data.event;
  const tier = data.tier;

  return (
    <PhoneFrame>
      <TopBar title="Your order" back={`/event/${id}`} />
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Demo mode banner */}
        <div className="rounded-xl bg-brand-amber/15 border border-brand-amber/40 p-3 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-brand-indigo shrink-0 mt-0.5" />
          <div className="text-xs text-brand-ink leading-relaxed">
            <span className="font-semibold">Demo mode.</span> All tickets are free, no payment required.
          </div>
        </div>

        {/* Event + tier summary */}
        <div className="rounded-xl border border-brand-mist p-4">
          <div className="text-xs text-brand-slate">{event.title}</div>
          <div className="text-[11px] text-brand-slate mt-0.5">{event.venue}, {event.area}</div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{tier.name}</div>
              <div className="text-xs text-brand-slate">Free in demo mode</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center disabled:opacity-50"
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(4, q + 1))}
                className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center disabled:opacity-50"
                disabled={qty >= 4}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Order totals */}
        <div className="rounded-xl bg-brand-mist p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-slate">{qty} × {tier.name}</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-brand-slate">Platform fee</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-white/60 font-semibold text-brand-indigo">
            <span>Total</span>
            <span>₦0</span>
          </div>
        </div>

        <div className="text-xs text-brand-slate">
          Your tickets are held for{" "}
          <span className="font-semibold text-brand-ink">{mm}:{ss}</span>. Up to 4 tickets per order.
        </div>
      </div>

      <div className="shrink-0 p-4 border-t border-brand-mist">
        <PrimaryButton onClick={onClaim} disabled={claiming}>
          {claiming ? "Claiming..." : `Claim ${qty > 1 ? `${qty} free tickets` : "free ticket"}`}
        </PrimaryButton>
      </div>
    </PhoneFrame>
  );
}
