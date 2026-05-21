import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import { useEventMate } from "@/context/EventMateContext";

export const Route = createFileRoute("/role-switcher")({ component: RoleSwitcher });

function RoleSwitcher() {
  const navigate = useNavigate();
  const { setRole } = useEventMate();
  return (
    <PhoneFrame>
      <div className="px-6 pt-10 pb-8 flex-1 flex flex-col">
        <Logo className="w-40" />
        <h1 className="mt-8 text-2xl font-semibold text-brand-indigo">Demo role switcher</h1>
        <p className="mt-1 text-sm text-brand-slate">Flip between the two perspectives for the demo. This screen wouldn't exist in production.</p>
        <div className="mt-8 grid gap-3">
          <button onClick={() => { setRole("attendee"); navigate({ to: "/home" }); }}
            className="h-16 rounded-xl bg-brand-amber text-brand-indigo font-semibold">View as Attendee</button>
          <button onClick={() => { setRole("organizer"); navigate({ to: "/organizer" }); }}
            className="h-16 rounded-xl bg-brand-indigo text-white font-semibold">View as Organizer</button>
        </div>
      </div>
    </PhoneFrame>
  );
}