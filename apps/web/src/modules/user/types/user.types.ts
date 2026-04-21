export type UserBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export type UserStatus = "open" | "resolved" | "pending" | "active" | "inactive" | "completed" | "missed" | "rejected" | string;

export type UserSummary = {
  vehicleCount: number;
  activeQrCount: number;
  incidents: number;
  calls: number;
  paidOrders: number;
  accountStatus: string;
};

export type UserVehicle = {
  _id: string;
  type: string;
  registrationNumber: string;
  details?: string;
  frontImage?: string;
  status: string;
  qrStatus: string;
  shipmentMeta?: {
    carrier?: string;
    trackingNumber?: string;
    eta?: string;
  } | null;
  order?: UserOrder | null;
  trackingTimeline?: Array<{ status: string; reached: boolean }>;
  createdAt?: string;
};

export type UserIncident = {
  _id: string;
  reporterName?: string;
  reporterPhone: string;
  message: string;
  images?: string[];
  status: string;
  vehicleOrItemId?: string;
  createdAt: string;
};

export type UserCall = {
  _id: string;
  incidentId?: string;
  status: string;
  duration?: number;
  rejectionReason?: string;
  createdAt: string;
};

export type UserOrder = {
  _id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  invoiceNumber?: string;
  createdAt: string;
  payment?: {
    status?: string;
    transactionId?: string;
  } | null;
};

export type UserNotification = {
  _id: string;
  title: string;
  message: string;
  isRead?: boolean;
  type?: string;
  createdAt: string;
};

export type UserProfile = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notificationPreferences?: {
    incidents?: boolean;
    calls?: boolean;
    orders?: boolean;
  };
};
