import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useEventMate } from "@/context/EventMateContext";
import { z } from "zod";

export const Route = createFileRoute("/auth/otp")({
  component: Otp,
  validateSearch: z.object({ method: z.enum(["phone", "email"]).optional(), value: z.string().optional(), next: z.string().optional() }),
});

function maskValue(method?: string, v?: string) {
  if (!v) return "";
  if (method === "phone") {
    const digits = v.replace(/\D/g, "");
    return "+234 " + digits.slice(0, 3) + " *** " + digits.slice(-4);
  }
  const [a, b] = v.split("@");
  return a.slice(0, 2) + "***@" + (b || "");
}

function Otp() {
  const { method, value, next } = useSearch({ from: "/auth/otp" });
  const navigate = useNavigate();
  const { signIn } = useEventMate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDigits("274839".split("")), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (digits.every(d => d !== "")) {
      setDone(true);
      signIn();
      const t = setTimeout(() => navigate({ to: next || "/home" }), 800);
      return () => clearTimeout(t);
    }
  }, [digits, signIn, navigate, next]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <PhoneFrame>
      <div className="px-6 pt-10 pb-6 flex-1 flex flex-col relative">
        <span className="absolute top-3 right-4 text-[10px] font-medium text-brand-slate uppercase tracking-wider">Demo: code auto-filled</span>
        <h1 className="text-2xl font-semibold text-brand-indigo tracking-tight">Check your messages</h1>
        <p className="mt-1 text-sm text-brand-slate">We sent a 6-digit code to {maskValue(method, value) || "your device"}.</p>

        <div className="mt-8 flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el; }}
              value={d}
              maxLength={1}
              inputMode="numeric"
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "").slice(-1);
                setDigits(prev => { const c = [...prev]; c[i] = v; return c; });
                if (v && refs.current[i + 1]) refs.current[i + 1]?.focus();
              }}
              className="w-12 h-14 text-center text-xl font-semibold rounded-xl bg-brand-mist focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            />
          ))}
        </div>

        <div className="mt-6 text-sm text-brand-slate">
          {countdown > 0 ? <>Resend code in <span className="font-medium text-brand-ink">{countdown}s</span></> : <button className="text-brand-indigo font-medium">Resend code</button>}
        </div>

        {done && <div className="mt-6 text-sm text-brand-success font-medium">Signed in. Taking you back…</div>}
      </div>
    </PhoneFrame>
  );
}