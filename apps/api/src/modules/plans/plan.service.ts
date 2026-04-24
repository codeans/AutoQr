import { PlanModel } from "../../models/Plan.js";
import { ApiError } from "../../utils/apiError.js";

export const listActivePlans = async () => {
  return PlanModel.find({ status: "active" }).sort({ displayOrder: 1, priceCents: 1 }).lean();
};

export const getPlanBySlug = async (slug: string) => {
  const plan = await PlanModel.findOne({ slug, status: "active" }).lean();
  if (!plan) throw new ApiError(404, "Plan not found");
  return plan;
};

export const getPlanById = async (id: string) => {
  const plan = await PlanModel.findById(id);
  if (!plan) throw new ApiError(404, "Plan not found");
  return plan;
};

export const adminListPlans = async () => {
  return PlanModel.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
};

export const adminUpsertPlan = async (payload: any) => {
  const { _id, ...rest } = payload;
  if (_id) {
    const updated = await PlanModel.findByIdAndUpdate(_id, rest, { new: true });
    if (!updated) throw new ApiError(404, "Plan not found");
    return updated;
  }
  return PlanModel.create(rest);
};

export const adminArchivePlan = async (id: string) => {
  const updated = await PlanModel.findByIdAndUpdate(id, { status: "archived" }, { new: true });
  if (!updated) throw new ApiError(404, "Plan not found");
  return updated;
};

export const ensureSeedPlans = async () => {
  const count = await PlanModel.countDocuments();
  if (count > 0) return;
  await PlanModel.insertMany([
    {
      slug: "solo",
      code: "AQR-SOLO",
      tier: "solo",
      name: "Solo",
      tagline: "One tag for one car — all the privacy basics",
      description:
        "Perfect for a single car. One premium QR tag linked to your private AutoQR account — anyone who scans it can reach you, without ever seeing your number.",
      highlights: [
        "1 premium weather-proof QR tag",
        "Masked calling relay",
        "Reason-based car alerts",
        "Up to 3 emergency contacts",
        "Lifetime reassignment between cars"
      ],
      includes: ["1 QR tag", "Activation guide", "Standard email support"],
      priceCents: 1499,
      compareAtCents: 1999,
      tagsIncluded: 1,
      carLimit: 1,
      emergencyContactLimit: 3,
      supportTier: "standard",
      displayOrder: 1,
      status: "active",
      isFeatured: false
    },
    {
      slug: "family",
      code: "AQR-FAMILY",
      tier: "family",
      name: "Family",
      tagline: "Three tags, one household — the most popular plan",
      description:
        "Built for households with multiple cars. Link each tag to a different car, share one set of emergency contacts, and manage everything from one account.",
      highlights: [
        "3 premium weather-proof QR tags",
        "Up to 3 cars under one account",
        "Up to 6 emergency contacts",
        "Priority notification routing",
        "Emergency auto-escalation"
      ],
      includes: ["3 QR tags", "Activation guide", "Priority email support"],
      priceCents: 3499,
      compareAtCents: 4499,
      tagsIncluded: 3,
      carLimit: 3,
      emergencyContactLimit: 6,
      supportTier: "priority",
      displayOrder: 2,
      status: "active",
      isFeatured: true,
      isBestValue: true
    },
    {
      slug: "business",
      code: "AQR-BUSINESS",
      tier: "business",
      name: "Business",
      tagline: "Ten tags + fleet dashboard for small car fleets",
      description:
        "For small car fleets, rental operators and mobility companies that only operate cars. Centralised activation, dedicated onboarding, and a fleet-level car dashboard.",
      highlights: [
        "10 premium weather-proof QR tags",
        "Fleet dashboard & bulk activation",
        "Unlimited emergency contacts",
        "Dedicated account manager",
        "24/7 priority support"
      ],
      includes: ["10 QR tags", "Fleet onboarding kit", "Dedicated support channel"],
      priceCents: 9900,
      compareAtCents: 12000,
      tagsIncluded: 10,
      carLimit: 10,
      emergencyContactLimit: 20,
      supportTier: "dedicated",
      displayOrder: 3,
      status: "active",
      isFeatured: false
    }
  ]);
};
