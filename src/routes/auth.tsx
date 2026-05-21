import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Logo } from "@/components/Logo";
import { z } from "zod";

const search = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  component: Auth,
  validateSearch: search,
});

function Auth() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = tab === "phone" ? phone.replace(/\D/g, "").length === 10 : /.+@.+\..+/.test(email);
  const submit = () => navigate({ to: "/auth/otp", search: { method: tab, value: tab === "phone" ? phone : email, next } });

  return (
    <PhoneFrame>
      <div className="px-6 pt-10 pb-6 flex-1 flex flex-col">
        <Logo className="w-44" />
        <h1 className="mt-8 text-2xl font-semibold text-brand-indigo tracking-tight">Sign in to continue</h1>
        <p className="mt-1 text-sm text-brand-slate">We use this to send your ticket and order updates.</p>

        <div className="mt-6 grid grid-cols-2 bg-brand-mist rounded-xl p-1 text-sm font-medium">
          {(["phone", "email"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`h-9 rounded-lg capitalize transition ${tab === t ? "bg-white text-brand-indigo shadow-sm" : "text-brand-slate"}`}>{t}</button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "phone" ? (
            <div className="flex gap-2">
              <div className="h-12 px-3 rounded-xl bg-brand-mist flex items-center gap-2 text-sm font-medium text-brand-ink">
                <span>🇳🇬</span><span>+234</span>
              </div>
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" placeholder="803 123 4567"
                className="flex-1 h-12 px-4 rounded-xl bg-brand-mist text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo" />
            </div>
          ) : (
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
              className="w-full h-12 px-4 rounded-xl bg-brand-mist text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo" />
          )}
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={submit} disabled={!canSubmit}>Send code</PrimaryButton>
        </div>
        <Link to="/home" className="mt-4 text-center text-sm text-brand-indigo font-medium">Continue as guest</Link>
      </div>
    </PhoneFrame>
  );
}