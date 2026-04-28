export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

export interface AdminUser {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface AdminCar {
  _id: string;
  registrationNumber?: string;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  nickname?: string;
  plateImage?: string;
  activationStatus?: string;
  isPrimary?: boolean;
  userId?: AdminUser;
  createdAt?: string;
}

export interface AdminOrder {
  _id: string;
  amount: number;
  currency: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt: string;
  userId?: AdminUser;
  carId?: AdminCar;
}

export interface AdminPayment {
  _id: string;
  transactionId?: string;
  amount: number;
  status?: string;
  provider?: string;
  createdAt: string;
  userId?: AdminUser;
}

export interface AdminQr {
  _id: string;
  internalCode?: string;
  status?: string;
  userId?: AdminUser;
  carId?: AdminCar;
  shipmentMeta?: {
    courier?: string;
    trackingNumber?: string;
    notes?: string;
  };
}

export interface AdminIncident {
  _id: string;
  createdAt: string;
  reporterName?: string;
  reporterPhone?: string;
  message?: string;
  status?: string;
  images?: string[];
  ownerUserId?: AdminUser;
  carId?: AdminCar;
}

export interface AdminCall {
  _id: string;
  createdAt: string;
  status?: string;
  duration?: number;
  agoraChannelName?: string;
  agoraUidCaller?: number;
  agoraUidReceiver?: number;
  agoraJoinedAt?: string;
  agoraDisconnectedAt?: string;
  rejectionReason?: string;
  ownerUserId?: AdminUser;
  incidentId?: { _id?: string; carId?: AdminCar };
}

export interface AdminCallback {
  _id: string;
  createdAt: string;
  callbackStatus?: string;
  duration?: number;
  reporterPhoneMasked?: string;
  ownerId?: AdminUser;
  incidentId?: { _id?: string };
  vehicleId?: { registrationNumber?: string };
}

export interface AdminContentItem {
  _id: string;
  slug: string;
  title: string;
  title_de?: string;
  title_en?: string;
  published?: boolean;
  updatedAt: string;
  sections?: unknown[];
  sections_de?: unknown[];
  sections_en?: unknown[];
  body?: {
    de?: string;
    en?: string;
  };
}

export interface AdminSetting {
  _id: string;
  key: string;
  value: string | number | boolean;
  updatedAt: string;
}

export interface AdminAuditLog {
  _id: string;
  createdAt: string;
  adminId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export interface AdminDashboardData {
  totals?: {
    users?: number;
    paidOrders?: number;
    activeCars?: number;
    activatedTags?: number;
    incidents?: number;
    calls?: number;
    revenue?: number;
    pendingShipments?: number;
  };
  recentActivity?: Array<{
    _id: string;
    action: string;
    targetType: string;
    targetId: string;
    createdAt?: string;
  }>;
}
