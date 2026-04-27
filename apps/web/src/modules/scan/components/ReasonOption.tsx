import { useTranslation } from "react-i18next";
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
  info: "border-surface-border bg-white",
  urgent: "border-amber-300 bg-amber-50/70",
  emergency: "border-red-300 bg-red-50/70"
};

const severityBadgeStyles: Record<string, string> = {
  info: "bg-brand-100 text-brand-900",
  urgent: "bg-amber-100 text-amber-700",
  emergency: "bg-red-100 text-red-700"
};

export const ReasonOption = ({ reason: _reason, label, description, severity, selected, onSelect }: Props) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left w-full rounded-2xl border p-5 transition ${severityStyles[severity]} ${
        selected ? "ring-2 ring-brand-500/30 border-brand-500 bg-brand-50" : "hover:border-brand-300 hover:bg-brand-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-content">{label}</h3>
          <p className="mt-1 text-[13px] text-content-muted">{description}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${severityBadgeStyles[severity]}`}>
          {t(`scan.severity.${severity}`)}
        </span>
      </div>
    </button>
  );
};
