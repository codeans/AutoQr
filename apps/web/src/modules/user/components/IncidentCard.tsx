import { Camera, Phone } from "lucide-react";
import { Card } from "../../../components/ui";
import { UserIncident } from "../types/user.types";
import { formatDateTime } from "../utils/user.helpers";
import { StatusBadge } from "./StatusBadge";

type IncidentCardProps = {
  incident: UserIncident;
  onOpenDetail?: (id: string) => void;
};

export const IncidentCard = ({ incident, onOpenDetail }: IncidentCardProps) => (
  <Card className="space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Private reporter</h3>
        <p className="text-xs text-slate-500">{incident.reporterPhoneMasked || "Number masked"}</p>
      </div>
      <StatusBadge status={incident.status} />
    </div>
    <p className="text-sm text-slate-700">{incident.message}</p>
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span className="inline-flex items-center gap-1">
        <Camera className="h-3.5 w-3.5" />
        {incident.images?.length ?? 0} image(s)
      </span>
      <span>{formatDateTime(incident.createdAt)}</span>
    </div>
    {onOpenDetail ? (
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-action transition hover:text-red-700"
        onClick={() => onOpenDetail(incident._id)}
      >
        <Phone className="h-3.5 w-3.5" />
        View call timeline
      </button>
    ) : null}
  </Card>
);
