import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

export function TopBar({ title, back = "/home", right }: { title?: string; back?: string | false; right?: ReactNode }) {
  return (
    <div className="shrink-0 sticky top-0 z-30 bg-white/95 backdrop-blur px-4 py-3 flex items-center gap-2 border-b border-brand-mist">
      {back !== false ? (
        <Link to={back as string} className="h-9 w-9 grid place-items-center -ml-2 rounded-full hover:bg-brand-mist">
          <ChevronLeft className="h-5 w-5 text-brand-ink" />
        </Link>
      ) : <div className="w-1" />}
      <div className="flex-1 text-base font-semibold text-brand-indigo truncate">{title}</div>
      {right}
    </div>
  );
}