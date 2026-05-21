import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabs } from "@/components/BottomTabs";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useEventMate } from "@/context/EventMateContext";
import { EVENTS } from "@/data/mockData";
import { QrCode } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/tickets")({ component: TicketsScreen });

function TicketsScreen() {
  const { tickets } = useEventMate();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const navigate = useNavigate();
  const now = Date.now();
  const list = tickets.map(t => ({ t, e: EVENTS.find(e => e.id === t.eventId)! }))
    .filter(({ e }) => e && (tab === "upcoming" ? new Date(e.date).getTime() >= now : new Date(e.date).getTime() < now));

  return (
    <PhoneFrame>
      <div className="shrink-0 px-4 pt-4 border-b border-brand-mist">
        <h1 className="text-xl font-semibold text-brand-indigo">My tickets</h1>
        <div className="mt-3 flex gap-4 text-sm">
          {(["upcoming", "past"] as const).map(x => (
            <button key={x} onClick={() => setTab(x)} className={`pb-3 capitalize border-b-2 ${tab === x ? "border-brand-indigo text-brand-indigo font-semibold" : "border-transparent text-brand-slate"}`}>{x}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {list.length === 0 ? (
          <div className="h-full grid place-items-center text-center px-6 gap-4">
            <div className="text-sm text-brand-slate">No tickets yet. Browse events to get started.</div>
            <div className="w-full max-w-[200px]"><PrimaryButton onClick={() => navigate({ to: "/home" })}>Browse events</PrimaryButton></div>
          </div>
        ) : list.map(({ t, e }) => (
          <Link key={t.id} to="/ticket/$id" params={{ id: t.id }} className="block rounded-xl border border-brand-mist p-4 bg-white flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-brand-mist grid place-items-center">
              <QrCode className="h-5 w-5 text-brand-indigo" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-brand-ink truncate">{e.title}</div>
              <div className="text-xs text-brand-slate truncate">{format(new Date(e.date), "EEE, MMM d • h:mm a")} • {e.venue}</div>
              <div className="text-xs text-brand-indigo font-medium mt-0.5">{t.tierName} × {t.quantity}</div>
            </div>
          </Link>
        ))}
      </div>
      <BottomTabs />
    </PhoneFrame>
  );
}