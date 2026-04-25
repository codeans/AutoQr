export type UserRole = "owner" | "admin" | "support";
export type UserStatus = "active" | "inactive" | "flagged";

export type NotificationPreferences = {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
  push?: boolean;
  inApp?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneVerifiedAt?: string | null;
  address?: string | null;
  role: UserRole;
  status: UserStatus;
  notificationPreferences?: NotificationPreferences;
  preferredLanguage?: "de" | "en";
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ActivationStatus = "pending" | "activated" | "deactivated";

export type Car = {
  id: string;
  userId: string;
  registrationNumber: string;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  year?: number | null;
  nickname?: string | null;
  plateImage?: string | null;
  activeTagId?: string | null;
  displayMessage?: string | null;
  isPrimary?: boolean;
  activationStatus: ActivationStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type TagStatus =
  | "in_stock"
  | "assigned_to_order"
  | "shipped"
  | "delivered"
  | "activated"
  | "disabled"
  | "lost";

export type Tag = {
  id: string;
  serial: string;
  publicToken: string;
  activationCode?: string;
  qrImage?: string | null;
  status: TagStatus;
  ownerUserId?: string | null;
  carId?: string | null;
  activatedAt?: string | null;
  lastScanAt?: string | null;
  scanCount?: number;
};

export type IncidentStatus = "open" | "in_review" | "resolved" | "escalated";

export type Incident = {
  id: string;
  qrCodeId?: string;
  tagId?: string;
  carId?: string;
  userId?: string;
  reporterName?: string | null;
  reporterPhone?: string | null;
  message?: string | null;
  images?: string[];
  status: IncidentStatus;
  adminNotes?: string | null;
  escalationFlag?: boolean;
  callPlatform?: "web" | "android" | "ios";
  consentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  car?: Car;
};

export type CallStatus =
  | "ringing"
  | "accepted"
  | "connected"
  | "ended"
  | "missed"
  | "declined"
  | "rejected"
  | "failed"
  | "cancelled";

export type CallSession = {
  id: string;
  incidentId: string;
  ownerUserId?: string;
  reporterPhone?: string | null;
  ownerPlatform?: "web" | "android" | "ios";
  reporterPlatform?: "web" | "android" | "ios";
  status: CallStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  duration?: number | null;
  endReason?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
};

export type CallbackStatus = "pending" | "calling" | "connected" | "declined" | "missed" | "completed" | "failed";

export type CallbackSession = {
  _id: string;
  incidentId?: string | { _id?: string };
  vehicleId?: string | { _id?: string; registrationNumber?: string };
  ownerId?: string;
  reporterPhoneMasked?: string;
  callbackStatus: CallbackStatus;
  callbackStartedAt?: string;
  callbackEndedAt?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  readStatus?: boolean;
  relatedEntityId?: string | null;
  createdAt?: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relationship?: string | null;
  phone: string;
  email?: string | null;
  priority?: number;
  notifyOnEmergencyOnly?: boolean;
};

export type ScanEvent = {
  id: string;
  publicToken: string;
  reason: string;
  severity: "info" | "urgent" | "emergency";
  message?: string | null;
  reporterPhone?: string | null;
  reporterName?: string | null;
  status: "landed" | "alert_sent" | "owner_reached" | "acknowledged" | "closed";
  location?: { latitude?: number; longitude?: number; address?: string };
  createdAt?: string;
};

export type CMSSection = {
  heading?: string;
  body?: string;
  order?: number;
};

export type CMSContent = {
  slug: string;
  title: string;
  sections: CMSSection[];
  updatedAt?: string;
};
