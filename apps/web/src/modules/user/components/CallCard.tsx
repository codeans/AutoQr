import { PhoneCall } from "lucide-react";
import { Card } from "../../../components/ui";
import { UserCall } from "../types/user.types";
import { formatDateTime } from "../utils/user.helpers";
import { StatusBadge } from "./StatusBadge";

export const CallCard = ({ call }: { call: UserCall }) => (
  <Card className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        <PhoneCall className="h-4 w-4 text-action" />
        Incoming call
      </div>
      <StatusBadge status={call.status} />
    </div>
    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
      <p>
        <span className="text-xs text-slate-500">Duration</span>
        <br />
        {call.duration ?? 0}s
      </p>
      <p>
        <span className="text-xs text-slate-500">Incident</span>
        <br />
        {call.incidentId || "-"}
      </p>
      <p>
        <span className="text-xs text-slate-500">Time</span>
        <br />
        {formatDateTime(call.createdAt)}
      </p>
    </div>
  </Card>
);
