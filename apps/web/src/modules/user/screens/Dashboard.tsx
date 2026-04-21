import { BellRing, CarFront, CreditCard, PhoneCall, ShieldCheck, TriangleAlert } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { OwnerIncomingCallWidget } from "../../../features/calls/OwnerIncomingCallWidget";
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
  const { token } = useAuth();
  const { data, isLoading } = useUserDashboard();
  const { data: notificationsData } = useUserNotifications();

  if (isLoading) return <LoadingState rows={7} />;

  const summary = data?.summary;
  const firstOrder = data?.orders?.[0];

  return (
    <div className="space-y-6">
      <OwnerIncomingCallWidget token={token} />

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
        <p className="text-sm text-slate-300">Welcome back to AutoQr</p>
        <h2 className="mt-1 text-2xl font-bold">Your ownership workspace is live and protected.</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Monitor your registered item, resolve incidents quickly, and track order and shipment progress from one premium control panel.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard title="Registered Items" value={summary?.vehicleCount ?? 0} icon={CarFront} />
        <SummaryCard title="Active QR" value={summary?.activeQrCount ?? 0} icon={ShieldCheck} />
        <SummaryCard title="Recent Incidents" value={summary?.incidents ?? 0} icon={TriangleAlert} />
        <SummaryCard title="Recent Calls" value={summary?.calls ?? 0} icon={PhoneCall} />
        <SummaryCard title="Paid Orders" value={summary?.paidOrders ?? 0} icon={CreditCard} />
        <SummaryCard title="Account Status" value={summary?.accountStatus ?? "active"} icon={BellRing} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent incidents" subtitle="Latest reports linked to your registered vehicle/item.">
          <div className="space-y-3">
            {data?.incidents?.length ? data.incidents.slice(0, 3).map((incident) => <IncidentCard key={incident._id} incident={incident} />) : <EmptyState title="No incidents yet" message="New incident reports will appear here." />}
          </div>
        </SectionCard>
        <SectionCard title="Order & shipment status" subtitle="One-time purchase progress and QR lifecycle timeline.">
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
            <EmptyState title="No order found" message="Your first AutoQr order will appear after vehicle registration." />
          )}
        </SectionCard>
      </div>

      <SectionCard title="Notification preview" subtitle="Recent alerts for incidents, calls, shipment, and payment updates.">
        {notificationsData?.notifications?.length ? (
          <NotificationList notifications={notificationsData.notifications.slice(0, 4)} />
        ) : (
          <EmptyState title="No notifications yet" message="Real-time updates will show up here." />
        )}
      </SectionCard>
    </div>
  );
};
