import clsx from "clsx";
import { Link } from "react-router-dom";
import { localizePath } from "../../../i18n/routing";

type LogoProps = {
  className?: string;
  to?: string;
};

export const Logo = ({ className, to = "/" }: LogoProps) => (
  <Link
    to={localizePath(to)}
    className={clsx(
      "group inline-flex items-center gap-2.5 text-content",
      className
    )}
    aria-label="AutoQr home"
  >
    <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg border border-brand-100 bg-brand-50 text-brand-700 shadow-soft">
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
    <span className="text-[15px] font-semibold tracking-[-0.015em] text-content">
      autoqr<span className="text-brand-700">.</span>
    </span>
  </Link>
);
