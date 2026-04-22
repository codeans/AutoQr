import clsx from "clsx";
import { Link } from "react-router-dom";

type LogoProps = {
  className?: string;
  to?: string;
};

export const Logo = ({ className, to = "/" }: LogoProps) => (
  <Link
    to={to}
    className={clsx(
      "group inline-flex items-center gap-2.5 text-fog-50",
      className
    )}
    aria-label="AutoQr home"
  >
    <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-md border border-white/15 bg-ink-800">
      <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,199,154,0.25),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <svg viewBox="0 0 24 24" className="relative h-4 w-4" aria-hidden fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="15" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="15" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="15" y="15" width="2.5" height="2.5" fill="currentColor" />
        <rect x="19.5" y="15" width="1.5" height="1.5" fill="currentColor" />
        <rect x="15" y="19.5" width="1.5" height="1.5" fill="currentColor" />
        <rect x="18" y="18" width="3" height="3" fill="currentColor" />
      </svg>
    </span>
    <span className="text-[15px] font-semibold tracking-[-0.015em] text-fog-50">
      autoqr<span className="text-accent">.</span>
    </span>
  </Link>
);
