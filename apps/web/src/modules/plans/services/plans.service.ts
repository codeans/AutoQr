import { api } from "../../../lib/api";
import type { OnboardingOrder, Plan } from "../types";

export const fetchPlans = async (): Promise<Plan[]> => {
  const { data } = await api.get("/plans");
  return data.plans;
};

export const fetchPlan = async (slug: string): Promise<Plan> => {
  const { data } = await api.get(`/plans/${slug}`);
  return data.plan;
};

export const publicCheckout = async (payload: {
  planId: string;
  fullName: string;
  phone: string;
  email: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  note?: string;
}): Promise<{ url?: string }> => {
  const { data } = await api.post(`/payments/public-checkout`, payload);
  return data as { url?: string };
};

export const startPlan = async (payload: {
  planId: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}): Promise<OnboardingOrder> => {
  const { data } = await api.post("/onboarding/start", payload);
  return data.order;
};

export const payPlan = async (
  orderId: string
): Promise<{ url?: string; id?: string; alreadyPaid?: boolean; manualReview?: boolean }> => {
  const { data } = await api.post("/onboarding/pay", { orderId });
  return data;
};

export const fetchOnboardingOrder = async (id: string): Promise<OnboardingOrder> => {
  const { data } = await api.get(`/onboarding/orders/${id}`);
  return data.order;
};

export const listOnboardingOrders = async (): Promise<OnboardingOrder[]> => {
  const { data } = await api.get("/onboarding/orders");
  return data.orders;
};
