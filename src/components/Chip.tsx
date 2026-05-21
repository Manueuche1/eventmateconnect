import { ButtonHTMLAttributes, ReactNode } from "react";
export function Chip({ active, children, ...rest }: { active?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`shrink-0 px-3 h-9 rounded-full text-xs font-medium border transition ${active ? "bg-brand-indigo text-white border-brand-indigo" : "bg-white text-brand-ink border-brand-mist hover:border-brand-indigo/40"}`}
    >{children}</button>
  );
}