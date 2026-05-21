import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useEventMate } from "@/context/EventMateContext";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  const { onboarded } = useEventMate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: onboarded ? "/home" : "/onboarding" }), 1500);
    return () => clearTimeout(t);
  }, [navigate, onboarded]);
  return (
    <PhoneFrame>
      <div className="flex-1 bg-brand-indigo flex flex-col items-center justify-center px-8">
        <div className="em-pop">
          <Logo variant="reverse" className="w-72" />
        </div>
        <div className="mt-10 h-1 w-32 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full w-1/3 bg-brand-amber em-bar" />
        </div>
      </div>
    </PhoneFrame>
  );
}
