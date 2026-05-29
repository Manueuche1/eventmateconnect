import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabs } from "@/components/BottomTabs";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/tickets")({ component: TicketsScreen });

interface TicketRow {
  id: string;
  ticket_code: string;
  status: string;
  events: {
    id: string;
    title: string;
    venue: string;
    event_date: string;
  } | null;
  ticket_tiers: {
    name: string;
  } | null;
}

function TicketsScreen() {
  useRequireAuth();
  const { user } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const navigate = useNavigate();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id, ticket_code, status,
          events ( id, title, venue, event_date ),
          ticket_tiers ( name )
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });
      if (error) throw error;
      return (data || []) as TicketRow[];
    },
    enabled: !!user,
  });

  const now = Date.now();
  const list = (tickets || []).filter((t) => {
    if (!t.events) return false;
    const eventTime = new Date(t.events.event_date).getTime();
    return tab === "upcoming" ? eventTime >= now : eventTime < now;
  });

  return (
    <PhoneFrame>
      <div className="shrink-0 px-4 pt-4 border-b border-brand-mist">
        <h1 className="text-xl font-semibold text-brand-indigo">My tickets</h1>
        <div className="mt-3 flex gap-4 text-sm">
          {(["upcoming", "past"] as const).map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`pb-3 capitalize border-b-2 ${
                tab === x
                  ? "border-brand-indigo text-brand-indigo font-semibold"
                  : "border-transparent text-brand-slate"
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <>
            <div className="h-20 rounded-xl bg-brand-mist animate-pulse" />
            <div className="h-20 rounded-xl bg-brand-mist animate-pulse" />
          </>
        ) : list.length === 0 ? (
          <div className="h-full grid place-items-center text-center px-6 gap-4 py-12">
            <div className="text-sm text-brand-slate">
              {tab === "upcoming"
                ? "No upcoming tickets yet. Browse events to get started."
                : "No past tickets."}
            </div>
            <div className="w-full max-w-[200px]">
              <PrimaryButton onClick={() => navigate({ to: "/home" })}>
                Browse events
              </PrimaryButton>
            </div>
          </div>
        ) : (
          list.map((t) => {
            if (!t.events || !t.ticket_tiers) return null;
            return (
              <Link
                key={t.id}
                to="/ticket/$id"
                params={{ id: t.id }}
                className="block rounded-xl border border-brand-mist p-4 bg-white flex items-center gap-3"
              >
                <div className="h-12 w-12 rounded-lg bg-brand-mist grid place-items-center">
                  <QrCode className="h-5 w-5 text-brand-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-brand-ink truncate">
                    {t.events.title}
                  </div>
                  <div className="text-xs text-brand-slate truncate">
                    {format(new Date(t.events.event_date), "EEE, MMM d • h:mm a")} • {t.events.venue}
                  </div>
                  <div className="text-xs text-brand-indigo font-medium mt-0.5">
                    {t.ticket_tiers.name}
                  </div>
                </div>
                {t.status === "used" && (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-slate text-white">
                    Used
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
      <BottomTabs />
    </PhoneFrame>
  );
}
