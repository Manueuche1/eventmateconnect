import { createFileRoute, Link } from "@tanstack/react-router";
import { OrganizerFrame } from "@/components/OrganizerFrame";
import { EVENTS, ORGANIZER_USER, formatNaira } from "@/data/mockData";
import { Logo } from "@/components/Logo";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/")({ component: OrganizerDashboard });

const SALES: Record<string, { sold: number; revenue: number }> = {
  "evt-1": { sold: 135, revenue: 1860000 },
  "evt-9": { sold: 90, revenue: 495000 },
};

function OrganizerDashboard() {
  const myEvents = EVENTS.filter(e => ORGANIZER_USER.eventIds.includes(e.id));
  const stats = [
    { label: "Total events", value: "8" },
    { label: "Tickets this month", value: "847" },
    { label: "Revenue this month", value: formatNaira(4235000) },
    { label: "Next payout", value: formatNaira(890000), sub: "Jun 18" },
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
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border border-brand-mist p-3">
                <div className="text-[10px] uppercase tracking-wider text-brand-slate">{s.label}</div>
                <div className="mt-1 text-base font-semibold text-brand-indigo">{s.value}</div>
                {s.sub && <div className="text-[10px] text-brand-slate">{s.sub}</div>}
              </div>
            ))}
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