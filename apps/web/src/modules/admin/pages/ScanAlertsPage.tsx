import { useEffect, useState } from "react";
import { Card, DataTable, EmptyState, LoadingState, PageHeader } from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

export const ScanAlertsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminPlatformService
      .analyticsRecent()
      .then((rows) => setEvents(rows.filter((r: any) => r.type === "scan_landing" || r.type === "scan_alert_sent")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan alerts"
        subtitle="System-wide view of public QR landings and scan alerts. Use this to spot abuse and unusual spikes."
      />
      {events.length === 0 ? (
        <EmptyState title="No scan events yet" message="Once people scan public tags, events will show up here." />
      ) : (
        <Card>
          <DataTable
            columns={["When", "Type", "Tag", "Reason", "Severity", "IP"]}
            rows={events.map((e) => [
              new Date(e.occurredAt ?? e.createdAt).toLocaleString(),
              e.type,
              e.tagId ?? "—",
              e.properties?.reason ?? "—",
              e.properties?.severity ?? "—",
              e.ipAddress || "—"
            ])}
          />
        </Card>
      )}
    </div>
  );
};
