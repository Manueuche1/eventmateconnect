import { createFileRoute, Link } from "@tanstack/react-router";
import { OrganizerFrame } from "@/components/OrganizerFrame";
import { useRequireAuth } from "@/context/AuthContext";
import { EVENTS, ORGANIZER_USER, formatNaira } from "@/data/mockData";
import { Logo } from "@/components/Logo";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Ticket, CheckCircle2, Star, UserPlus } from "lucide-react";

export const Route = createFileRoute("/organizer/")({ component: OrganizerDashboard });

const SALES: Record<string, { sold: number; revenue: number }> = {
  "evt-1": { sold: 135, revenue: 1860000 },
  "evt-9": { sold: 90, revenue: 495000 },
};

const SALES_BY_DAY = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  sales: Math.round(28 + Math.sin(i / 2) * 10 + i * 1.4),
}));

const ACTIVITY = [
  { icon: Ticket, text: "Adaeze just bought 2× VIP for Afrobeats Live", time: "8 min ago" },
  { icon: CheckCircle2, text: "Tunde checked in to Stand-Up Saturday", time: "23 min ago" },
  { icon: Ticket, text: "Kemi bought 1× Regular for Afrobeats Live", time: "41 min ago" },
  { icon: Star, text: "Soundstage Lagos received a 5★ review", time: "1 hr ago" },
  { icon: UserPlus, text: "New follower: Ifeanyi O.", time: "2 hr ago" },
];

function OrganizerDashboard() {
  useRequireAuth({ role: "organizer" });
  const myEvents = EVENTS.filter(e => ORGANIZER_USER.eventIds.includes(e.id));
  const stats: { label: string; value: string; sub?: string; trend: number }[] = [
    { label: "Total events", value: "8", trend: 14 },
    { label: "Tickets this month", value: "847", trend: 12 },
    { label: "Revenue this month", value: formatNaira(4235000), trend: 23 },
    { label: "Next payout", value: formatNaira(890000), sub: "Jun 18", trend: -4 },
  ];
  return (
    <OrganizerFrame>
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-brand-mist">
          <Logo className="w-36" />
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-semibold">{ORGANIZER_USER.name}</div>
              <div className="text-[10px] text-brand-slate">{ORGANIZER_USER.organization}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-indigo text-white grid place-items-center text-xs font-semibold">TA</div>
          </div>
        </div>

        <div className="p-5">
          <h1 className="text-xl font-semibold text-brand-indigo">Welcome back, Tunde.</h1>
          <p className="text-xs text-brand-slate mt-1">Here's how your events are doing.</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.map(s => {
              const up = s.trend >= 0;
              const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
              return (
                <div key={s.label} className="rounded-2xl border border-brand-mist p-3 bg-white shadow-[0_1px_2px_rgba(14,17,51,0.04)]">
                  <div className="text-[10px] uppercase tracking-wider text-brand-slate">{s.label}</div>
                  <div className="mt-1 text-base font-semibold text-brand-indigo">{s.value}</div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${up ? "text-brand-success" : "text-brand-error"}`}>
                      <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
                      {up ? "+" : ""}{s.trend}%
                    </span>
                    <span className="text-[10px] text-brand-slate">vs last month</span>
                  </div>
                  {s.sub && <div className="text-[10px] text-brand-slate mt-0.5">{s.sub}</div>}
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-brand-mist p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-brand-indigo">Sales, last 14 days</div>
              <div className="text-[10px] text-brand-slate">Tickets sold</div>
            </div>
            <div className="h-36">
              <ResponsiveContainer>
                <AreaChart data={SALES_BY_DAY} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orgFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A1F71" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#1A1F71" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#5B6178" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#5B6178" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E3E5EF" }} />
                  <Area type="monotone" dataKey="sales" stroke="#1A1F71" strokeWidth={2} fill="url(#orgFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h2 className="mt-6 text-sm font-semibold text-brand-indigo">Recent activity</h2>
          <div className="mt-3 rounded-2xl border border-brand-mist overflow-hidden bg-white">
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="p-3 border-b border-brand-mist last:border-b-0 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-indigo/8 grid place-items-center shrink-0">
                    <Icon className="h-4 w-4 text-brand-indigo" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-brand-indigo leading-snug">{a.text}</div>
                    <div className="text-[10px] text-brand-slate mt-0.5">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="mt-6 text-sm font-semibold text-brand-indigo">Your events</h2>
          <div className="mt-3 rounded-xl border border-brand-mist overflow-hidden">
            {myEvents.map(e => {
              const s = SALES[e.id];
              return (
                <Link key={e.id} to="/organizer/event/$id" params={{ id: e.id }} className="block p-3 border-b border-brand-mist last:border-b-0 hover:bg-brand-mist/50">
                  <div className="flex items-center gap-3">
                    <img src={e.heroImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{e.title}</div>
                      <div className="text-xs text-brand-slate">{format(new Date(e.date), "MMM d • h:mm a")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-brand-indigo">{s.sold} sold</div>
                      <div className="text-[10px] text-brand-slate">{formatNaira(s.revenue)}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </OrganizerFrame>
  );
}