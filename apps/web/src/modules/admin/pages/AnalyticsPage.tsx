import { useEffect, useState } from "react";
import {
  Card,
  DataTable,
  EmptyState,
  LoadingState,
  PageHeader,
  StatCard
} from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminPlatformService.analyticsSummary(), adminPlatformService.analyticsRecent()])
      .then(([s, e]) => {
        setSummary(s);
        setEvents(e);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState rows={6} />;

  const counts = summary?.counts ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform analytics"
        subtitle={`Rolling ${summary?.windowDays ?? 30}-day metrics across the funnel. Owner reach rate is scan → owner-reached.`}
      />
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard title="Scan landings" value={counts.scan_landing ?? 0} />
        <StatCard title="Scan alerts sent" value={counts.scan_alert_sent ?? 0} />
        <StatCard title="OTP verifications" value={counts.otp_verified ?? 0} />
        <StatCard title="Owner reach rate" value={`${summary?.ownerReachRatePercent ?? 0}%`} />
        <StatCard title="Orders paid" value={counts.order_paid ?? 0} />
        <StatCard title="Tag activations" value={counts.tag_activated ?? 0} />
        <StatCard title="Signups" value={counts.signup ?? 0} />
        <StatCard title="Logins" value={counts.login ?? 0} />
      </div>

      {events.length === 0 ? (
        <EmptyState title="No events yet" message="Once users interact with the app, analytics events will appear here." />
      ) : (
        <Card>
          <h3 className="text-base font-semibold text-slate-900">Recent events</h3>
          <DataTable
            className="mt-3"
            columns={["When", "Type", "User", "Entity", "Session"]}
            rows={events
              .slice(0, 100)
              .map((ev) => [
                new Date(ev.occurredAt ?? ev.createdAt).toLocaleString(),
                ev.type,
                ev.userId ?? "—",
                ev.entityId || ev.tagId || "—",
                ev.sessionId || "—"
              ])}
          />
        </Card>
      )}
    </div>
  );
};
