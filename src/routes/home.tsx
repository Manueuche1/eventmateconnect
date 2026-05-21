import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabs } from "@/components/BottomTabs";
import { EventCard } from "@/components/EventCard";
import { Chip } from "@/components/Chip";
import { LogoIcon } from "@/components/Logo";
import { Search } from "lucide-react";
import { CATEGORIES, EVENTS, Category } from "@/data/mockData";
import { useEventMate } from "@/context/EventMateContext";

export const Route = createFileRoute("/home")({ component: Home });

function Home() {
  const { prefs } = useEventMate();
  const [cat, setCat] = useState<Category | "all">("all");
  const [date, setDate] = useState("all");

  const filtered = EVENTS.filter(e => cat === "all" || e.category === cat);
  const trending = EVENTS.filter(e => e.trending);
  const forYou = EVENTS.filter(e => prefs.categories.includes(e.category));
  const musicWeek = prefs.categories.includes("music") ? EVENTS.filter(e => e.category === "music") : [];
  const primaryArea = prefs.areas[0] || "Victoria Island";
  const nearYou = EVENTS.filter(e => e.area === primaryArea);

  return (
    <PhoneFrame>
      <div className="shrink-0 sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <LogoIcon className="h-9 w-9 rounded-lg" />
          <button className="h-9 w-9 grid place-items-center rounded-full bg-brand-mist" aria-label="Search">
            <Search className="h-4 w-4 text-brand-ink" />
          </button>
        </div>
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
          {CATEGORIES.map(c => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>)}
        </div>
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {["All dates", "Today", "This weekend", "Next 7 days", "Pick a date"].map(d => (
            <Chip key={d} active={date === d} onClick={() => setDate(d)}>{d}</Chip>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {cat !== "all" ? (
          <Section title={CATEGORIES.find(c => c.id === cat)?.label || ""}>
            <div className="grid grid-cols-2 gap-3 px-4">
              {filtered.map(e => <EventCard key={e.id} event={e} size="lg" />)}
            </div>
          </Section>
        ) : (
          <>
            <Rail title="Trending in Lagos" events={trending} />
            <Section title="For you">
              <div className="px-4 space-y-4">
                {forYou.slice(0, 4).map(e => <EventCard key={e.id} event={e} variant="foryou" />)}
              </div>
            </Section>
            {musicWeek.length > 0 && <Rail title="Music this week" events={musicWeek} />}
            <Rail title={`Near you, ${primaryArea}`} events={nearYou} />
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

function Rail({ title, events }: { title: string; events: any[] }) {
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