import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabs } from "@/components/BottomTabs";
import { EventCard, type FeedEvent } from "@/components/EventCard";
import { LogoIcon } from "@/components/Logo";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/data/mockData";
import { useRequireAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/home")({ component: Home });

async function fetchFeed(): Promise<FeedEvent[]> {
  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,description,category,venue,area,event_date,hero_image,trending,organizer_id")
    .eq("is_published", true)
    .order("event_date", { ascending: true });
  if (error) throw error;
  const ids = Array.from(new Set((events ?? []).map(e => e.organizer_id)));
  const orgMap = new Map<string, { full_name: string; organization_name: string | null; organization_verified: boolean | null }>();
  if (ids.length) {
    const { data: orgs } = await supabase
      .from("profiles")
      .select("id,full_name,organization_name,organization_verified")
      .in("id", ids);
    (orgs ?? []).forEach(o => orgMap.set(o.id, o));
  }
  return (events ?? []).map(e => {
    const o = orgMap.get(e.organizer_id);
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      venue: e.venue,
      area: e.area,
      event_date: e.event_date,
      hero_image: e.hero_image,
      trending: !!e.trending,
      organizer_name: o?.organization_name || o?.full_name || null,
      organizer_verified: o?.organization_verified ?? false,
    };
  });
}

function Home() {
  const { profile } = useRequireAuth();
  const { data: events = [], isLoading } = useQuery({ queryKey: ["feed-events"], queryFn: fetchFeed });

  const trending = events.filter(e => e.trending);
  const forYou = events; // already ordered by event_date asc
  const userCats = profile?.preferences_categories ?? [];

  return (
    <PhoneFrame>
      <div className="shrink-0 sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <LogoIcon className="h-9 w-9 rounded-lg" />
          <button className="h-9 w-9 grid place-items-center rounded-full bg-brand-mist" aria-label="Search">
            <Search className="h-4 w-4 text-brand-ink" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div className="p-6 text-sm text-brand-slate">Loading events…</div>
        ) : (
          <>
            <Rail title="Trending in Lagos" events={trending} />
            <Section title="For you">
              <div className="px-4 space-y-4">
                {forYou.slice(0, 6).map(e => <EventCard key={e.id} event={e} variant="foryou" />)}
              </div>
            </Section>
            {userCats.map(cat => {
              const list = events.filter(e => e.category === cat);
              if (!list.length) return null;
              const label = CATEGORIES.find(c => c.id === (cat as any))?.label ?? cat;
              return <Rail key={cat} title={`${label} this week`} events={list} />;
            })}
          </>
        )}
      </div>
      <BottomTabs />
    </PhoneFrame>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="px-4 text-base font-semibold text-brand-indigo mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Rail({ title, events }: { title: string; events: FeedEvent[] }) {
  if (events.length === 0) return null;
  return (
    <Section title={title}>
      <div className="em-rail-fade">
        <div className="flex gap-3 pl-4 pr-6 overflow-x-auto no-scrollbar pb-2 em-snap-x">
          {events.map(e => <EventCard key={e.id} event={e} variant="trending" />)}
        </div>
      </div>
    </Section>
  );
}