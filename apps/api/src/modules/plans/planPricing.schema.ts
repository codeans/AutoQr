import { z } from "zod";

export const planPricingPatchSchema = z
  .object({
    priceCents: z.number().int().min(50).max(10_000_000),
    compareAtCents: z.number().int().min(0).max(10_000_000).optional().default(0),
    currency: z.literal("EUR").default("EUR")
  })
  .superRefine((data, ctx) => {
    if (data.compareAtCents > 0 && data.compareAtCents < data.priceCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "compareAtCents must be greater than or equal to priceCents when set above zero"
      });
    }
  });

export type PlanPricingPatch = z.infer<typeof planPricingPatchSchema>;
