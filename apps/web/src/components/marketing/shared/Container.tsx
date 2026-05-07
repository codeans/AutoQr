import clsx from "clsx";
import type { PropsWithChildren } from "react";

type ContainerProps = PropsWithChildren<{
  className?: string;
  size?: "default" | "wide" | "narrow";
}>;

const sizeMap = {
  default: "max-w-[90rem]",
  wide: "max-w-[96rem]",
  narrow: "max-w-4xl"
};

export const Container = ({ children, className, size = "default" }: ContainerProps) => (
  <div className={clsx("relative mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12", sizeMap[size], className)}>
    {children}
  </div>
);
