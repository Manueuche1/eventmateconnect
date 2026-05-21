import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-brand-mist flex items-stretch md:items-center justify-center md:py-6">
      <div className="w-full md:max-w-[420px] md:rounded-[36px] md:shadow-2xl md:overflow-hidden md:h-[860px] bg-white relative flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}