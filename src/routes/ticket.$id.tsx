import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { useEventMate } from "@/context/EventMateContext";
import { EVENTS } from "@/data/mockData";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/ticket/$id")({ component: TicketDetail });

function TicketDetail() {
  const { id } = Route.useParams();
  const { tickets, user } = useEventMate();
  const t = tickets.find(x => x.id === id);
  if (!t) return <PhoneFrame><TopBar title="Ticket" back="/tickets" /><div className="p-6 text-sm text-brand-slate">Ticket not found.</div></PhoneFrame>;
  const e = EVENTS.find(ev => ev.id === t.eventId)!;
  const short = "EM-" + t.id.slice(-4).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();

  return (
    <PhoneFrame>
      <div className="shrink-0 bg-brand-indigo text-white px-5 pt-12 pb-6">
        <Link to="/tickets" className="text-xs text-white/70">← Back to tickets</Link>
        <h1 className="mt-2 text-xl font-semibold leading-tight">{e.title}</h1>
        <div className="text-xs text-white/70 mt-1">{format(new Date(e.date), "EEE, MMM d • h:mm a")}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 -mt-4 pb-6 space-y-4">
        <div className="rounded-2xl bg-white shadow-md border border-brand-mist p-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-[10px] uppercase tracking-wider text-brand-slate">Holder</div><div className="font-semibold">{user.name}</div></div>
            <div><div className="text-[10px] uppercase tracking-wider text-brand-slate">Tier</div><div className="font-semibold">{t.tierName} × {t.quantity}</div></div>
            <div className="col-span-2"><div className="text-[10px] uppercase tracking-wider text-brand-slate">Ticket ID</div><div className="font-mono text-xs">{short}</div></div>
            <div className="col-span-2"><div className="text-[10px] uppercase tracking-wider text-brand-slate">Venue</div><div className="text-sm">{e.venue}, {e.area}</div></div>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-brand-mist grid place-items-center">
            <QRCodeSVG value={t.id} size={240} fgColor="#1A1F71" includeMargin />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => toast.success("Added to Apple Wallet")} className="h-10 rounded-lg bg-brand-ink text-white text-xs font-medium">Add to Apple Wallet</button>
            <button onClick={() => toast.success("Added to Google Wallet")} className="h-10 rounded-lg bg-white border border-brand-ink text-brand-ink text-xs font-medium">Add to Google Wallet</button>
          </div>
        </div>
        <div className="rounded-xl border border-brand-mist p-4 text-sm">
          <div className="text-[10px] uppercase tracking-wider text-brand-slate">Organizer</div>
          <div className="font-semibold mt-1">{e.organizer}</div>
        </div>
        <p className="text-xs text-brand-slate text-center">This ticket works offline. Screenshot if you'll have no signal.</p>
      </div>
    </PhoneFrame>
  );
}