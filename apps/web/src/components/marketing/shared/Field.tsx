import clsx from "clsx";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  PropsWithChildren,
  TextareaHTMLAttributes
} from "react";

const baseInput =
  "w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-[14.5px] text-fog-100 placeholder:text-fog-500 transition outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

export const FieldLabel = ({
  className,
  children,
  ...props
}: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) => (
  <label
    className={clsx(
      "block text-[11px] font-medium uppercase tracking-[0.18em] text-fog-400",
      className
    )}
    {...props}
  >
    {children}
  </label>
);

export const TextField = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={clsx(baseInput, className)} {...props} />
);

export const TextArea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={clsx(baseInput, "min-h-[120px] resize-y", className)} {...props} />
);

export const FieldGroup = ({ children }: PropsWithChildren) => (
  <div className="space-y-2">{children}</div>
);
