import { z } from "zod";

const yearOptional = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : undefined;
  });

export const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(2, "Enter a valid registration")
    .max(20, "Registration is too long")
    .transform((v) => v.trim().toUpperCase()),
  make: z.string().max(40).optional().or(z.literal("")),
  model: z.string().max(40).optional().or(z.literal("")),
  color: z.string().max(24).optional().or(z.literal("")),
  year: yearOptional,
  nickname: z.string().max(32).optional().or(z.literal("")),
  displayMessage: z.string().max(160).optional().or(z.literal(""))
});

export type VehicleValues = z.infer<typeof vehicleSchema>;
