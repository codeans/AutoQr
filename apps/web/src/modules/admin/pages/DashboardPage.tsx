import { Button, SecondaryButton, Timeline } from "../../../components/ui";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatsCard } from "../components/StatsCard";
import { useAdminStats } from "../hooks/useAdminStats";

export const DashboardPage = () => {
  const { data, isLoading } = useAdminStats();
  if (isLoading) return <LoadingState rows={8} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Car Admin Command Center"
        subtitle="Operational heartbeat across car owners, registered cars, car tag logistics, incidents, revenue, and fulfillment."
        actions={
          <>
            <Button className="bg-slate-900 hover:bg-slate-800">Export Report</Button>
            <SecondaryButton>Quick Actions</SecondaryButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total car owners" value={data?.totals?.users ?? 0} hint="Platform accounts" />
        <StatsCard title="Paid orders" value={data?.totals?.paidOrders ?? 0} hint="Successfully paid" />
        <StatsCard title="Activated car tags" value={data?.totals?.activatedTags ?? 0} hint="Tags linked to cars" />
        <StatsCard title="Active cars" value={data?.totals?.activeCars ?? 0} hint="Cars currently protected" />
        <StatsCard title="Car incidents" value={data?.totals?.incidents ?? 0} hint="Total cases reported" />
        <StatsCard title="Contact calls" value={data?.totals?.calls ?? 0} hint="Masked calls logged" />
        <StatsCard title="Revenue" value={`${data?.totals?.revenue ?? 0} EUR`} hint="Verified income" />
        <StatsCard title="Pending shipments" value={data?.totals?.pendingShipments ?? 0} hint="Car tags awaiting dispatch" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Recent activity" subtitle="Action stream from audit and operational flows." className="xl:col-span-2">
          {data?.recentActivity?.length ? (
            <Timeline
              items={data.recentActivity.slice(0, 8).map((activity) => ({
                title: activity.action,
                description: `${activity.targetType} #${activity.targetId}`,
                time: new Date(activity.createdAt || Date.now()).toLocaleString()
              }))}
            />
          ) : (
            <EmptyState title="No activity yet" message="Admin operations will appear here once events are created." />
          )}
        </SectionCard>
        <SectionCard title="Alerts" subtitle="Priority snapshots requiring review.">
          <div className="space-y-2 text-sm">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
              Pending shipments: <strong>{data?.totals?.pendingShipments ?? 0}</strong>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
              Car incident load: <strong>{data?.totals?.incidents ?? 0}</strong>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-800">
              Contact calls tracked: <strong>{data?.totals?.calls ?? 0}</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
