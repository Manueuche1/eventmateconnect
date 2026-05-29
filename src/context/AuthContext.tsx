import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export interface Profile {
  id: string;
  full_name: string;
  role: string;
  organization_name: string | null;
  organization_verified: boolean | null;
  avatar_initials: string | null;
  preferences_categories: string[] | null;
  preferences_areas: string[] | null;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  savedIds: Set<string>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: "attendee" | "organizer") => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  toggleSave: (eventId: string) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const qc = useQueryClient();

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile((data as Profile) ?? null);
  }, []);

  const loadSaved = useCallback(async (uid: string) => {
    const { data } = await supabase.from("saved_events").select("event_id").eq("user_id", uid);
    setSavedIds(new Set((data ?? []).map((r: { event_id: string }) => r.event_id)));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const uid = s.user.id;
        setTimeout(() => { loadProfile(uid); loadSaved(uid); }, 0);
      } else {
        setProfile(null);
        setSavedIds(new Set());
      }
      qc.invalidateQueries();
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id);
        loadSaved(data.session.user.id);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile, loadSaved, qc]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUp = async (email: string, password: string, fullName: string, role: "attendee" | "organizer") => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { full_name: fullName, role },
      },
    });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const toggleSave = async (eventId: string) => {
    if (!user) return;
    const isSaved = savedIds.has(eventId);
    setSavedIds(s => {
      const n = new Set(s);
      if (isSaved) n.delete(eventId); else n.add(eventId);
      return n;
    });
    if (isSaved) {
      await supabase.from("saved_events").delete().eq("user_id", user.id).eq("event_id", eventId);
    } else {
      await supabase.from("saved_events").insert({ user_id: user.id, event_id: eventId });
    }
    qc.invalidateQueries({ queryKey: ["saved-events"] });
  };

  return (
    <Ctx.Provider value={{ loading, session, user, profile, savedIds, signIn, signUp, signOut, toggleSave }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}

export function useRequireAuth(opts?: { role?: "organizer" | "attendee" }) {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (opts?.role && profile && profile.role !== opts.role) {
      navigate({ to: profile.role === "organizer" ? "/organizer" : "/home" });
    }
  }, [loading, user, profile, navigate, opts?.role]);
  return { loading, user, profile };
}