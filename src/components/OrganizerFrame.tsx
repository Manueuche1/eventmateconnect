import { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LayoutDashboard, Calendar, BarChart3, Users, Settings } from "lucide-react";

const tabs = [
  { to: "/organizer", label: "Dashboard", icon: LayoutDashboard },
  { to: "/organizer", label: "Events", icon: Calendar },
  { to: "/organizer", label: "Sales", icon: BarChart3 },
  { to: "/organizer", label: "Attendees", icon: Users },
  { to: "/profile", label: "Settings", icon: Settings },
];

export function OrganizerFrame({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  return (
    <PhoneFrame>
      {children}
      <nav className="shrink-0 border-t border-brand-mist bg-white px-2 pt-2 pb-3 grid grid-cols-5">
        {tabs.map((t, i) => {
          const Icon = t.icon;
          const active = i === 0 && path === "/organizer";
          return (
            <Link key={i} to={t.to} className="flex flex-col items-center gap-1 py-1">
              <Icon className={`h-5 w-5 ${active ? "text-brand-indigo" : "text-brand-slate"}`} strokeWidth={active ? 2.4 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? "text-brand-indigo" : "text-brand-slate"}`}>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </PhoneFrame>
  );
}