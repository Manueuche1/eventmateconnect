import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EVENTS, SCAN_NAMES } from "@/data/mockData";
import { Keyboard, X, Check, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/organizer/event/$id/scanner")({ component: Scanner });

type ScanEntry = { name: string; tier: string; time: string; ok: boolean };

const now = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

function Scanner() {
  const { id } = Route.useParams();
  const e = EVENTS.find(x => x.id === id)!;
  const [result, setResult] = useState<null | { ok: boolean; name: string; tier: string; time?: string }>(null);
  const [count, setCount] = useState(84);
  const [flash, setFlash] = useState<"" | "g" | "r">("");
  const [online, setOnline] = useState(true);
  const [sweeping, setSweeping] = useState(false);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const pushHistory = (entry: ScanEntry) => setHistory(h => [entry, ...h].slice(0, 3));

  const scan = () => {
    if (sweeping) return;
    setSweeping(true);
    setResult(null);
    setTimeout(() => {
      const ok = Math.random() > 0.2;
      const name = SCAN_NAMES[Math.floor(Math.random() * SCAN_NAMES.length)];
      setFlash(ok ? "g" : "r");
      const time = now();
      setResult(ok
        ? { ok: true, name, tier: "Regular" }
        : { ok: false, name, tier: "Regular", time: "7:42 PM" });
      pushHistory({ name, tier: "Regular", time, ok });
      if (ok) setCount(c => c + 1);
      setSweeping(false);
      setTimeout(() => setFlash(""), 250);
      setTimeout(() => setResult(null), 1500);
    }, 400);
  };

  const submitManual = () => {
    const v = manualValue.trim().toUpperCase();
    if (!v.startsWith("EM-")) {
      setManualError("Ticket not found");
      return;
    }
    const name = SCAN_NAMES[Math.floor(Math.random() * SCAN_NAMES.length)];
    const time = now();
    pushHistory({ name, tier: "Regular", time, ok: true });
    setCount(c => c + 1);
    setFlash("g");
    setResult({ ok: true, name, tier: "Regular" });
    setTimeout(() => setFlash(""), 250);
    setTimeout(() => setResult(null), 1500);
    setManualOpen(false);
    setManualValue("");
    setManualError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-stretch md:items-center justify-center md:py-6 bg-brand-mist">
      <div className="w-full md:max-w-[420px] md:rounded-[36px] md:shadow-2xl md:overflow-hidden md:h-[860px] relative flex flex-col" style={{ backgroundColor: "#0E1133" }}>
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${online ? "bg-brand-success" : "bg-brand-slate"}`} />
            <span className="text-[10px] uppercase tracking-wider text-white/70">{online ? "Online" : "Offline"}</span>
          </div>
          <Link to="/organizer/event/$id" params={{ id }} className="text-xs text-white font-medium">Done</Link>
        </div>
        <div className="px-5 mt-2">
          <div className="text-sm text-white font-semibold truncate">{e.title}</div>
          <button onClick={() => setOnline(o => !o)} className="mt-1 text-[10px] text-white/60 underline">Simulate {online ? "offline" : "online"}</button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative px-5 gap-4">
          <div className="relative w-60 h-60">
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            <button onClick={scan} disabled={sweeping} className="absolute inset-6 rounded-lg bg-white/5 text-white text-xs font-medium hover:bg-white/10 disabled:opacity-60">
              {sweeping ? "Scanning…" : "Tap to simulate scan"}
            </button>
            <div className="absolute inset-6 overflow-hidden rounded-lg pointer-events-none">
              {sweeping && (
                <div key={Date.now()} className="em-scan-sweep absolute left-0 right-0 top-0 h-[2px] bg-brand-amber shadow-[0_0_12px_2px_rgba(244,183,64,0.7)]" />
              )}
            </div>
            {flash && <div className={`absolute inset-0 rounded-xl ${flash === "g" ? "bg-brand-success/40" : "bg-brand-error/40"} animate-pulse`} />}
          </div>

          <button
            onClick={() => { setManualOpen(true); setManualError(null); }}
            className="inline-flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white border border-white/20 rounded-full px-3 py-1.5"
          >
            <Keyboard className="h-3.5 w-3.5" /> Manual entry
          </button>

          {result && (
            <div className={`absolute bottom-4 left-5 right-5 rounded-xl px-4 py-3 text-sm ${result.ok ? "bg-brand-success text-white" : "bg-brand-error text-white"} em-fade`}>
              <div className="font-semibold">{result.ok ? "✓ Valid" : "✗ Already used"}</div>
              <div className="text-xs opacity-90">{result.name} • {result.tier}{result.time ? ` • Checked in at ${result.time}` : ""}</div>
            </div>
          )}
        </div>

        <div className="px-5">
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/60 font-semibold border-b border-white/10">
              Recent scans
            </div>
            {history.length === 0 ? (
              <div className="px-3 py-3 text-[11px] text-white/50">No scans yet.</div>
            ) : (
              history.map((h, i) => (
                <div key={i} className="px-3 py-2 flex items-center gap-2 border-b border-white/5 last:border-b-0 text-[11px] text-white">
                  <span className={`h-5 w-5 rounded-full grid place-items-center shrink-0 ${h.ok ? "bg-brand-success/30" : "bg-brand-error/30"}`}>
                    {h.ok ? <Check className="h-3 w-3 text-brand-success" /> : <X className="h-3 w-3 text-brand-error" />}
                  </span>
                  <div className="flex-1 min-w-0 truncate">{h.name}</div>
                  <div className="text-white/60">{h.time}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-5 pb-6 pt-2 text-center text-white text-sm">
          <span className="font-semibold">{count}</span> <span className="opacity-70">/ 135 checked in</span>
        </div>

        {manualOpen && (
          <div className="absolute inset-0 bg-black/60 grid place-items-center px-5 z-20" onClick={() => setManualOpen(false)}>
            <div onClick={ev => ev.stopPropagation()} className="w-full rounded-2xl bg-white p-5 em-fade">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-brand-indigo">Manual ticket entry</div>
                <button onClick={() => setManualOpen(false)} className="text-brand-slate"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-[11px] text-brand-slate mt-1">Enter a ticket ID (starts with EM-).</p>
              <input
                value={manualValue}
                onChange={ev => { setManualValue(ev.target.value); setManualError(null); }}
                placeholder="EM-XXXXXXXX"
                autoFocus
                className="mt-3 w-full rounded-lg border border-brand-mist px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-indigo"
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