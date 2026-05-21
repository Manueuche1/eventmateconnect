import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Chip } from "@/components/Chip";
import { useEventMate } from "@/context/EventMateContext";
import { AREAS, CATEGORIES, Category } from "@/data/mockData";
import { Music, Mic, Code, UtensilsCrossed, Palette, Trophy, Sparkles, Briefcase } from "lucide-react";

const ICONS: Record<Category, any> = {
  music: Music, comedy: Mic, tech: Code, food: UtensilsCrossed,
  art: Palette, sports: Trophy, lifestyle: Sparkles, professional: Briefcase,
};

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useEventMate();
  const [slide, setSlide] = useState(0);
  const [cats, setCats] = useState<Category[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  const next = () => slide < 2 ? setSlide(slide + 1) : finish();
  const finish = () => { completeOnboarding({ categories: cats, areas }); navigate({ to: "/home" }); };

  return (
    <PhoneFrame>
      <div className="flex items-center justify-end px-5 pt-4">
        <button onClick={finish} className="text-xs text-brand-slate font-medium">Skip</button>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-4 pb-6 min-h-0 overflow-y-auto">
        {slide === 0 && (
          <div className="em-fade flex-1 flex flex-col">
            <div className="flex-1 grid place-items-center">
              <svg viewBox="0 0 220 220" className="w-56 h-56">
                <rect x="40" y="50" width="120" height="150" rx="14" fill="#F4B740" transform="rotate(-10 100 125)" />
                <rect x="60" y="40" width="120" height="150" rx="14" fill="#1A1F71" transform="rotate(4 120 115)" />
                <rect x="80" y="30" width="120" height="150" rx="14" fill="#0E1133" />
                <circle cx="140" cy="105" r="22" fill="#F4B740" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-brand-indigo tracking-tight">Find what's actually on tonight</h1>
            <p className="mt-2 text-sm text-brand-slate">Lagos events curated for you, not buried in a group chat.</p>
          </div>
        )}
        {slide === 1 && (
          <div className="em-fade flex-1">
            <h1 className="text-2xl font-semibold text-brand-indigo tracking-tight">Pick what you're into</h1>
            <p className="mt-2 text-sm text-brand-slate">Choose a few categories so we can tailor your feed.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {CATEGORIES.map(c => {
                const Icon = ICONS[c.id];
                const active = cats.includes(c.id);
                return (
                  <button key={c.id}
                    onClick={() => setCats(s => active ? s.filter(x => x !== c.id) : [...s, c.id])}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${active ? "bg-brand-indigo text-white border-brand-indigo" : "bg-white border-brand-mist text-brand-ink"}`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {slide === 2 && (
          <div className="em-fade flex-1">
            <h1 className="text-2xl font-semibold text-brand-indigo tracking-tight">Where in Lagos?</h1>
            <p className="mt-2 text-sm text-brand-slate">We'll prioritise events near these areas.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {AREAS.map(a => (
                <Chip key={a} active={areas.includes(a)} onClick={() => setAreas(s => s.includes(a) ? s.filter(x => x !== a) : [...s, a])}>{a}</Chip>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="shrink-0 px-6 pb-6">
        <div className="flex justify-center gap-1.5 mb-4">
          {[0,1,2].map(i => <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-brand-indigo" : "w-1.5 bg-brand-mist"}`} />)}
        </div>
        <PrimaryButton
          onClick={next}
          disabled={(slide === 1 && cats.length === 0) || (slide === 2 && areas.length === 0)}
        >{slide === 2 ? "Show me events" : "Continue"}</PrimaryButton>
      </div>
    </PhoneFrame>
  );
}