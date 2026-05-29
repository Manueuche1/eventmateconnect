import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const navigate = useNavigate();
  const { user, profile, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [busy, setBusy] = useState(false);

  // If already signed in, redirect based on role.
  useEffect(() => {
    if (user && profile) {
      navigate({ to: profile.role === "organizer" ? "/organizer" : "/home" });
    }
  }, [user, profile, navigate]);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!fullName.trim()) { toast.error("Enter your full name"); return; }
        const { error } = await signUp(email.trim(), password, fullName.trim(), role);
        if (error) { toast.error(error); return; }
        // Determine landing based on chosen role (profile may take a beat to load via listener).
        // Listener's redirect effect above will also fire once profile arrives.
        const { data: sess } = await supabase.auth.getSession();
        if (sess.session) {
          toast.success("Welcome to EventMate");
          navigate({ to: role === "organizer" ? "/organizer" : "/home" });
        } else {
          toast.success("Check your email to confirm your account");
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) { toast.error(error); return; }
        // Redirect handled by effect once profile loads.
      }
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = /.+@.+\..+/.test(email) && password.length >= 6 && (mode === "signin" || fullName.trim().length > 0);

  return (
    <PhoneFrame>
      <div className="px-6 pt-10 pb-6 flex-1 flex flex-col">
        <Logo className="w-44" />
        <h1 className="mt-8 text-2xl font-semibold text-brand-indigo tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-brand-slate">
          {mode === "signin" ? "Sign in to find and book events." : "Join EventMate as an attendee or organizer."}
        </p>

        <div className="mt-6 grid grid-cols-2 bg-brand-mist rounded-xl p-1 text-sm font-medium">
          {(["signin", "signup"] as const).map(t => (
            <button key={t} onClick={() => setMode(t)} className={`h-9 rounded-lg transition ${mode === t ? "bg-white text-brand-indigo shadow-sm" : "text-brand-slate"}`}>
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {mode === "signup" && (
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name"
              className="w-full h-12 px-4 rounded-xl bg-brand-mist text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email"
            className="w-full h-12 px-4 rounded-xl bg-brand-mist text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password (min 6 chars)"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full h-12 px-4 rounded-xl bg-brand-mist text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo" />

          {mode === "signup" && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-brand-slate font-semibold mb-1.5">I'm joining as</div>
              <div className="grid grid-cols-2 bg-brand-mist rounded-xl p-1 text-sm font-medium">
                {(["attendee", "organizer"] as const).map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={`h-9 rounded-lg capitalize transition ${role === r ? "bg-white text-brand-indigo shadow-sm" : "text-brand-slate"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={submit} disabled={!canSubmit || busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </PrimaryButton>
        </div>

        <div className="mt-auto pt-6 text-center text-xs text-brand-slate">
          Demo mode, no real payments
        </div>
      </div>
    </PhoneFrame>
  );
}