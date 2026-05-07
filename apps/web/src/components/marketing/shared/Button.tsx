import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { localizePath } from "../../../i18n/routing";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-center font-medium tracking-tight transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 md:hover:-translate-y-[1px] shadow-[0_8px_24px_-8px_rgba(29,78,216,0.5)]",
  secondary:
    "border border-surface-border bg-white text-content hover:border-brand-200 hover:bg-brand-50",
  ghost:
    "text-content-muted hover:text-content hover:bg-surface-sunken"
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", showArrow, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
      {showArrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  )
);
Button.displayName = "Button";

type LinkButtonProps = {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  showArrow?: boolean;
  external?: boolean;
  children: React.ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export const LinkButton = ({
  to,
  variant = "primary",
  size = "md",
  className,
  showArrow,
  external,
  children,
  ...rest
}: LinkButtonProps) => {
  const classes = clsx(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {children}
      {showArrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  );
  if (external) {
    return (
      <a href={to} className={classes} target="_blank" rel="noreferrer" {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link to={localizePath(to)} className={classes}>
      {content}
    </Link>
  );
};
