export type UserBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export type UserStatus = "open" | "resolved" | "pending" | "active" | "inactive" | "completed" | "missed" | "rejected" | string;

export type UserSummary = {
  carCount: number;
  activeTagCount: number;
  incidents: number;
  calls: number;
  paidOrders: number;
  accountStatus: string;
};

export type UserCar = {
  _id: string;
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  nickname?: string;
  plateImage?: string;
  displayMessage?: string;
  activationStatus?: string;
  isPrimary?: boolean;
  activeTagId?: string;
  createdAt?: string;
};

export type UserIncident = {
  _id: string;
  reporterPhoneMasked?: string;
  message: string;
  images?: string[];
  status: string;
  carId?: string;
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
  preferredLanguage?: "de" | "en";
  notificationPreferences?: {
    incidents?: boolean;
    calls?: boolean;
    orders?: boolean;
  };
};
