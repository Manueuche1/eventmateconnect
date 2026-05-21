import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EVENTS, formatNaira } from "@/data/mockData";
import { z } from "zod";
import { CreditCard, Banknote, Hash, Copy, Phone, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/event/$id/payment")({
  component: Payment,
  validateSearch: z.object({ tierId: z.string(), qty: z.number() }),
});

const methods = [
  { id: "card", label: "Card", sub: "Visa · Verve · Mastercard", icon: CreditCard, cta: "Pay" },
  { id: "transfer", label: "Bank transfer", sub: "Get a virtual account", icon: Banknote, cta: "I've transferred" },
  { id: "ussd", label: "USSD", sub: "Dial from your phone", icon: Hash, cta: "I've dialed" },
] as const;

type MethodId = (typeof methods)[number]["id"];

function Payment() {
  const { id } = Route.useParams();
  const { tierId, qty } = useSearch({ from: "/event/$id/payment" });
  const navigate = useNavigate();
  const event = EVENTS.find(e => e.id === id)!;
  const tier = event.tiers.find(t => t.id === tierId)!;
  const total = tier.price * qty + 300 * qty;
  const [method, setMethod] = useState<MethodId>("card");
  const orderRef = useState(() => "7F" + Math.floor(Math.random() * 9000 + 1000).toString(16).toUpperCase().slice(0, 2))[0];

  const activeMethod = methods.find(m => m.id === method)!;

  return (
    <PhoneFrame>
      <TopBar title="Payment" back={`/event/${id}/checkout`} />
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <h2 className="text-lg font-semibold text-brand-indigo">How would you like to pay?</h2>
        <div className="space-y-2.5">
          {methods.map(m => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <div
                key={m.id}
                className={`rounded-xl border transition ${
                  active ? "border-brand-indigo bg-brand-indigo/[0.03]" : "border-brand-mist bg-white"
                }`}
              >
                <button
                  onClick={() => setMethod(m.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-brand-ink">{m.label}</div>
                    <div className="text-xs text-brand-slate">{m.sub}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-indigo/70">
                    <Icon className="h-5 w-5" />
                    {m.id === "card" && (
                      <span className="text-[10px] font-bold tracking-wider text-brand-slate">VISA</span>
                    )}
                  </div>
                  <span
                    className={`h-5 w-5 rounded-full border-2 grid place-items-center transition ${
                      active ? "border-brand-indigo bg-brand-indigo" : "border-brand-mist"
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </button>
                {active && (
                  <div key={m.id} className="em-expand px-4 pb-4">
                    {m.id === "card" && <CardForm />}
                    {m.id === "transfer" && <TransferDetails orderRef={orderRef} />}
                    {m.id === "ussd" && <UssdDetails orderRef={orderRef} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-brand-mist p-4 text-sm">
          <div className="text-xs text-brand-slate">{event.title}</div>
          <div className="flex justify-between mt-1">
            <span>{tier.name} × {qty}</span>
            <span className="font-semibold">{formatNaira(total)}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0 p-4 border-t border-brand-mist bg-white">
        <PrimaryButton onClick={() => navigate({ to: "/event/$id/processing", params: { id }, search: { tierId, qty } })}>
          {activeMethod.cta} {formatNaira(total)}
        </PrimaryButton>
      </div>
    </PhoneFrame>
  );
}

function CardForm() {
  return (
    <div className="pt-1 space-y-3 border-t border-brand-mist/70 pt-3">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-brand-slate font-medium">Card number</label>
        <div className="mt-1 relative">
          <input
            defaultValue="4242 4242 4242 4242"
            className="w-full h-11 rounded-lg border border-brand-mist px-3 pr-12 text-sm font-mono tracking-wider focus:outline-none focus:border-brand-indigo bg-white"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-brand-indigo">
            VISA
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-brand-slate font-medium">Expiry</label>
          <input
            defaultValue="12/27"
            className="mt-1 w-full h-11 rounded-lg border border-brand-mist px-3 text-sm font-mono focus:outline-none focus:border-brand-indigo bg-white"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-brand-slate font-medium">CVV</label>
          <input
            defaultValue="123"
            className="mt-1 w-full h-11 rounded-lg border border-brand-mist px-3 text-sm font-mono focus:outline-none focus:border-brand-indigo bg-white"
          />
        </div>
      </div>
      <div className="text-[11px] text-brand-slate">Secured by Paystack. Demo mode — no real charge.</div>
    </div>
  );
}

function TransferDetails({ orderRef }: { orderRef: string }) {
  const account = "9012345678";
  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(account).catch(() => {});
    }
    toast.success("Account number copied");
  };
  return (
    <div className="border-t border-brand-mist/70 pt-3 space-y-3">
      <div className="rounded-lg bg-white border border-brand-mist p-3 space-y-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-brand-slate">Bank</div>
          <div className="text-sm font-semibold text-brand-ink">Wema Bank</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-brand-slate">Account number</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-mono font-semibold text-brand-indigo tracking-wider">{account}</div>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo bg-brand-mist hover:bg-brand-mist/70 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-brand-slate">Account name</div>
          <div className="text-sm font-medium text-brand-ink">EVENTMATE/ORDER-{orderRef}</div>
        </div>
      </div>
      <div className="text-[11px] text-brand-slate flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse" />
        We'll detect your transfer within 30 seconds
      </div>
    </div>
  );
}

function UssdDetails({ orderRef }: { orderRef: string }) {
  const code = `*737*000*5000*${orderRef}#`;
  const [seconds, setSeconds] = useState(9 * 60 + 45);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(seconds / 60);
  const ss = (seconds % 60).toString().padStart(2, "0");
  return (
    <div className="border-t border-brand-mist/70 pt-3 space-y-3">
      <div className="rounded-lg bg-white border border-brand-mist p-3 text-center">
        <div className="text-[11px] uppercase tracking-wider text-brand-slate">Dial on your phone</div>
        <div className="mt-1 text-2xl font-mono font-semibold text-brand-indigo tracking-wide">{code}</div>
      </div>
      <button
        onClick={() => toast.success("Opening dialer…")}
        className="w-full h-11 rounded-lg bg-brand-indigo text-white text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
      >
        <Phone className="h-4 w-4" /> Tap to dial
      </button>
      <div className="text-[11px] text-brand-slate text-center flex items-center justify-center gap-1.5">
        <Check className="h-3 w-3 text-brand-success" strokeWidth={3} />
        Code expires in {mm}:{ss}
      </div>
    </div>
  );
}