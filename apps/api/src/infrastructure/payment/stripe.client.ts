import Stripe from "stripe";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : null;

export const ensureStripe = () => {
  if (!stripe) {
    throw new ApiError(503, "Stripe is not configured");
  }
  return stripe;
};
