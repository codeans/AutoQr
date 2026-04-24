import { useEffect, useState } from "react";
import { maskGermanPhone } from "@autoqr/shared";
import { Card, EmptyState, LoadingState, SectionTitle, StatusBadge, SecondaryButton } from "../../../components/ui";
import { ownerService } from "../services/owner.service";
import type { OwnerScanAlert } from "../services/owner.service";

const SEVERITY_TONES: Record<string, "info" | "warning" | "danger"> = {
  info: "info",
  urgent: "warning",
  emergency: "danger"
};

const REASON_LABEL: Record<string, string> = {
  wrong_parking: "Wrongly parked car",
  headlights_on: "Headlights left on",
  flat_tyre: "Flat tyre",
  towing: "Car being towed",
  door_or_window_open: "Car door or window open",
  car_damaged: "Car damaged",
  accident: "Accident / emergency",
  other: "Other"
};

export const ScanAlertsScreen = () => {
  const [alerts, setAlerts] = useState<OwnerScanAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => ownerService.listScanAlerts().then(setAlerts);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const ack = async (id: string) => {
    await ownerService.acknowledgeScan(id);
    await refresh();
  };

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Car scan alerts"
        subtitle="Every time someone scans your car tag and picks a reason, it appears here. Acknowledge after you've taken action."
      />
      {alerts.length === 0 ? (
        <EmptyState title="No car scan alerts yet" message="Alerts from people who scan your car QR will show up here." />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <Card key={a._id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {REASON_LABEL[a.reason] ?? a.reason}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge label={a.severity} tone={SEVERITY_TONES[a.severity]} />
                  <StatusBadge label={a.status} />
                </div>
              </div>
              {a.message && <p className="text-sm text-slate-700">“{a.message}”</p>}
              {a.reporterPhone && (
                <p className="text-sm text-slate-600">
                  Reporter: <span className="font-mono">{maskGermanPhone(a.reporterPhone)}</span>
                  <span className="ml-1 text-xs text-slate-400">(masked for privacy)</span>
                </p>
              )}
              {a.location?.address && <p className="text-sm text-slate-600">Location: {a.location.address}</p>}
              {a.status !== "acknowledged" && a.status !== "closed" && (
                <SecondaryButton type="button" onClick={() => ack(a._id)}>
                  Mark as handled
                </SecondaryButton>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
