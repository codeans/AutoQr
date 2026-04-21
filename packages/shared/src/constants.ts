export const UserRole = {
  ADMIN: "admin",
  OWNER: "owner"
} as const;

export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  FLAGGED: "flagged"
} as const;

export const OrderStatus = {
  CREATED: "created",
  PAID: "paid",
  CANCELLED: "cancelled",
  FULFILLMENT_IN_PROGRESS: "fulfillment_in_progress",
  DELIVERED: "delivered"
} as const;

export const PaymentStatus = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded"
} as const;

export const QRCodeStatus = {
  UNGENERATED: "ungenerated",
  GENERATED: "generated",
  PRINTED: "printed",
  PACKED: "packed",
  DISPATCHED: "dispatched",
  DELIVERED: "delivered",
  ACTIVATED: "activated",
  DISABLED: "disabled"
} as const;

export const IncidentStatus = {
  OPEN: "open",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved",
  ESCALATED: "escalated"
} as const;

export const CallStatus = {
  RINGING: "ringing",
  CONNECTED: "connected",
  ENDED: "ended",
  MISSED: "missed",
  REJECTED: "rejected"
} as const;

export const NotificationType = {
  INCIDENT_CREATED: "incident_created",
  CALL_REQUESTED: "call_requested",
  ORDER_STATUS_UPDATED: "order_status_updated",
  SHIPMENT_UPDATED: "shipment_updated",
  SYSTEM: "system"
} as const;
