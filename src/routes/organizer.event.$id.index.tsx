import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EVENTS, formatNaira, SCAN_NAMES } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Pencil, Share2, ScanLine } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/event/$id/")({ component: OrgEvent });

const SALES_BY_DAY = Array.from({ length: 14 }, (_, i) => ({ day: `D${i + 1}`, sales: Math.round(8 + Math.sin(i / 2) * 4 + i * 0.6) }));

const ATTENDEE_ROWS = [
  { name: "Adaeze Nwosu", tier: "VIP", bought: "Jun 10, 4:12 PM", checked: true },
  { name: "Tunde Bakare", tier: "Regular", bought: "Jun 10, 5:01 PM", checked: true },
  { name: "Funmi Adediran", tier: "Regular", bought: "Jun 11, 9:45 AM", checked: false },
  { name: "Ibrahim Yusuf", tier: "VIP", bought: "Jun 11, 11:20 AM", checked: true },
  { name: "Bose Adeleke", tier: "Table for 4", bought: "Jun 11, 2:08 PM", checked: false },
  { name: "Kunle Sanya", tier: "Regular", bought: "Jun 12, 10:30 AM", checked: true },
  { name: "Aisha Bello", tier: "VIP", bought: "Jun 12, 6:15 PM", checked: false },
  { name: "Ngozi Eze", tier: "Regular", bought: "Jun 13, 8:42 AM", checked: true },
];

function OrgEvent() {
  const { id } = Route.useParams();
  const e = EVENTS.find(x => x.id === id)!;
  const tierData = e.tiers.map(t => ({ name: t.name, sold: t.total - t.available }));
  const sold = 135;
  const checked = 84;

  return (
    <PhoneFrame>
      <TopBar title={e.title} back="/organizer" />
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex gap-3">
          <img src={e.heroImage} alt="" className="h-20 w-20 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-brand-indigo line-clamp-2">{e.title}</div>
            <div className="text-[11px] text-brand-slate mt-0.5">{format(new Date(e.date), "EEE, MMM d • h:mm a")}</div>
            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-success bg-brand-success/12 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse" /> Live
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-brand-mist text-xs font-semibold text-brand-indigo hover:bg-brand-mist/50">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-brand-mist text-xs font-semibold text-brand-indigo hover:bg-brand-mist/50">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Sold", value: `${sold} / 260` },
            { label: "Gross", value: formatNaira(1860000) },
            { label: "Net payout", value: formatNaira(1720000) },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-brand-mist p-3">
              <div className="text-[10px] uppercase tracking-wider text-brand-slate">{s.label}</div>
              <div className="mt-1 text-sm font-semibold text-brand-indigo">{s.value}</div>
            </div>
          ))}
        </div>

        <Link to="/organizer/event/$id/scanner" params={{ id }}>
          <PrimaryButton>
            <span className="inline-flex items-center gap-2"><ScanLine className="h-4 w-4" /> Open scanner</span>
          </PrimaryButton>
        </Link>

        <div className="rounded-xl border border-brand-mist p-4">
          <div className="text-xs font-semibold text-brand-indigo mb-2">Sales, last 14 days</div>
          <div className="h-32">
            <ResponsiveContainer>
              <AreaChart data={SALES_BY_DAY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="orgEvtFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A1F71" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#1A1F71" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#5B6178" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#5B6178" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E3E5EF" }} />
                <Area type="monotone" dataKey="sales" stroke="#1A1F71" strokeWidth={2} fill="url(#orgEvtFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-brand-mist p-4">
          <div className="text-xs font-semibold text-brand-indigo mb-2">Sales by tier</div>
          <div className="h-36">
            <ResponsiveContainer>
              <BarChart data={tierData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#0E1133" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="sold" fill="#F4B740" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-brand-indigo mb-2">Attendees</div>
          <div className="rounded-xl border border-brand-mist overflow-hidden bg-white">
            <div className="grid grid-cols-[1.4fr_0.9fr_1.1fr_0.6fr] gap-2 px-3 py-2 bg-brand-mist/40 text-[10px] uppercase tracking-wider text-brand-slate font-semibold">
              <div>Name</div><div>Tier</div><div>Bought at</div><div className="text-right">In</div>
            </div>
            {ATTENDEE_ROWS.map(r => (
              <div key={r.name} className="grid grid-cols-[1.4fr_0.9fr_1.1fr_0.6fr] gap-2 px-3 py-2 border-t border-brand-mist text-[11px] items-center">
                <div className="font-medium text-brand-indigo truncate">{r.name}</div>
                <div className="text-brand-slate truncate">{r.tier}</div>
                <div className="text-brand-slate truncate">{r.bought}</div>
                <div className="text-right">
                  {r.checked
                    ? <span className="text-[10px] font-semibold text-brand-success">Yes</span>
                    : <span className="text-[10px] font-semibold text-brand-slate">No</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-brand-slate">Showing 8 of {sold}</div>
            <button className="text-xs text-brand-indigo font-semibold hover:underline">Load more</button>
          </div>
        </div>

        <div className="text-xs text-brand-slate text-center">{checked} / {sold} checked in</div>
      </div>
    </PhoneFrame>
  );
}