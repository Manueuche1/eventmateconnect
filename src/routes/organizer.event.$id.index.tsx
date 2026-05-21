import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EVENTS, formatNaira, SCAN_NAMES } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/organizer/event/$id/")({ component: OrgEvent });

const SALES_BY_DAY = Array.from({ length: 14 }, (_, i) => ({ day: `D${i + 1}`, sales: Math.round(8 + Math.sin(i / 2) * 4 + i * 0.6) }));

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
        <img src={e.heroImage} alt="" className="h-40 w-full rounded-xl object-cover" />

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
          <PrimaryButton>Open scanner</PrimaryButton>
        </Link>

        <div className="rounded-xl border border-brand-mist p-4">
          <div className="text-xs font-semibold text-brand-indigo mb-2">Sales, last 14 days</div>
          <div className="h-32">
            <ResponsiveContainer>
              <LineChart data={SALES_BY_DAY}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#5B6178" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Line dataKey="sales" stroke="#1A1F71" strokeWidth={2} dot={false} />
              </LineChart>
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
          <div className="rounded-xl border border-brand-mist overflow-hidden">
            {SCAN_NAMES.slice(0, 5).map((n, i) => (
              <div key={n} className="p-3 border-b border-brand-mist last:border-b-0 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{n}</div>
                  <div className="text-xs text-brand-slate">Regular</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${i % 2 === 0 ? "bg-brand-success/15 text-brand-success" : "bg-brand-mist text-brand-slate"}`}>{i % 2 === 0 ? "Checked in" : "Not yet"}</span>
              </div>
            ))}
          </div>
          <button className="mt-2 text-xs text-brand-indigo font-medium">View all {sold} attendees</button>
        </div>

        <div className="text-xs text-brand-slate text-center">{checked} / {sold} checked in</div>
      </div>
    </PhoneFrame>
  );
}