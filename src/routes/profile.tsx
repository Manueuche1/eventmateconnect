import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabs } from "@/components/BottomTabs";
import { useEventMate } from "@/context/EventMateContext";
import { Bell, Lock, HelpCircle, LogOut } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const { user, resetAll, setRole } = useEventMate();
  const navigate = useNavigate();
  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto">
        <div className="bg-brand-indigo text-white px-6 pt-8 pb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-brand-amber text-brand-indigo grid place-items-center text-xl font-semibold">{user.initials}</div>
          <div>
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-xs text-white/70 mt-0.5">{user.phone}</div>
            <div className="text-xs text-white/70">{user.email}</div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-brand-mist text-sm font-medium text-brand-ink">Edit preferences</button>

          <div className="pt-4 text-[11px] font-semibold tracking-wider uppercase text-brand-slate px-1">Settings</div>
          {[
            { icon: Bell, label: "Notifications" },
            { icon: Lock, label: "Privacy and data" },
            { icon: HelpCircle, label: "Help" },
            { icon: LogOut, label: "Sign out" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="w-full px-4 py-3 rounded-xl bg-white border border-brand-mist flex items-center gap-3 text-sm">
              <Icon className="h-4 w-4 text-brand-indigo" />
              <span className="text-brand-ink">{label}</span>
            </button>
          ))}

          <div className="mt-6 rounded-xl border-2 border-dashed border-brand-amber bg-brand-amber/10 p-4">
            <div className="text-xs font-semibold text-brand-indigo uppercase tracking-wider">Demo controls</div>
            <p className="text-xs text-brand-slate mt-1">Prototype-only shortcuts for the demo.</p>
            <div className="mt-3 grid gap-2">
              <button onClick={() => { setRole("organizer"); navigate({ to: "/organizer" }); }}
                className="h-10 rounded-lg bg-brand-indigo text-white text-sm font-medium">Switch to Organizer view</button>
              <Link to="/role-switcher" className="h-10 rounded-lg bg-white border border-brand-indigo text-brand-indigo text-sm font-medium grid place-items-center">Open role switcher</Link>
              <button onClick={resetAll} className="h-10 rounded-lg bg-white border border-brand-error text-brand-error text-sm font-medium">Reset prototype data</button>
            </div>
          </div>
        </div>
      </div>
      <BottomTabs />
    </PhoneFrame>
  );
}