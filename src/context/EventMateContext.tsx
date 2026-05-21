import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { ATTENDEE_USER, Category, Ticket } from "@/data/mockData";

interface Prefs { categories: Category[]; areas: string[] }

interface State {
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  onboarded: boolean;
  completeOnboarding: (prefs: Prefs) => void;
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  saved: string[];
  toggleSave: (id: string) => void;
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  role: "attendee" | "organizer";
  setRole: (r: "attendee" | "organizer") => void;
  user: typeof ATTENDEE_USER;
  resetAll: () => void;
}

const Ctx = createContext<State | null>(null);

const LS = "eventmate:v1";

export function EventMateProvider({ children }: { children: ReactNode }) {
  // Initialize with defaults so SSR and first client render match.
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [prefs, setPrefs] = useState<Prefs>({ categories: ATTENDEE_USER.preferences, areas: ATTENDEE_USER.areas });
  const [saved, setSaved] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state after mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) {
        const init = JSON.parse(raw);
        if (typeof init.signedIn === "boolean") setSignedIn(init.signedIn);
        if (typeof init.onboarded === "boolean") setOnboarded(init.onboarded);
        if (init.prefs) setPrefs(init.prefs);
        if (Array.isArray(init.saved)) setSaved(init.saved);
        if (Array.isArray(init.tickets)) setTickets(init.tickets);
        if (init.role) setRole(init.role);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist after hydration.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS, JSON.stringify({ signedIn, onboarded, prefs, saved, tickets, role }));
  }, [hydrated, signedIn, onboarded, prefs, saved, tickets, role]);

  const value: State = useMemo(() => ({
    signedIn,
    signIn: () => setSignedIn(true),
    signOut: () => setSignedIn(false),
    onboarded,
    completeOnboarding: (p) => { setPrefs(p); setOnboarded(true); },
    prefs,
    setPrefs,
    saved,
    toggleSave: (id) => setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]),
    tickets,
    addTicket: (t) => setTickets(ts => [...ts, t]),
    role,
    setRole,
    user: ATTENDEE_USER,
    resetAll: () => { localStorage.removeItem(LS); window.location.href = "/"; },
  }), [signedIn, onboarded, prefs, saved, tickets, role]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEventMate() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEventMate must be inside EventMateProvider");
  return v;
}