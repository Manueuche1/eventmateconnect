import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EVENTS, formatNaira } from "@/data/mockData";
import { z } from "zod";
import { CreditCard, Banknote, Hash } from "lucide-react";

export const Route = createFileRoute("/event/$id/payment")({
  component: Payment,
  validateSearch: z.object({ tierId: z.string(), qty: z.number() }),
});

const methods = [
  { id: "card", label: "Card", sub: "Visa, Verve, Mastercard", icon: CreditCard },
  { id: "transfer", label: "Bank transfer", sub: "We'll give you an account number", icon: Banknote },
  { id: "ussd", label: "USSD", sub: "We'll give you a dial code", icon: Hash },
];

function Payment() {
  const { id } = Route.useParams();
  const { tierId, qty } = useSearch({ from: "/event/$id/payment" });
  const navigate = useNavigate();
  const event = EVENTS.find(e => e.id === id)!;
  const tier = event.tiers.find(t => t.id === tierId)!;
  const total = tier.price * qty + 300 * qty;
  const [method, setMethod] = useState("card");

  return (
    <PhoneFrame>
      <TopBar title="Payment" back={`/event/${id}/checkout`} />
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <h2 className="text-lg font-semibold text-brand-indigo">How would you like to pay?</h2>
        <div className="space-y-2">
          {methods.map(m => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`w-full rounded-xl border p-4 flex items-center gap-3 text-left transition ${active ? "border-brand-indigo bg-brand-indigo/5" : "border-brand-mist"}`}>
                <div className="h-10 w-10 rounded-lg bg-brand-mist grid place-items-center"><Icon className="h-5 w-5 text-brand-indigo" /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-xs text-brand-slate">{m.sub}</div>
                </div>
                <span className={`h-5 w-5 rounded-full border-2 ${active ? "border-brand-indigo bg-brand-indigo" : "border-brand-mist"}`} />
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-brand-mist p-4 text-sm">
          <div className="text-xs text-brand-slate">{event.title}</div>
          <div className="flex justify-between mt-1"><span>{tier.name} × {qty}</span><span className="font-semibold">{formatNaira(total)}</span></div>
        </div>
      </div>
      <div className="shrink-0 p-4 border-t border-brand-mist">
        <PrimaryButton onClick={() => navigate({ to: "/event/$id/processing", params: { id }, search: { tierId, qty } })}>Pay {formatNaira(total)}</PrimaryButton>
      </div>
    </PhoneFrame>
  );
}