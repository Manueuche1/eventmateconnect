import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { useEventMate } from "@/context/EventMateContext";
import { EVENTS } from "@/data/mockData";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, Copy, Check } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/ticket/$id")({ component: TicketDetail });

function TicketDetail() {
  const { id } = Route.useParams();
  const { tickets, user } = useEventMate();
  const t = tickets.find(x => x.id === id);
  if (!t)
    return (
      <PhoneFrame>
        <TopBar title="Ticket" back="/tickets" />
        <div className="p-6 text-sm text-brand-slate">Ticket not found.</div>
      </PhoneFrame>
    );
  const e = EVENTS.find(ev => ev.id === t.eventId)!;
  const short = useMemo(
    () =>
      "EM-" +
      t.id.slice(-4).toUpperCase() +
      "-" +
      t.id.slice(0, 4).toUpperCase(),
    [t.id],
  );
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(short).catch(() => {});
    }
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <PhoneFrame>
      <div
        className="flex-1 overflow-y-auto pb-6"
        style={{
          background:
            "linear-gradient(to bottom, #1A1F71 0%, #2A3094 100%)",
        }}
      >
        {/* Back */}
        <div className="px-5 pt-5 pb-3 flex items-center">
          <Link
            to="/tickets"
            className="h-9 w-9 grid place-items-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
        </div>

        <div className="px-4">
          {/* Top card: event header */}
          <div className="rounded-t-3xl bg-white/10 backdrop-blur-sm border border-white/15 border-b-0 px-5 py-4 flex items-center gap-3">
            <img
              src={e.heroImage}
              alt={e.title}
              className="h-[60px] w-[60px] rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-[15px] leading-tight line-clamp-2">
                {e.title}
              </div>
              <div className="text-[12px] text-white/80 mt-1">
                {format(new Date(e.date), "EEE, MMM d")} • {e.venue}
              </div>
            </div>
          </div>

          {/* Ticket body card with notches */}
          <div className="relative bg-white rounded-b-2xl rounded-t-md shadow-2xl">
            {/* Top info section */}
            <div className="px-5 pt-5 pb-4">
              <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-slate">
                Admit one
              </div>
              <div className="mt-1.5 text-[22px] font-semibold text-brand-ink leading-tight">
                {user.name}
              </div>
              <div className="mt-2">
                <span className="inline-block bg-brand-amber text-brand-indigo text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full">
                  {t.tierName} × {t.quantity}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-brand-slate">
                    Date & Time
                  </div>
                  <div className="text-sm font-semibold text-brand-ink mt-0.5">
                    {format(new Date(e.date), "EEE, MMM d")}
                  </div>
                  <div className="text-xs text-brand-slate">
                    {format(new Date(e.date), "h:mm a")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-brand-slate">
                    Doors
                  </div>
                  <div className="text-sm font-semibold text-brand-ink mt-0.5">
                    {e.doorsOpen}
                  </div>
                  <div className="text-xs text-brand-slate truncate">{e.venue}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wider text-brand-slate">
                  Ticket ID
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <div className="font-mono text-sm text-brand-ink tracking-wider">
                    {short}
                  </div>
                  <button
                    onClick={copyId}
                    className="h-8 w-8 grid place-items-center rounded-lg bg-brand-mist hover:bg-brand-mist/70 transition-colors"
                    aria-label="Copy ticket ID"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-brand-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-brand-indigo" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Perforated divider with side notches */}
            <div className="relative">
              {/* Left notch — overlay matches gradient at this position */}
              <div
                className="absolute -left-3 -top-3 h-6 w-6 rounded-full"
                style={{ background: "#22277E" }}
              />
              <div
                className="absolute -right-3 -top-3 h-6 w-6 rounded-full"
                style={{ background: "#22277E" }}
              />
              <div className="mx-6 border-t border-dashed border-brand-slate/40" />
            </div>

            {/* QR section */}
            <div className="px-5 pt-6 pb-5 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl border border-brand-mist">
                <QRCodeSVG
                  value={t.id}
                  size={240}
                  fgColor="#1A1F71"
                  bgColor="#FFFFFF"
                  level="H"
                />
              </div>
              <div className="mt-4 text-sm font-medium text-brand-ink">
                Show this at the door
              </div>
            </div>
          </div>

          {/* Wallet buttons */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => toast.success("Added to wallet")}
              className="h-11 rounded-xl bg-black text-white text-[12px] font-semibold active:scale-[0.98] transition"
            >
               Apple Wallet
            </button>
            <button
              onClick={() => toast.success("Added to wallet")}
              className="h-11 rounded-xl bg-white text-brand-ink border border-brand-mist text-[12px] font-semibold active:scale-[0.98] transition"
            >
              Google Wallet
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-white/80">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Works offline
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}