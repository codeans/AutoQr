import { Bell, BellRing } from "lucide-react";
import { UserNotification } from "../types/user.types";
import { formatDateTime } from "../utils/user.helpers";

export const NotificationList = ({
  notifications,
  onCallback
}: {
  notifications: UserNotification[];
  onCallback?: (incidentId: string) => void;
}) => (
  <div className="space-y-3">
    {notifications.map((notification) => (
      <article
        key={notification._id}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {notification.isRead ? <Bell className="h-4 w-4 text-slate-400" /> : <BellRing className="h-4 w-4 text-action" />}
            <h4 className="text-sm font-semibold text-slate-900">{notification.title}</h4>
          </div>
          <p className="text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
        </div>
        <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
        {onCallback && notification.relatedEntityId ? (
          <button
            type="button"
            className="mt-3 inline-flex rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => onCallback(notification.relatedEntityId as string)}
          >
            Contact Reporter
          </button>
        ) : null}
      </article>
    ))}
  </div>
);
