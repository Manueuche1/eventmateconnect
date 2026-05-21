import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EVENTS, SCAN_NAMES } from "@/data/mockData";

export const Route = createFileRoute("/organizer/event/$id/scanner")({ component: Scanner });

function Scanner() {
  const { id } = Route.useParams();
  const e = EVENTS.find(x => x.id === id)!;
  const [result, setResult] = useState<null | { ok: boolean; name: string; tier: string; time?: string }>(null);
  const [count, setCount] = useState(84);
  const [flash, setFlash] = useState<"" | "g" | "r">("");
  const [online, setOnline] = useState(true);

  const scan = () => {
    const ok = Math.random() > 0.2;
    const name = SCAN_NAMES[Math.floor(Math.random() * SCAN_NAMES.length)];
    setFlash(ok ? "g" : "r");
    setResult(ok
      ? { ok: true, name, tier: "Regular" }
      : { ok: false, name, tier: "Regular", time: "7:42 PM" });
    if (ok) setCount(c => c + 1);
    setTimeout(() => setFlash(""), 250);
    setTimeout(() => setResult(null), 1500);
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

        <div className="flex-1 grid place-items-center relative">
          <div className="relative w-64 h-64">
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            <button onClick={scan} className="absolute inset-6 rounded-lg bg-white/5 text-white text-xs font-medium hover:bg-white/10">
              Tap to simulate scan
            </button>
            {flash && <div className={`absolute inset-0 rounded-xl ${flash === "g" ? "bg-brand-success/40" : "bg-brand-error/40"} animate-pulse`} />}
          </div>
          {result && (
            <div className={`absolute bottom-6 left-5 right-5 rounded-xl px-4 py-3 text-sm ${result.ok ? "bg-brand-success text-white" : "bg-brand-error text-white"} em-fade`}>
              <div className="font-semibold">{result.ok ? "✓ Valid" : "✗ Already used"}</div>
              <div className="text-xs opacity-90">{result.name} • {result.tier}{result.time ? ` • Checked in at ${result.time}` : ""}</div>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-2 text-center text-white text-sm">
          <span className="font-semibold">{count}</span> <span className="opacity-70">/ 135 checked in</span>
        </div>
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