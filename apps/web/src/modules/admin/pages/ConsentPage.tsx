import { useEffect, useState } from "react";
import { Card, DataTable, EmptyState, LoadingState, PageHeader, StatusBadge } from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

export const ConsentPage = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminPlatformService
      .listConsent()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent & legal records"
        subtitle="Versioned privacy and terms acceptance events. Use this for audit and right-to-erasure requests."
      />
      {records.length === 0 ? (
        <EmptyState title="No consent events" message="Acceptance events will appear here once users interact." />
      ) : (
        <Card>
          <DataTable
            columns={["When", "Type", "Version", "User", "IP", "Accepted"]}
            rows={records.map((r) => [
              new Date(r.acceptedAt ?? r.createdAt).toLocaleString(),
              r.type,
              r.version,
              r.userId ?? "anon",
              r.ipAddress || "—",
              <StatusBadge key="a" label={r.accepted ? "yes" : "no"} tone={r.accepted ? "success" : "danger"} />
            ])}
          />
        </Card>
      )}
    </div>
  );
};
