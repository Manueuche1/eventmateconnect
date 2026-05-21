import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EVENTS, formatNaira } from "@/data/mockData";
import { useEventMate } from "@/context/EventMateContext";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/event/$id/checkout")({
  component: Checkout,
  validateSearch: z.object({ tierId: z.string(), qty: z.number().optional() }),
});

function Checkout() {
  const { id } = Route.useParams();
  const { tierId, qty: initialQty } = useSearch({ from: "/event/$id/checkout" });
  const navigate = useNavigate();
  const event = EVENTS.find(e => e.id === id)!;
  const tier = event.tiers.find(t => t.id === tierId)!;
  const { signedIn } = useEventMate();
  const [qty, setQty] = useState(initialQty || 1);
  const [seconds, setSeconds] = useState(10 * 60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const subtotal = tier.price * qty;
  const fee = 300 * qty;
  const total = subtotal + fee;
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  const onContinue = () => {
    if (!signedIn) navigate({ to: "/auth", search: { next: `/event/${id}/payment?tierId=${tier.id}&qty=${qty}` } });
    else navigate({ to: "/event/$id/payment", params: { id }, search: { tierId: tier.id, qty } });
  };

  return (
    <PhoneFrame>
      <TopBar title="Your order" back={`/event/${id}`} />
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="rounded-xl border border-brand-mist p-4">
          <div className="text-xs text-brand-slate">{event.title}</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{tier.name}</div>
              <div className="text-xs text-brand-slate">{tier.price === 0 ? "Free" : formatNaira(tier.price)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(10, q + 1))} className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-brand-mist p-4 text-sm">
          <div className="flex justify-between"><span className="text-brand-slate">Subtotal</span><span>{formatNaira(subtotal)}</span></div>
          <div className="flex justify-between mt-1"><span className="text-brand-slate">Platform fee</span><span>{formatNaira(fee)}</span></div>
          <div className="flex justify-between mt-3 pt-3 border-t border-white/60 font-semibold text-brand-indigo"><span>Total</span><span>{formatNaira(total)}</span></div>
        </div>

        <div className="text-xs text-brand-slate">Your tickets are held for <span className="font-semibold text-brand-ink">{mm}:{ss}</span>. Up to 10 tickets per person.</div>
      </div>
      <div className="shrink-0 p-4 border-t border-brand-mist">
        <PrimaryButton onClick={onContinue}>{signedIn ? "Continue to payment" : "Sign in to continue"}</PrimaryButton>
      </div>
    </PhoneFrame>
  );
}