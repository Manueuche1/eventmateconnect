import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Mobile and tablet: phone-card layout (unchanged from original) */}
      <div className="lg:hidden min-h-screen w-full bg-brand-mist flex items-stretch md:items-center justify-center md:py-6">
        <div className="w-full md:max-w-[420px] md:rounded-[36px] md:shadow-2xl md:overflow-hidden md:h-[860px] bg-white relative flex flex-col overflow-hidden">
          {children}
        </div>
      </div>

      {/* Desktop: no phone frame, full-width container */}
      <div className="hidden lg:flex min-h-screen w-full bg-white flex-col">
        {children}
      </div>
    </>
  );
}
