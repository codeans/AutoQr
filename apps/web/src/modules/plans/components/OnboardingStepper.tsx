import { Check } from "lucide-react";

export type OnboardingStepKey = "plan" | "account" | "address" | "payment";

const STEPS: Array<{ key: OnboardingStepKey; label: string }> = [
  { key: "plan", label: "Plan" },
  { key: "account", label: "Account" },
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" }
];

export const OnboardingStepper = ({ current }: { current: OnboardingStepKey }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex flex-wrap items-center gap-2 text-[12px]">
      {STEPS.map((step, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold transition ${
                done
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : active
                  ? "border-fog-50/40 bg-fog-50 text-ink-950"
                  : "border-white/10 bg-white/[0.02] text-fog-500"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
            </span>
            <span
              className={`text-[12.5px] uppercase tracking-[0.16em] ${
                active ? "text-fog-50" : done ? "text-fog-300" : "text-fog-500"
              }`}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && <span className="h-px w-6 bg-white/10" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
};
