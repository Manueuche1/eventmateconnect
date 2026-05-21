import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { z } from "zod";

export const Route = createFileRoute("/event/$id/processing")({
  component: Processing,
  validateSearch: z.object({ tierId: z.string(), qty: z.number() }),
});

function Processing() {
  const { id } = Route.useParams();
  const { tierId, qty } = useSearch({ from: "/event/$id/processing" });
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/event/$id/success", params: { id }, search: { tierId, qty } }), 2500);
    return () => clearTimeout(t);
  }, [navigate, id, tierId, qty]);

  return (
    <PhoneFrame>
      <div className="flex-1 grid place-items-center bg-brand-indigo text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-white/20 border-t-brand-amber animate-spin" />
          <div className="text-sm">Processing your payment…</div>
        </div>
      </div>
    </PhoneFrame>
  );
}