import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-fog-50 text-ink-950 hover:bg-white hover:-translate-y-[1px] shadow-[0_8px_30px_-10px_rgba(255,255,255,0.25)]",
  secondary:
    "border border-white/12 bg-white/[0.03] text-fog-100 hover:bg-white/[0.06] hover:border-white/20",
  ghost:
    "text-fog-200 hover:text-white hover:bg-white/[0.04]"
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
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
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
    <Link to={to} className={classes}>
      {content}
    </Link>
  );
};
