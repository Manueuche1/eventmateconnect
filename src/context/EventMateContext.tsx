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

function load() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(LS) || "null"); } catch { return null; }
}

export function EventMateProvider({ children }: { children: ReactNode }) {
  const init = load() || {};
  const [signedIn, setSignedIn] = useState<boolean>(!!init.signedIn);
  const [onboarded, setOnboarded] = useState<boolean>(!!init.onboarded);
  const [prefs, setPrefs] = useState<Prefs>(init.prefs || { categories: ATTENDEE_USER.preferences, areas: ATTENDEE_USER.areas });
  const [saved, setSaved] = useState<string[]>(init.saved || []);
  const [tickets, setTickets] = useState<Ticket[]>(init.tickets || []);
  const [role, setRole] = useState<"attendee" | "organizer">(init.role || "attendee");

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS, JSON.stringify({ signedIn, onboarded, prefs, saved, tickets, role }));
  }, [signedIn, onboarded, prefs, saved, tickets, role]);

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