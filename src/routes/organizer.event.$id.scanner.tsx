import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Keyboard, X, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/event/$id/scanner")({ component: Scanner });

type ScanEntry = {
  code: string;
  name: string;
  tier: string;
  time: string;
  status: "valid" | "used" | "notfound" | "wrongevent";
};

interface EventInfo {
  id: string;
  title: string;
}

const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function Scanner() {
  useRequireAuth({ role: "organizer" });
  const { id: eventId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [flash, setFlash] = useState<"" | "g" | "r">("");
  const [online, setOnline] = useState(true);
  const [sweeping, setSweeping] = useState(false);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [result, setResult] = useState<null | { ok: boolean; message: string; sub?: string }>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  // Fetch event + ticket counts for the title and counter
  const { data: eventData } = useQuery({
    queryKey: ["scanner-event", eventId],
    queryFn: async () => {
      const { data: event } = await supabase
        .from("events")
        .select("id, title")
        .eq("id", eventId)
        .maybeSingle();
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, status")
        .eq("event_id", eventId);
      return {
        event: event as EventInfo | null,
        total: tickets?.length ?? 0,
        checkedIn: tickets?.filter((t) => t.status === "used").length ?? 0,
      };
    },
  });

  const pushHistory = (entry: ScanEntry) =>
    setHistory((h) => [entry, ...h].slice(0, 3));

  const validateCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    // Look up the ticket
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        id, ticket_code, holder_name, status, event_id, scanned_at,
        ticket_tiers ( name )
      `)
      .eq("ticket_code", code)
      .maybeSingle();

    if (error || !ticket) {
      setFlash("r");
      setResult({ ok: false, message: "Ticket not found" });
      pushHistory({
        code,
        name: "Unknown",
        tier: "—",
        time: nowTime(),
        status: "notfound",
      });
      setTimeout(() => setFlash(""), 300);
      setTimeout(() => setResult(null), 1800);
      return;
    }

    // Right event?
    if (ticket.event_id !== eventId) {
      setFlash("r");
      setResult({ ok: false, message: "Wrong event", sub: "This ticket is for a different event" });
      pushHistory({
        code,
        name: ticket.holder_name,
        tier: (ticket.ticket_tiers as any)?.name ?? "—",
        time: nowTime(),
        status: "wrongevent",
      });
      setTimeout(() => setFlash(""), 300);
      setTimeout(() => setResult(null), 1800);
      return;
    }

    // Already used?
    if (ticket.status === "used") {
      setFlash("r");
      const scannedTime = ticket.scanned_at
        ? format(new Date(ticket.scanned_at), "h:mm a")
        : "earlier";
      setResult({
        ok: false,
        message: "Already used",
        sub: `${ticket.holder_name} • checked in at ${scannedTime}`,
      });
      pushHistory({
        code,
        name: ticket.holder_name,
        tier: (ticket.ticket_tiers as any)?.name ?? "—",
        time: nowTime(),
        status: "used",
      });
      setTimeout(() => setFlash(""), 300);
      setTimeout(() => setResult(null), 1800);
      return;
    }

    // Refunded?
    if (ticket.status !== "active") {
      setFlash("r");
      setResult({ ok: false, message: `Ticket ${ticket.status}` });
      setTimeout(() => setFlash(""), 300);
      setTimeout(() => setResult(null), 1800);
      return;
    }

    // Valid scan: mark used
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        status: "used",
        scanned_at: new Date().toISOString(),
        scanned_by: user?.id,
      })
      .eq("id", ticket.id);

    if (updateError) {
      setFlash("r");
      setResult({ ok: false, message: "Couldn't mark as used" });
      setTimeout(() => setFlash(""), 300);
      setTimeout(() => setResult(null), 1800);
      return;
    }

    setFlash("g");
    setResult({
      ok: true,
      message: "Valid",
      sub: `${ticket.holder_name} • ${(ticket.ticket_tiers as any)?.name ?? "—"}`,
    });
    pushHistory({
      code,
      name: ticket.holder_name,
      tier: (ticket.ticket_tiers as any)?.name ?? "—",
      time: nowTime(),
      status: "valid",
    });
    setTimeout(() => setFlash(""), 300);
    setTimeout(() => setResult(null), 1800);

    // Refresh the counter and dashboard
    qc.invalidateQueries({ queryKey: ["scanner-event", eventId] });
    qc.invalidateQueries({ queryKey: ["organizer-event", eventId] });
    qc.invalidateQueries({ queryKey: ["organizer-dashboard"] });
  };

  const simulateScan = async () => {
    if (sweeping) return;
    setSweeping(true);
    setResult(null);

    // Pick a random active ticket for this event to simulate scanning
    const { data: candidates } = await supabase
      .from("tickets")
      .select("ticket_code")
      .eq("event_id", eventId)
      .eq("status", "active")
      .limit(20);

    setTimeout(async () => {
      setSweeping(false);
      if (!candidates || candidates.length === 0) {
        setFlash("r");
        setResult({ ok: false, message: "No active tickets to scan" });
        setTimeout(() => setFlash(""), 300);
        setTimeout(() => setResult(null), 1800);
        return;
      }
      const random = candidates[Math.floor(Math.random() * candidates.length)];
      await validateCode(random.ticket_code);
    }, 500);
  };

  const submitManual = async () => {
    const v = manualValue.trim().toUpperCase();
    if (!v.startsWith("EM-")) {
      setManualError("Ticket codes start with EM-");
      return;
    }
    setManualOpen(false);
    setManualValue("");
    setManualError(null);
    await validateCode(v);
  };

  const eventTitle = eventData?.event?.title ?? "Event";
  const total = eventData?.total ?? 0;
  const checkedIn = eventData?.checkedIn ?? 0;

  return (
    <div className="min-h-screen w-full flex items-stretch md:items-center justify-center md:py-6 bg-brand-mist">
      <div
        className="w-full md:max-w-[420px] md:rounded-[36px] md:shadow-2xl md:overflow-hidden md:h-[860px] relative flex flex-col"
        style={{ backgroundColor: "#0E1133" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${online ? "bg-brand-success" : "bg-brand-slate"}`} />
            <span className="text-[10px] uppercase tracking-wider text-white/70">
              {online ? "Online" : "Offline"}
            </span>
          </div>
          <Link
            to="/organizer/event/$id"
            params={{ id: eventId }}
            className="text-xs text-white font-medium"
          >
            Done
          </Link>
        </div>
        <div className="px-5 mt-2">
          <div className="text-sm text-white font-semibold truncate">{eventTitle}</div>
          <button
            onClick={() => setOnline((o) => !o)}
            className="mt-1 text-[10px] text-white/60 underline"
          >
            Simulate {online ? "offline" : "online"}
          </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-5 gap-4">
          <div className="relative w-60 h-60">
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <button
              onClick={simulateScan}
              disabled={sweeping}
              className="absolute inset-6 rounded-lg bg-white/5 text-white text-xs font-medium hover:bg-white/10 disabled:opacity-60"
            >
              {sweeping ? "Scanning…" : "Tap to simulate scan"}
            </button>
            <div className="absolute inset-6 overflow-hidden rounded-lg pointer-events-none">
              {sweeping && (
                <div
                  key={Date.now()}
                  className="em-scan-sweep absolute left-0 right-0 top-0 h-[2px] bg-brand-amber shadow-[0_0_12px_2px_rgba(244,183,64,0.7)]"
                />
              )}
            </div>
            {flash && (
              <div
                className={`absolute inset-0 rounded-xl ${
                  flash === "g" ? "bg-brand-success/40" : "bg-brand-error/40"
                } animate-pulse`}
              />
            )}
          </div>

          <button
            onClick={() => {
              setManualOpen(true);
              setManualError(null);
            }}
            className="inline-flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white border border-white/20 rounded-full px-3 py-1.5"
          >
            <Keyboard className="h-3.5 w-3.5" /> Manual entry
          </button>

          {result && (
            <div
              className={`absolute bottom-4 left-5 right-5 rounded-xl px-4 py-3 text-sm ${
                result.ok ? "bg-brand-success text-white" : "bg-brand-error text-white"
              } em-fade`}
            >
              <div className="font-semibold">
                {result.ok ? "✓ " : "✗ "}
                {result.message}
              </div>
              {result.sub && <div className="text-xs opacity-90 mt-0.5">{result.sub}</div>}
            </div>
          )}
        </div>

        {/* Recent scans */}
        <div className="px-5">
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/60 font-semibold border-b border-white/10">
              Recent scans
            </div>
            {history.length === 0 ? (
              <div className="px-3 py-3 text-[11px] text-white/50">No scans yet.</div>
            ) : (
              history.map((h, i) => (
                <div
                  key={i}
                  className="px-3 py-2 flex items-center gap-2 border-b border-white/5 last:border-b-0 text-[11px] text-white"
                >
                  <span
                    className={`h-5 w-5 rounded-full grid place-items-center shrink-0 ${
                      h.status === "valid" ? "bg-brand-success/30" : "bg-brand-error/30"
                    }`}
                  >
                    {h.status === "valid" ? (
                      <Check className="h-3 w-3 text-brand-success" />
                    ) : (
                      <X className="h-3 w-3 text-brand-error" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0 truncate">{h.name}</div>
                  <div className="text-white/60">{h.time}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Counter */}
        <div className="px-5 pb-6 pt-2 text-center text-white text-sm">
          <span className="font-semibold">{checkedIn}</span>{" "}
          <span className="opacity-70">/ {total} checked in</span>
        </div>

        {/* Manual entry modal */}
        {manualOpen && (
          <div
            className="absolute inset-0 bg-black/60 grid place-items-center px-5 z-20"
            onClick={() => setManualOpen(false)}
          >
            <div
              onClick={(ev) => ev.stopPropagation()}
              className="w-full rounded-2xl bg-white p-5 em-fade"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-brand-indigo">Manual ticket entry</div>
                <button onClick={() => setManualOpen(false)} className="text-brand-slate">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-brand-slate mt-1">
                Enter a ticket code (format: EM-XXXX-XXXX).
              </p>
              <input
                value={manualValue}
                onChange={(ev) => {
                  setManualValue(ev.target.value);
                  setManualError(null);
                }}
                placeholder="EM-XXXX-XXXX"
                autoFocus
                className="mt-3 w-full rounded-lg border border-brand-mist px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-brand-indigo"
              />
              {manualError && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-error">
                  <AlertCircle className="h-3.5 w-3.5" /> {manualError}
                </div>
              )}
              <button
                onClick={submitManual}
                className="mt-4 w-full h-10 rounded-lg bg-brand-indigo text-white text-sm font-semibold"
              >
                Check in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute h-7 w-7 border-brand-amber";
  const map = {
    tl: "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
    tr: "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
    bl: "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
    br: "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
  };
  return <span className={`${base} ${map[pos]}`} />;
}
