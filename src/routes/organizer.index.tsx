import { createFileRoute, Link } from "@tanstack/react-router";
import { OrganizerFrame } from "@/components/OrganizerFrame";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { format, formatDistanceToNow } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Ticket, CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/organizer/")({ component: OrganizerDashboard });

interface OrgEvent {
  id: string;
  title: string;
  event_date: string;
  hero_image: string;
  is_published: boolean;
}

interface RecentTicket {
  id: string;
  holder_name: string;
  status: string;
  purchased_at: string;
  scanned_at: string | null;
  events: { title: string } | null;
  ticket_tiers: { name: string } | null;
}

function OrganizerDashboard() {
  const { loading: authLoading } = useRequireAuth({ role: "organizer" });
  const { user, profile } = useAuth();

  // Fetch organizer's events with ticket counts and recent activity in parallel
  const { data, isLoading } = useQuery({
    queryKey: ["organizer-dashboard", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // 1. Events owned by this organizer
      const { data: events } = await supabase
        .from("events")
        .select("id, title, event_date, hero_image, is_published")
        .eq("organizer_id", user.id)
        .order("event_date", { ascending: true });

      const eventList = (events ?? []) as OrgEvent[];
      const eventIds = eventList.map((e) => e.id);

      // 2. All tickets for those events (for counts + recent activity)
      let tickets: RecentTicket[] = [];
      if (eventIds.length > 0) {
        const { data: t } = await supabase
          .from("tickets")
          .select(`
            id, holder_name, status, purchased_at, scanned_at,
            events ( title ),
            ticket_tiers ( name )
          `)
          .in("event_id", eventIds)
          .order("purchased_at", { ascending: false });
        tickets = (t ?? []) as RecentTicket[];
      }

      // Per-event sold counts
      const soldByEvent: Record<string, number> = {};
      for (const t of tickets) {
        const eId = eventIds.find((id) => {
          // We don't have event_id directly here, so this trick won't work; use a separate query.
          return false;
        });
      }
      // Better: aggregate by joining the original tickets data
      // For simplicity, re-fetch per-event sold counts via group, or compute from tickets if we add event_id to select
      // Doing this with a second query for clarity:
      const soldMap: Record<string, number> = {};
      if (eventIds.length > 0) {
        const { data: countRows } = await supabase
          .from("tickets")
          .select("event_id")
          .in("event_id", eventIds);
        for (const r of (countRows ?? []) as { event_id: string }[]) {
          soldMap[r.event_id] = (soldMap[r.event_id] ?? 0) + 1;
        }
      }

      // 3. Last 14 days of sales for the chart
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
      const days: { day: string; sales: number }[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(fourteenDaysAgo);
        d.setDate(d.getDate() + i);
        days.push({ day: format(d, "MMM d"), sales: 0 });
      }
      for (const t of tickets) {
        const purchasedDate = new Date(t.purchased_at);
        const daysSince = Math.floor((Date.now() - purchasedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 0 && daysSince < 14) {
          const bucketIndex = 13 - daysSince;
          if (days[bucketIndex]) days[bucketIndex].sales += 1;
        }
      }

      return {
        events: eventList,
        tickets,
        soldMap,
        chartData: days,
        totalSold: tickets.length,
        totalCheckedIn: tickets.filter((t) => t.status === "used").length,
      };
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <OrganizerFrame>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="h-12 rounded-xl bg-brand-mist animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-2xl bg-brand-mist animate-pulse" />
            <div className="h-20 rounded-2xl bg-brand-mist animate-pulse" />
            <div className="h-20 rounded-2xl bg-brand-mist animate-pulse" />
            <div className="h-20 rounded-2xl bg-brand-mist animate-pulse" />
          </div>
          <div className="h-40 rounded-2xl bg-brand-mist animate-pulse" />
        </div>
      </OrganizerFrame>
    );
  }

  const events = data?.events ?? [];
  const tickets = data?.tickets ?? [];
  const soldMap = data?.soldMap ?? {};
  const chartData = data?.chartData ?? [];
  const totalSold = data?.totalSold ?? 0;
  const totalCheckedIn = data?.totalCheckedIn ?? 0;
  const recentActivity = tickets.slice(0, 5);

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";
  const orgName = profile?.organization_name ?? "Your organization";
  const avatarInitials = profile?.avatar_initials ?? "??";

  return (
    <OrganizerFrame>
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-brand-mist">
          <Logo className="w-36" />
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-semibold">{profile?.full_name}</div>
              <div className="text-[10px] text-brand-slate">{orgName}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-indigo text-white grid place-items-center text-xs font-semibold">
              {avatarInitials}
            </div>
          </div>
        </div>

        <div className="p-5">
          <h1 className="text-xl font-semibold text-brand-indigo">
            Welcome back, {firstName}.
          </h1>
          <p className="text-xs text-brand-slate mt-1">
            Here's how your events are doing.
          </p>

          {/* Demo mode banner */}
          <div className="mt-4 rounded-xl bg-brand-amber/15 border border-brand-amber/40 p-3 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-brand-indigo shrink-0 mt-0.5" />
            <div className="text-xs text-brand-ink leading-relaxed">
              <span className="font-semibold">Demo mode.</span> Revenue figures aren't shown because all tickets are free in this prototype.
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard label="Total events" value={String(events.length)} />
            <StatCard label="Tickets claimed" value={String(totalSold)} />
            <StatCard label="Checked in" value={String(totalCheckedIn)} />
            <StatCard
              label="Check-in rate"
              value={totalSold > 0 ? `${Math.round((totalCheckedIn / totalSold) * 100)}%` : "—"}
            />
          </div>

          {/* Chart */}
          <div className="mt-6 rounded-2xl border border-brand-mist p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-brand-indigo">
                Tickets claimed, last 14 days
              </div>
            </div>
            <div className="h-36">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orgFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A1F71" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#1A1F71" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#5B6178" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#5B6178" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E3E5EF" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#1A1F71"
                    strokeWidth={2}
                    fill="url(#orgFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent activity */}
          <h2 className="mt-6 text-sm font-semibold text-brand-indigo">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-brand-mist p-4 bg-white text-xs text-brand-slate">
              No activity yet. Once attendees claim tickets to your events, they'll show up here.
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-brand-mist overflow-hidden bg-white">
              {recentActivity.map((t) => {
                const Icon = t.status === "used" ? CheckCircle2 : Ticket;
                const text =
                  t.status === "used"
                    ? `${t.holder_name} checked in to ${t.events?.title ?? "an event"}`
                    : `${t.holder_name} claimed ${t.ticket_tiers?.name ?? "a ticket"} for ${t.events?.title ?? "an event"}`;
                const time =
                  t.status === "used" && t.scanned_at
                    ? formatDistanceToNow(new Date(t.scanned_at), { addSuffix: true })
                    : formatDistanceToNow(new Date(t.purchased_at), { addSuffix: true });
                return (
                  <div
                    key={t.id}
                    className="p-3 border-b border-brand-mist last:border-b-0 flex items-start gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-brand-indigo/8 grid place-items-center shrink-0">
                      <Icon className="h-4 w-4 text-brand-indigo" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-brand-indigo leading-snug">{text}</div>
                      <div className="text-[10px] text-brand-slate mt-0.5">{time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Your events */}
          <h2 className="mt-6 text-sm font-semibold text-brand-indigo">Your events</h2>
          {events.length === 0 ? (
            <div className="mt-3 rounded-xl border border-brand-mist p-4 text-xs text-brand-slate">
              You haven't published any events yet.
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-brand-mist overflow-hidden">
              {events.map((e) => {
                const sold = soldMap[e.id] ?? 0;
                return (
                  <Link
                    key={e.id}
                    to="/organizer/event/$id"
                    params={{ id: e.id }}
                    className="block p-3 border-b border-brand-mist last:border-b-0 hover:bg-brand-mist/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={e.hero_image}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{e.title}</div>
                        <div className="text-xs text-brand-slate">
                          {format(new Date(e.event_date), "MMM d • h:mm a")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-brand-indigo">
                          {sold} {sold === 1 ? "ticket" : "tickets"}
                        </div>
                        <div className="text-[10px] text-brand-slate">
                          {e.is_published ? "Live" : "Draft"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </OrganizerFrame>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-mist p-3 bg-white shadow-[0_1px_2px_rgba(14,17,51,0.04)]">
      <div className="text-[10px] uppercase tracking-wider text-brand-slate">{label}</div>
      <div className="mt-1 text-base font-semibold text-brand-indigo">{value}</div>
    </div>
  );
}
