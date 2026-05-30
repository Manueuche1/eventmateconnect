import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Heart, Ticket, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", icon: Compass },
  { to: "/saved", label: "Saved", icon: Heart },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomTabs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="lg:hidden shrink-0 border-t border-brand-mist bg-white px-2 pt-2 pb-3 grid grid-cols-4">
      {tabs.map((t) => {
        const active = path === t.to;
        const Icon = t.icon;
        return (
          <Link key={t.to} to={t.to} className="flex flex-col items-center gap-1 py-1">
            <Icon
              className={`h-5 w-5 ${active ? "text-brand-indigo" : "text-brand-slate"}`}
              strokeWidth={active ? 2.4 : 1.8}
            />
            <span
              className={`text-[11px] font-medium ${
                active ? "text-brand-indigo" : "text-brand-slate"
              }`}
            >
              {t.label}
            </span>
            <span
              className={`h-1 w-1 rounded-full ${active ? "bg-brand-amber" : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
