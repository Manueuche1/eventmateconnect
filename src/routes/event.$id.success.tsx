import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton, SecondaryButton } from "@/components/PrimaryButton";
import { useEventMate } from "@/context/EventMateContext";
import { EVENTS } from "@/data/mockData";
import { z } from "zod";
import { Check } from "lucide-react";

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

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="h-20 w-20 rounded-full bg-brand-amber grid place-items-center em-pop">
          <Check className="h-10 w-10 text-brand-indigo" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-brand-indigo tracking-tight">You're in.</h1>
        <p className="mt-2 text-sm text-brand-slate max-w-xs">Your ticket is in My Tickets. We'll remind you 2 hours before doors.</p>
      </div>
      <div className="shrink-0 p-5 space-y-3">
        <PrimaryButton onClick={() => ticketId && navigate({ to: "/ticket/$id", params: { id: ticketId } })}>View ticket</PrimaryButton>
        <Link to="/home" className="block text-center text-sm font-medium text-brand-indigo">Back to home</Link>
      </div>
    </PhoneFrame>
  );
}