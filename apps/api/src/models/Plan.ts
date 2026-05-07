import mongoose, { Schema } from "mongoose";

const planSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    tier: {
      type: String,
      enum: ["car_basic", "smart_key", "premium_combo", "fleet_pro"],
      default: "car_basic",
      index: true
    },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    highlights: [{ type: String }],
    includes: [{ type: String }],
    nameDe: { type: String, default: "" },
    taglineDe: { type: String, default: "" },
    descriptionDe: { type: String, default: "" },
    highlightsDe: [{ type: String }],
    priceCents: { type: Number, required: true },
    compareAtCents: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    billingCycle: { type: String, enum: ["one_time", "yearly"], default: "one_time" },
    tagsIncluded: { type: Number, default: 1 },
    carLimit: { type: Number, default: 1 },
    emergencyContactLimit: { type: Number, default: 3 },
    supportTier: { type: String, enum: ["standard", "priority", "dedicated"], default: "standard" },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["draft", "active", "archived"], default: "active", index: true },
    isFeatured: { type: Boolean, default: false },
    isBestValue: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const PlanModel = mongoose.model("Plan", planSchema);
