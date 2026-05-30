import { ReactNode } from "react";

/**
 * Adaptive layout wrapper.
 *
 * - Mobile (<768px): fills the viewport, like a native app.
 * - Tablet (768–1023px): centered "phone-card" with mist background on the sides.
 * - Desktop (≥1024px): no frame, the screen becomes a full web layout.
 *
 * Individual routes opt into desktop layouts by using the `lg:` Tailwind
 * prefixes inside their content. PhoneFrame's job is to stop forcing
 * a fixed 420px column on every viewport.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-brand-mist md:bg-brand-mist lg:bg-white">
      {/* Mobile + Tablet: phone-card framing */}
      <div className="lg:hidden min-h-screen w-full flex items-stretch md:items-center justify-center md:py-6">
        <div className="w-full md:max-w-[420px] md:rounded-[36px] md:shadow-2xl md:overflow-hidden md:h-[860px] bg-white relative flex flex-col overflow-hidden">
          {children}
        </div>
      </div>

      {/* Desktop: full-width layout, no phone frame */}
      <div className="hidden lg:flex min-h-screen w-full bg-white">
        <div className="w-full max-w-[1280px] mx-auto px-8 flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
