import clsx from "clsx";
import type { PropsWithChildren } from "react";

type ContainerProps = PropsWithChildren<{
  className?: string;
  size?: "default" | "wide" | "narrow";
}>;

const sizeMap = {
  default: "max-w-7xl",
  wide: "max-w-[86rem]",
  narrow: "max-w-4xl"
};

export const Container = ({ children, className, size = "default" }: ContainerProps) => (
  <div className={clsx("relative mx-auto w-full px-6 sm:px-8 lg:px-10", sizeMap[size], className)}>
    {children}
  </div>
);
