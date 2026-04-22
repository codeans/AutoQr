import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (folder: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const fullPath = path.resolve(env.UPLOAD_DIR_ABSOLUTE, folder);
      ensureDir(fullPath);
      cb(null, fullPath);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const safeName = `${Date.now()}-${randomUUID()}${extension}`;
      cb(null, safeName);
    }
  });

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
  const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
    cb(new ApiError(400, "Only image uploads are allowed"));
    return;
  }
  cb(null, true);
};

const limits = { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024 };

export const carImageUpload = multer({ storage: createStorage("cars"), fileFilter, limits });
export const incidentImageUpload = multer({ storage: createStorage("incidents"), fileFilter, limits });
