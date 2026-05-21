import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabs } from "@/components/BottomTabs";
import { EventCard } from "@/components/EventCard";
import { EVENTS } from "@/data/mockData";
import { useEventMate } from "@/context/EventMateContext";

export const Route = createFileRoute("/saved")({ component: Saved });

function Saved() {
  const { saved } = useEventMate();
  const events = EVENTS.filter(e => saved.includes(e.id));
  return (
    <PhoneFrame>
      <div className="shrink-0 px-4 py-4 border-b border-brand-mist">
        <h1 className="text-xl font-semibold text-brand-indigo">Saved</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="h-full grid place-items-center text-center text-sm text-brand-slate px-6">
            Nothing saved yet. Tap the heart on any event to come back to it later.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {events.map(e => <EventCard key={e.id} event={e} size="lg" />)}
          </div>
        )}
      </div>
      <BottomTabs />
    </PhoneFrame>
  );
}