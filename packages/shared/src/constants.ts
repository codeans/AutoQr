export const UserRole = {
  ADMIN: "admin",
  OWNER: "owner",
  SUPPORT: "support"
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

export const TagBatchStatus = {
  DRAFT: "draft",
  GENERATED: "generated",
  PRINTED: "printed",
  READY_TO_SHIP: "ready_to_ship",
  SHIPPED: "shipped",
  ARCHIVED: "archived"
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
  DECLINED: "declined",
  REJECTED: "rejected"
} as const;

export const NotificationType = {
  INCIDENT_CREATED: "incident_created",
  CALL_REQUESTED: "call_requested",
  ORDER_STATUS_UPDATED: "order_status_updated",
  SHIPMENT_UPDATED: "shipment_updated",
  SCAN_ALERT: "scan_alert",
  EMERGENCY_ALERT: "emergency_alert",
  ACTIVATION_SUCCESS: "activation_success",
  SYSTEM: "system"
} as const;

export const NotificationChannel = {
  IN_APP: "in_app",
  EMAIL: "email",
  SMS: "sms",
  WHATSAPP: "whatsapp",
  PUSH: "push"
} as const;

export const NotificationDeliveryStatus = {
  QUEUED: "queued",
  SENT: "sent",
  DELIVERED: "delivered",
  FAILED: "failed",
  SKIPPED: "skipped"
} as const;

export const ScanReason = {
  WRONG_PARKING: "wrong_parking",
  HEADLIGHTS_ON: "headlights_on",
  FLAT_TYRE: "flat_tyre",
  TOWING: "towing",
  DOOR_OR_WINDOW_OPEN: "door_or_window_open",
  CAR_DAMAGED: "car_damaged",
  ACCIDENT: "accident",
  OTHER: "other"
} as const;

export const ScanReasonLabels: Record<string, string> = {
  [ScanReason.WRONG_PARKING]: "Wrongly parked car",
  [ScanReason.HEADLIGHTS_ON]: "Headlights left on",
  [ScanReason.FLAT_TYRE]: "Flat tyre",
  [ScanReason.TOWING]: "Car being towed",
  [ScanReason.DOOR_OR_WINDOW_OPEN]: "Car door or window left open",
  [ScanReason.CAR_DAMAGED]: "Car damaged",
  [ScanReason.ACCIDENT]: "Accident / emergency",
  [ScanReason.OTHER]: "Other"
};

export const ScanSeverity = {
  INFO: "info",
  URGENT: "urgent",
  EMERGENCY: "emergency"
} as const;

export const ScanReasonSeverity: Record<string, "info" | "urgent" | "emergency"> = {
  [ScanReason.WRONG_PARKING]: "info",
  [ScanReason.HEADLIGHTS_ON]: "urgent",
  [ScanReason.FLAT_TYRE]: "urgent",
  [ScanReason.TOWING]: "urgent",
  [ScanReason.DOOR_OR_WINDOW_OPEN]: "urgent",
  [ScanReason.CAR_DAMAGED]: "urgent",
  [ScanReason.ACCIDENT]: "emergency",
  [ScanReason.OTHER]: "info"
};

export const PlanStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived"
} as const;

export const PlanTier = {
  SOLO: "solo",
  FAMILY: "family",
  BUSINESS: "business"
} as const;

export const OnboardingStep = {
  PLAN: "plan",
  ACCOUNT: "account",
  ADDRESS: "address",
  PAYMENT: "payment",
  DONE: "done"
} as const;

export const ActivationStatus = {
  PENDING: "pending",
  ACTIVATED: "activated",
  DEACTIVATED: "deactivated"
} as const;

export const ConsentType = {
  TERMS: "terms",
  PRIVACY: "privacy",
  MARKETING: "marketing",
  DATA_SHARING: "data_sharing"
} as const;

export const AnalyticsEventType = {
  PAGE_VIEW: "page_view",
  SIGNUP: "signup",
  LOGIN: "login",
  OTP_REQUESTED: "otp_requested",
  OTP_VERIFIED: "otp_verified",
  ORDER_CREATED: "order_created",
  ORDER_PAID: "order_paid",
  TAG_ACTIVATED: "tag_activated",
  SCAN_LANDING: "scan_landing",
  SCAN_ALERT_SENT: "scan_alert_sent",
  OWNER_REACHED: "owner_reached"
} as const;

export const AuditAction = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  OTP_REQUEST: "otp_request",
  OTP_VERIFY: "otp_verify",
  STATUS_CHANGE: "status_change",
  EXPORT: "export"
} as const;
