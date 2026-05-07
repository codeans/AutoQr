import { describe, expect, it } from "vitest";
import { planPricingPatchSchema } from "../src/modules/plans/planPricing.schema.js";

describe("planPricingPatchSchema", () => {
  it("accepts valid pricing with compare above price", () => {
    const r = planPricingPatchSchema.safeParse({ priceCents: 2499, compareAtCents: 2999, currency: "EUR" });
    expect(r.success).toBe(true);
  });

  it("accepts compare-at zero", () => {
    const r = planPricingPatchSchema.safeParse({ priceCents: 2499, compareAtCents: 0, currency: "EUR" });
    expect(r.success).toBe(true);
  });

  it("rejects compare below price when compare is positive", () => {
    const r = planPricingPatchSchema.safeParse({ priceCents: 3000, compareAtCents: 2000, currency: "EUR" });
    expect(r.success).toBe(false);
  });

  it("rejects price below minimum", () => {
    const r = planPricingPatchSchema.safeParse({ priceCents: 10, currency: "EUR" });
    expect(r.success).toBe(false);
  });
});
