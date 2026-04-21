import path from "node:path";
import { env } from "../config/env.js";

const uploadPrefix = "/uploads/";

export const toPublicUploadPath = (absoluteFilePath: string) => {
  const relative = path.relative(env.UPLOAD_DIR_ABSOLUTE, absoluteFilePath).replace(/\\/g, "/");
  return `${uploadPrefix}${relative}`;
};

export const resolveStoredUploadPath = (storedPath: string) => {
  if (path.isAbsolute(storedPath) && !storedPath.startsWith(uploadPrefix)) {
    return storedPath;
  }
  const normalized = storedPath.startsWith(uploadPrefix) ? storedPath.slice(uploadPrefix.length) : storedPath.replace(/^\/+/, "");
  return path.resolve(env.UPLOAD_DIR_ABSOLUTE, normalized);
};
