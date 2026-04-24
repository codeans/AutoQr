import clsx from "clsx";

type GridBackdropProps = {
  className?: string;
  size?: number;
  fade?: boolean;
};

export const GridBackdrop = ({ className, size = 56, fade = true }: GridBackdropProps) => (
  <div
    aria-hidden
    className={clsx(
      "pointer-events-none absolute inset-0 overflow-hidden",
      className
    )}
  >
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        WebkitMaskImage: fade
          ? "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 85%)"
          : undefined,
        maskImage: fade
          ? "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 85%)"
          : undefined
      }}
    />
  </div>
);

export const DotBackdrop = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}
  >
    <div
      className="absolute inset-0 opacity-[0.5]"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 50% at 50% 40%, black 40%, transparent 85%)",
        maskImage:
          "radial-gradient(ellipse 60% 50% at 50% 40%, black 40%, transparent 85%)"
      }}
    />
  </div>
);
