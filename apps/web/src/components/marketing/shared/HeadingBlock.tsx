import clsx from "clsx";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type HeadingBlockProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  size?: "md" | "lg" | "xl";
};

const sizeMap = {
  md: "text-3xl sm:text-4xl lg:text-5xl",
  lg: "text-4xl sm:text-5xl lg:text-6xl",
  xl: "text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
};

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={clsx(
      "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700",
      className
    )}
  >
    <span className="h-px w-6 bg-brand-200" aria-hidden />
    {children}
  </span>
);

export const HeadingBlock = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  size = "lg"
}: HeadingBlockProps) => (
  <div
    className={clsx(
      "max-w-4xl",
      align === "center" ? "mx-auto text-center" : "",
      className
    )}
  >
    {eyebrow && (
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
    )}
    <Reveal delay={0.05}>
      <h2
        className={clsx(
          "mt-5 font-display font-semibold tracking-display text-balance text-content",
          sizeMap[size]
        )}
        style={{ lineHeight: 0.98 }}
      >
        {title}
      </h2>
    </Reveal>
    {subtitle && (
      <Reveal delay={0.12}>
        <p
          className={clsx(
            "mt-6 max-w-2xl text-base leading-relaxed text-content-muted sm:text-lg",
            align === "center" ? "mx-auto" : ""
          )}
        >
          {subtitle}
        </p>
      </Reveal>
    )}
  </div>
);
