import type { ScanReason } from "../services/scan.service";

type Props = {
  reason: ScanReason;
  label: string;
  description: string;
  severity: "info" | "urgent" | "emergency";
  selected: boolean;
  onSelect: () => void;
};

const severityStyles: Record<string, string> = {
  info: "border-white/10 bg-white/[0.03]",
  urgent: "border-amber-400/20 bg-amber-500/5",
  emergency: "border-red-500/25 bg-red-500/5"
};

const severityBadgeStyles: Record<string, string> = {
  info: "bg-white/10 text-fog-200",
  urgent: "bg-amber-400/20 text-amber-200",
  emergency: "bg-red-500/20 text-red-200"
};

export const ReasonOption = ({ reason: _reason, label, description, severity, selected, onSelect }: Props) => (
  <button
    type="button"
    onClick={onSelect}
    className={`text-left w-full rounded-2xl border p-5 transition ${severityStyles[severity]} ${
      selected ? "ring-2 ring-accent/40 border-accent/40" : "hover:border-white/20"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-lg text-fog-50">{label}</h3>
        <p className="mt-1 text-[13px] text-fog-300">{description}</p>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${severityBadgeStyles[severity]}`}>
        {severity}
      </span>
    </div>
  </button>
);
