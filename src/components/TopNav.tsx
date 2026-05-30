import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { Search, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const attendeeLinks = [
  { to: "/home", label: "Discover" },
  { to: "/saved", label: "Saved" },
  { to: "/tickets", label: "My Tickets" },
];

const organizerLinks = [{ to: "/organizer", label: "Dashboard" }];

/**
 * Desktop-only top navigation.
 * - Hidden on mobile and tablet (lg:flex)
 * - Hides itself on auth routes and the splash so it doesn't clutter pre-login flows
 */
export function TopNav() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Don't show the nav on splash, auth, or onboarding screens
  const hideOn = ["/", "/auth", "/onboarding"];
  if (hideOn.some((p) => path === p || path.startsWith(p + "/"))) return null;

  // Don't show if user is not signed in
  if (!user || !profile) return null;

  // Choose links based on role
  const isOrganizer = profile.role === "organizer";
  const links = isOrganizer ? organizerLinks : attendeeLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-brand-mist">
      <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo on the left */}
        <Link to={isOrganizer ? "/organizer" : "/home"} className="flex items-center">
          <Logo className="w-32" />
        </Link>

        {/* Nav links in the middle */}
        <nav className="flex items-center gap-8">
          {links.map((l) => {
            const active = path === l.to || path.startsWith(l.to + "/");
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative text-sm font-medium transition-colors py-2 ${
                  active ? "text-brand-indigo" : "text-brand-slate hover:text-brand-indigo"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-brand-amber rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search + user on the right */}
        <div className="flex items-center gap-4">
          <button
            className="h-9 w-9 grid place-items-center rounded-full bg-brand-mist hover:bg-brand-mist/70 transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4 text-brand-ink" />
          </button>

          <Link
            to="/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <div className="text-xs font-semibold text-brand-ink">{profile.full_name}</div>
              <div className="text-[10px] text-brand-slate">
                {profile.role === "organizer"
                  ? profile.organization_name ?? "Organizer"
                  : "Attendee"}
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-indigo text-white grid place-items-center text-xs font-semibold">
              {profile.avatar_initials ?? "??"}
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-brand-mist transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 text-brand-slate" />
          </button>
        </div>
      </div>
    </header>
  );
}
