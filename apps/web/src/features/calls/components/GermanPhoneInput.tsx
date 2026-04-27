import clsx from "clsx";
import { useMemo } from "react";
import { GERMAN_PHONE_PLACEHOLDER, isValidGermanPhone, toGermanE164 } from "@autoqr/shared";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  showValidation?: boolean;
  onEnter?: () => void;
};

export const GermanPhoneInput = ({
  id,
  value,
  onChange,
  disabled,
  required,
  autoFocus,
  className,
  showValidation = true,
  onEnter
}: Props) => {
  const valid = useMemo(() => isValidGermanPhone(value), [value]);
  const hint = useMemo(() => {
    if (!value) return "Format: +49 170 1234567";
    if (valid) {
      const normalized = toGermanE164(value);
      return `Normalized: ${normalized}`;
    }
    return "Please enter a valid German phone number";
  }, [valid, value]);

  return (
    <div className={clsx("w-full", className)}>
      <div
        className={clsx(
          "flex items-stretch overflow-hidden rounded-xl border transition",
          "border-surface-border bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20",
          value && !valid && "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20"
        )}
      >
        <span
          className="flex items-center gap-2 border-r border-surface-border bg-surface-soft px-3.5 py-3 text-[14px] font-semibold text-content"
          aria-hidden
        >
          <span
            className="inline-block h-4 w-6 overflow-hidden rounded-sm shadow-sm"
            style={{
              background:
                "linear-gradient(to bottom, #000 0%, #000 33%, #DD0000 33%, #DD0000 66%, #FFCE00 66%, #FFCE00 100%)"
            }}
            title="Germany"
          />
          <span className="tabular-nums">+49</span>
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          placeholder={GERMAN_PHONE_PLACEHOLDER.replace("+49 ", "")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) onEnter();
          }}
          className="flex-1 bg-transparent px-3.5 py-3 text-[15px] text-content placeholder:text-content-soft outline-none"
        />
      </div>
      {showValidation && (
        <p className={clsx("mt-1.5 text-[12px]", value && !valid ? "text-red-600" : "text-content-subtle")}>{hint}</p>
      )}
    </div>
  );
};
