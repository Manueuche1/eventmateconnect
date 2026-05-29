import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { ScanLine, Sparkles } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/organizer/event/$id/")({ component: OrgEvent });

interface Event {
  id: string;
  title: string;
  hero_image: string;
  venue: string;
  area: string;
  event_date: string;
  doors_open: string | null;
  is_published: boolean;
  organizer_id: string;
}

interface Tier {
  id: string;
  name: string;
  quantity_total: number;
  quantity_sold: number;
  display_order: number;
}

interface Ticket {
  id: string;
  holder_name: string;
  status: string;
  purchased_at: string;
  scanned_at: string | null;
  ticket_tiers: { name: string } | null;
}

function OrgEvent() {
  useRequireAuth({ role: "organizer" });
  const { id } = Route.useParams();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["organizer-event", id, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [{ data: event }, { data: tiers }, { data: tickets }] = await Promise.all([
        supabase.from("events").select("*").eq("id", id).maybeSingle(),
        supabase.from("ticket_tiers").select("*").eq("event_id", id).order("display_order"),
        supabase
          .from("tickets")
          .select(`id, holder_name, status, purchased_at, scanned_at, ticket_tiers ( name )`)
          .eq("event_id", id)
          .order("purchased_at", { ascending: false }),
      ]);

      return {
        event: event as Event | null,
        tiers: (tiers ?? []) as Tier[],
        tickets: (tickets ?? []) as Ticket[],
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <PhoneFrame>
        <TopBar title="Loading..." back="/organizer" />
        <div className="p-5 space-y-3">
          <div className="h-20 rounded-xl bg-brand-mist animate-pulse" />
          <div className="h-40 rounded-xl bg-brand-mist animate-pulse" />
        </div>
      </PhoneFrame>
    );
  }

  if (!data || !data.event) {
    return (
      <PhoneFrame>
        <TopBar title="Event" back="/organizer" />
        <div className="p-6 text-sm text-brand-slate">
          Event not found, or you don't own this event.
        </div>
      </PhoneFrame>
    );
  }

  const e = data.event;
  const tiers = data.tiers;
  const tickets = data.tickets;

  const totalSold = tickets.length;
  const totalCheckedIn = tickets.filter((t) => t.status === "used").length;
  const totalCapacity = tiers.reduce((sum, t) => sum + t.quantity_total, 0);

  // Sales by tier (real counts)
  const tierData = tiers.map((t) => ({
    name: t.name,
    sold: tickets.filter((tk) => tk.ticket_tiers?.name === t.name).length,
  }));

  // Sales by day (last 14 days, real)
  const days: { day: string; sales: number }[] = [];
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
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

  const visibleAttendees = tickets.slice(0, 8);

  return (
    <PhoneFrame>
      <TopBar title={e.title} back="/organizer" />
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Demo banner */}
        <div className="rounded-xl bg-brand-amber/15 border border-brand-amber/40 p-3 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-brand-indigo shrink-0 mt-0.5" />
          <div className="text-xs text-brand-ink leading-relaxed">
            <span className="font-semibold">Demo mode.</span> Tickets are free, so revenue isn't shown.
          </div>
        </div>

        {/* Event header */}
        <div className="flex gap-3">
          <img
            src={e.hero_image}
            alt=""
            className="h-20 w-20 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-brand-indigo line-clamp-2">
              {e.title}
            </div>
            <div className="text-[11px] text-brand-slate mt-0.5">
              {format(new Date(e.event_date), "EEE, MMM d • h:mm a")}
            </div>
            {e.is_published && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-success bg-brand-success/12 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Claimed" value={`${totalSold} / ${totalCapacity}`} />
          <StatTile label="Checked in" value={String(totalCheckedIn)} />
          <StatTile
            label="Check-in rate"
            value={totalSold > 0 ? `${Math.round((totalCheckedIn / totalSold) * 100)}%` : "—"}
          />
        </div>

        {/* Scanner CTA */}
        <Link to="/organizer/event/$id/scanner" params={{ id }}>
          <PrimaryButton>
            <span className="inline-flex items-center gap-2">
              <ScanLine className="h-4 w-4" /> Open scanner
            </span>
          </PrimaryButton>
        </Link>

        {/* Sales by day chart */}
        <div className="rounded-xl border border-brand-mist p-4">
          <div className="text-xs font-semibold text-brand-indigo mb-2">
            Tickets claimed, last 14 days
          </div>
          <div className="h-32">
            <ResponsiveContainer>
              <AreaChart data={days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="orgEvtFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A1F71" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#1A1F71" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#5B6178" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#5B6178" }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E3E5EF" }} />
                <Area type="monotone" dataKey="sales" stroke="#1A1F71" strokeWidth={2} fill="url(#orgEvtFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by tier */}
        <div className="rounded-xl border border-brand-mist p-4">
          <div className="text-xs font-semibold text-brand-indigo mb-2">By tier</div>
          <div className="h-36">
            <ResponsiveContainer>
              <BarChart data={tierData} layout="vertical">
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#0E1133" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip />
                <Bar dataKey="sold" fill="#F4B740" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendees */}
        <div>
          <div className="text-xs font-semibold text-brand-indigo mb-2">Attendees</div>
          {visibleAttendees.length === 0 ? (
            <div className="rounded-xl border border-brand-mist p-4 text-xs text-brand-slate">
              No tickets claimed yet.
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-brand-mist overflow-hidden bg-white">
                <div className="grid grid-cols-[1.4fr_0.9fr_1.1fr_0.6fr] gap-2 px-3 py-2 bg-brand-mist/40 text-[10px] uppercase tracking-wider text-brand-slate font-semibold">
                  <div>Name</div>
                  <div>Tier</div>
                  <div>Claimed</div>
                  <div className="text-right">In</div>
                </div>
                {visibleAttendees.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-[1.4fr_0.9fr_1.1fr_0.6fr] gap-2 px-3 py-2 border-t border-brand-mist text-[11px] items-center"
                  >
                    <div className="font-medium text-brand-indigo truncate">
                      {t.holder_name}
                    </div>
                    <div className="text-brand-slate truncate">
                      {t.ticket_tiers?.name ?? "—"}
                    </div>
                    <div className="text-brand-slate truncate">
                      {format(new Date(t.purchased_at), "MMM d, h:mm a")}
                    </div>
                    <div className="text-right">
                      {t.status === "used" ? (
                        <span className="text-[10px] font-semibold text-brand-success">Yes</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-brand-slate">No</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-brand-slate">
                Showing {visibleAttendees.length} of {totalSold}
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-brand-slate text-center">
          {totalCheckedIn} / {totalSold} checked in
        </div>
      </div>
    </PhoneFrame>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-mist p-3">
      <div className="text-[10px] uppercase tracking-wider text-brand-slate">{label}</div>
      <div className="mt-1 text-sm font-semibold text-brand-indigo">{value}</div>
    </div>
  );
}
