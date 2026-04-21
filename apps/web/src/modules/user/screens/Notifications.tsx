import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { NotificationList } from "../components/NotificationList";
import { SectionCard } from "../components/SectionCard";
import { useUserNotifications } from "../hooks/useUserNotifications";

export const NotificationsScreen = () => {
  const { data, isLoading } = useUserNotifications();

  if (isLoading) return <LoadingState rows={8} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Notifications" subtitle="Incident alerts, call requests, payment updates, and shipment updates in one feed.">
        {data?.notifications?.length ? (
          <NotificationList notifications={data.notifications} />
        ) : (
          <EmptyState title="No notifications yet" message="Incoming updates will appear as your AutoQr lifecycle progresses." />
        )}
      </SectionCard>
    </div>
  );
};
