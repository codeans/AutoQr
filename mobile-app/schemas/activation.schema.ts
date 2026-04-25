import { z } from "zod";

export const activationSchema = z.object({
  activationCode: z
    .string()
    .min(4, "Enter your activation code")
    .transform((v) => v.trim().toUpperCase()),
  carId: z.string().optional()
});

export type ActivationValues = z.infer<typeof activationSchema>;
