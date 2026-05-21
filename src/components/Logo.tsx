export function Logo({ variant = "default", className = "" }: { variant?: "default" | "reverse"; className?: string }) {
  const wordmark = variant === "reverse" ? "#FFFFFF" : "#1A1F71";
  const tagline = variant === "reverse" ? "#F4B740" : "#5F5E5A";
  return (
    <svg viewBox="0 0 360 80" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="EventMate">
      <rect x="0" y="6" width="68" height="68" rx="16" fill="#1A1F71" />
      <text x="34" y="54" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="36" fontWeight="700" fill="#F4B740" letterSpacing="-0.04em">em</text>
      <text x="86" y="42" fontFamily="Inter, system-ui, sans-serif" fontSize="28" fontWeight="600" fill={wordmark} letterSpacing="-0.01em">eventmate</text>
      <text x="86" y="64" fontFamily="Inter, system-ui, sans-serif" fontSize="10" fontWeight="500" fill={tagline} letterSpacing="0.18em">FIND. BOOK. SHOW UP.</text>
    </svg>
  );
}

export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="EventMate icon">
      <rect width="512" height="512" rx="112" fill="#1A1F71" />
      <text x="256" y="340" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="260" fontWeight="700" fill="#F4B740" letterSpacing="-0.04em">em</text>
    </svg>
  );
}