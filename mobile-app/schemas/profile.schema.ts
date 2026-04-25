import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().min(6, "Enter a valid phone number").optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal(""))
});

export type ProfileValues = z.infer<typeof profileSchema>;
