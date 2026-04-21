export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

export interface AdminUser {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface AdminVehicle {
  _id: string;
  registrationNumber?: string;
  type?: string;
  status?: string;
  frontImage?: string;
  userId?: AdminUser;
}

export interface AdminOrder {
  _id: string;
  amount: number;
  currency: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt: string;
  userId?: AdminUser;
  vehicleOrItemId?: AdminVehicle;
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
  vehicleOrItemId?: AdminVehicle;
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
  vehicleOrItemId?: AdminVehicle;
}

export interface AdminCall {
  _id: string;
  createdAt: string;
  status?: string;
  duration?: number;
  rejectionReason?: string;
  ownerUserId?: AdminUser;
  incidentId?: { _id?: string };
}

export interface AdminContentItem {
  _id: string;
  slug: string;
  title: string;
  published?: boolean;
  updatedAt: string;
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
    qrs?: number;
    activeItems?: number;
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
