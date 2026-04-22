import { BellRing, CarFront, CreditCard, PhoneCall, ShieldCheck, TriangleAlert } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { IncidentCard } from "../components/IncidentCard";
import { LoadingState } from "../components/LoadingState";
import { NotificationList } from "../components/NotificationList";
import { OrderCard } from "../components/OrderCard";
import { SectionCard } from "../components/SectionCard";
import { SummaryCard } from "../components/SummaryCard";
import { Timeline } from "../components/Timeline";
import { useUserDashboard } from "../hooks/useUserDashboard";
import { useUserNotifications } from "../hooks/useUserNotifications";

export const DashboardScreen = () => {
  const { data, isLoading } = useUserDashboard();
  const { data: notificationsData } = useUserNotifications();

  if (isLoading) return <LoadingState rows={7} />;

  const summary = data?.summary;
  const firstOrder = data?.orders?.[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
        <p className="text-sm text-slate-300">Welcome back to AutoQR</p>
        <h2 className="mt-1 text-2xl font-bold">Your car owner workspace is live and protected.</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Manage your cars, respond to scan alerts, and track car QR tag orders and shipments from one premium control panel for car owners.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard title="Registered cars" value={summary?.carCount ?? 0} icon={CarFront} />
        <SummaryCard title="Active car tags" value={summary?.activeTagCount ?? 0} icon={ShieldCheck} />
        <SummaryCard title="Recent car incidents" value={summary?.incidents ?? 0} icon={TriangleAlert} />
        <SummaryCard title="Recent calls" value={summary?.calls ?? 0} icon={PhoneCall} />
        <SummaryCard title="Paid orders" value={summary?.paidOrders ?? 0} icon={CreditCard} />
        <SummaryCard title="Account status" value={summary?.accountStatus ?? "active"} icon={BellRing} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent car incidents" subtitle="Latest reports submitted by people who scanned your car tag.">
          <div className="space-y-3">
            {data?.incidents?.length ? data.incidents.slice(0, 3).map((incident) => <IncidentCard key={incident._id} incident={incident} />) : <EmptyState title="No car incidents yet" message="New incident reports from scans will appear here." />}
          </div>
        </SectionCard>
        <SectionCard title="Order & shipment status" subtitle="Your car QR tag order progress and delivery timeline.">
          {firstOrder ? (
            <div className="space-y-4">
              <OrderCard order={firstOrder} />
              <Timeline
                items={[
                  { title: "order_created", status: "created", time: firstOrder.createdAt },
                  { title: firstOrder.paymentStatus, status: firstOrder.paymentStatus },
                  { title: firstOrder.orderStatus, status: firstOrder.orderStatus }
                ]}
              />
            </div>
          ) : (
            <EmptyState title="No order found" message="Your first car QR tag order will appear here after checkout." />
          )}
        </SectionCard>
      </div>

      <SectionCard title="Notification preview" subtitle="Recent scan alerts, call requests, and order updates for your cars.">
        {notificationsData?.notifications?.length ? (
          <NotificationList notifications={notificationsData.notifications.slice(0, 4)} />
        ) : (
          <EmptyState title="No notifications yet" message="Real-time updates will show up here." />
        )}
      </SectionCard>
    </div>
  );
};
