import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { z } from "zod";
import { Check } from "lucide-react";

export const Route = createFileRoute("/event/$id/processing")({
  component: Processing,
  validateSearch: z.object({ tierId: z.string(), qty: z.number() }),
});

const STEPS = ["Authorizing payment", "Confirming with bank", "Issuing ticket"] as const;

function Processing() {
  const { id } = Route.useParams();
  const { tierId, qty } = useSearch({ from: "/event/$id/processing" });
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), (i + 1) * 700));
    });
    timers.push(
      setTimeout(
        () => navigate({ to: "/event/$id/success", params: { id }, search: { tierId, qty } }),
        STEPS.length * 700 + 300,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [navigate, id, tierId, qty]);

  return (
    <PhoneFrame>
      <div className="flex-1 grid place-items-center bg-brand-cream px-8">
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center mb-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-brand-slate font-semibold">
              Processing
            </div>
            <h2 className="mt-1 text-xl font-semibold text-brand-indigo">Just a moment…</h2>
          </div>
          {STEPS.map((label, i) => {
            const done = step > i;
            const active = step === i;
            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl bg-white border border-brand-mist p-3.5 transition-opacity ${
                  done || active ? "opacity-100" : "opacity-50"
                }`}
              >
                <div className="h-7 w-7 rounded-full grid place-items-center shrink-0 bg-brand-mist">
                  {done ? (
                    <div className="h-7 w-7 rounded-full bg-brand-success grid place-items-center em-check-pop">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  ) : active ? (
                    <div className="h-4 w-4 rounded-full border-2 border-brand-indigo/20 border-t-brand-indigo animate-spin" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-brand-slate/40" />
                  )}
                </div>
                <div
                  className={`text-sm font-medium ${
                    done ? "text-brand-ink" : active ? "text-brand-indigo" : "text-brand-slate"
                  }`}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}