import clsx from "clsx";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  PropsWithChildren,
  TextareaHTMLAttributes
} from "react";

const baseInput =
  "w-full rounded-xl border border-surface-border bg-white px-4 py-3 text-[14.5px] text-content placeholder:text-content-soft transition outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export const FieldLabel = ({
  className,
  children,
  ...props
}: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) => (
  <label
    className={clsx(
      "block text-[11px] font-medium uppercase tracking-[0.18em] text-content-subtle",
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
