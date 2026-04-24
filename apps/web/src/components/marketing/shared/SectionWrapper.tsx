import clsx from "clsx";
import type { PropsWithChildren } from "react";

type SectionWrapperProps = PropsWithChildren<{
  id?: string;
  className?: string;
  spacing?: "default" | "tight" | "loose";
  divider?: boolean;
}>;

const spacingMap = {
  tight: "py-16 sm:py-20",
  default: "py-24 sm:py-32 lg:py-40",
  loose: "py-32 sm:py-40 lg:py-48"
};

export const SectionWrapper = ({
  id,
  className,
  children,
  spacing = "default",
  divider
}: SectionWrapperProps) => (
  <section
    id={id}
    className={clsx(
      "relative",
      spacingMap[spacing],
      divider && "border-t border-surface-border",
      className
    )}
  >
    {children}
  </section>
);
