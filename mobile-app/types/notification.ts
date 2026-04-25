export const NotificationTypes = {
  IncidentCreated: "INCIDENT_CREATED",
  IncomingCall: "INCOMING_CALL",
  MissedCall: "MISSED_CALL",
  CallEnded: "CALL_ENDED",
  QRActivated: "QR_ACTIVATED",
  QRDispatched: "QR_DISPATCHED",
  AccountUpdated: "ACCOUNT_UPDATED"
} as const;

export type NotificationType =
  | (typeof NotificationTypes)[keyof typeof NotificationTypes]
  // Legacy backend values
  | "incident_created"
  | "call_missed"
  | "call_ended";

export const NotificationEvents = {
  NEW: "notification:new",
  NEW_LEGACY: "notification_new",
  INCIDENT_CREATED: "incident:created",
  INCIDENT_CREATED_LEGACY: "incident_created"
} as const;

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  relatedEntityId?: string;
  createdAt: string;
  readAt?: string | null;
};
