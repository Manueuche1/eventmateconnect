import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabs } from "@/components/BottomTabs";
import { EventCard, type FeedEvent } from "@/components/EventCard";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/saved")({ component: Saved });

function Saved() {
  useRequireAuth();
  const { user } = useAuth();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["saved-events", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<FeedEvent[]> => {
      const { data: rows } = await supabase
        .from("saved_events")
        .select("event_id")
        .eq("user_id", user!.id);
      const ids = (rows ?? []).map(r => r.event_id);
      if (!ids.length) return [];
      const { data: events } = await supabase
        .from("events")
        .select("id,title,description,category,venue,area,event_date,hero_image,trending,organizer_id")
        .in("id", ids);
      const orgIds = Array.from(new Set((events ?? []).map(e => e.organizer_id)));
      const orgMap = new Map<string, any>();
      if (orgIds.length) {
        const { data: orgs } = await supabase
          .from("profiles")
          .select("id,full_name,organization_name,organization_verified")
          .in("id", orgIds);
        (orgs ?? []).forEach(o => orgMap.set(o.id, o));
      }
      return (events ?? []).map(e => {
        const o = orgMap.get(e.organizer_id);
        return {
          id: e.id, title: e.title, description: e.description, category: e.category,
          venue: e.venue, area: e.area, event_date: e.event_date, hero_image: e.hero_image,
          trending: !!e.trending,
          organizer_name: o?.organization_name || o?.full_name || null,
          organizer_verified: o?.organization_verified ?? false,
        };
      });
    },
  });

  return (
    <PhoneFrame>
      <div className="shrink-0 px-4 py-4 border-b border-brand-mist">
        <h1 className="text-xl font-semibold text-brand-indigo">Saved</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-sm text-brand-slate">Loading…</div>
        ) : events.length === 0 ? (
          <div className="h-full grid place-items-center text-center text-sm text-brand-slate px-6">
            Nothing saved yet. Tap the heart on any event to come back to it later.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(e => <EventCard key={e.id} event={e} variant="foryou" />)}
          </div>
        )}
      </div>
      <BottomTabs />
    </PhoneFrame>
  );
}