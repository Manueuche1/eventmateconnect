import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useEventMate } from "@/context/EventMateContext";
import { EVENTS } from "@/data/mockData";
import { z } from "zod";
import { Check } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/event/$id/success")({
  component: Success,
  validateSearch: z.object({ tierId: z.string(), qty: z.number() }),
});

const newId = () => "tkt-" + Math.random().toString(36).slice(2, 8);

function Success() {
  const { id } = Route.useParams();
  const { tierId, qty } = useSearch({ from: "/event/$id/success" });
  const { addTicket, tickets, user } = useEventMate();
  const navigate = useNavigate();
  const event = EVENTS.find(e => e.id === id)!;
  const tier = event.tiers.find(t => t.id === tierId)!;
  const created = useRef<string | null>(null);

  useEffect(() => {
    if (created.current) return;
    const tid = newId();
    created.current = tid;
    addTicket({
      id: tid, eventId: event.id, tierId: tier.id, tierName: tier.name,
      quantity: qty, holderName: user.name, purchasedAt: new Date().toISOString(),
      total: tier.price * qty + 300 * qty,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ticketId = created.current || tickets[tickets.length - 1]?.id;

  const goToTicket = () => ticketId && navigate({ to: "/ticket/$id", params: { id: ticketId } });

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative">
          {/* Confetti burst */}
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-full bg-brand-amber em-burst-dot"
                style={
                  {
                    "--em-angle": `${i * 45}deg`,
                    animationDelay: `${i * 30}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          <div className="relative h-20 w-20 rounded-full bg-brand-amber grid place-items-center em-check-pop shadow-lg shadow-brand-amber/30">
            <Check className="h-10 w-10 text-brand-indigo" strokeWidth={3} />
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-brand-indigo tracking-tight">You're in.</h1>
        <p className="mt-2 text-sm text-brand-slate max-w-xs">
          Your ticket is in My Tickets. We'll remind you 2 hours before doors.
        </p>

        <button
          onClick={goToTicket}
          className="mt-6 w-full max-w-xs rounded-2xl bg-white border border-brand-mist p-3 flex items-center gap-3 text-left shadow-sm active:scale-[0.98] transition"
        >
          <img
            src={event.heroImage}
            alt={event.title}
            className="h-14 w-14 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-brand-indigo leading-tight line-clamp-2">
              {event.title}
            </div>
            <div className="text-xs text-brand-slate mt-0.5">
              {format(new Date(event.date), "EEE, MMM d • h:mm a")}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-brand-indigo shrink-0">View →</div>
        </button>
      </div>
      <div className="shrink-0 p-5 space-y-3">
        <PrimaryButton onClick={goToTicket}>View ticket</PrimaryButton>
        <Link to="/home" className="block text-center text-sm font-medium text-brand-indigo">
          Back to home
        </Link>
      </div>
    </PhoneFrame>
  );
}