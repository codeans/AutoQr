import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const comparePassword = (plain: string, hashed: string) => bcrypt.compare(plain, hashed);
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = (bytes = 24) => randomBytes(bytes).toString("hex");
