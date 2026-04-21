import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(7),
  address: z.string().min(5)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
