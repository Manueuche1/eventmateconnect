import { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...rest}
      className={`w-full h-12 rounded-xl bg-brand-amber text-brand-indigo font-semibold text-sm shadow-sm active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...rest}
      className={`w-full h-12 rounded-xl bg-white text-brand-indigo border border-brand-indigo font-semibold text-sm active:scale-[0.98] transition ${className}`}
    >
      {children}
    </button>
  );
}