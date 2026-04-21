import { LucideIcon } from "lucide-react";
import { Card } from "../../../components/ui";

type SummaryCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
};

export const SummaryCard = ({ title, value, hint, icon: Icon }: SummaryCardProps) => (
  <Card className="rounded-2xl border-slate-200/90 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-2 text-action">
        <Icon className="h-4 w-4" />
      </div>
    </div>
    {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
  </Card>
);
