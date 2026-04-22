export type Plan = {
  _id: string;
  slug: string;
  code: string;
  tier: "solo" | "family" | "business";
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  includes: string[];
  priceCents: number;
  compareAtCents: number;
  currency: string;
  billingCycle: "one_time" | "yearly";
  tagsIncluded: number;
  vehicleLimit: number;
  emergencyContactLimit: number;
  supportTier: "standard" | "priority" | "dedicated";
  status: "draft" | "active" | "archived";
  isFeatured?: boolean;
  isBestValue?: boolean;
  displayOrder: number;
};

export type OnboardingOrder = {
  _id: string;
  planId?: string;
  planSnapshot?: {
    planId?: string;
    code?: string;
    name?: string;
    priceCents?: number;
    currency?: string;
    tagsIncluded?: number;
    tier?: string;
  } | null;
  amount: number;
  currency: string;
  paymentStatus: "pending" | "success" | "failed" | "refunded";
  orderStatus: "created" | "paid" | "cancelled" | "fulfillment_in_progress" | "delivered";
  tagQuantity: number;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt: string;
};

export const formatCurrency = (cents: number, currency = "EUR") =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency }).format(cents / 100);
