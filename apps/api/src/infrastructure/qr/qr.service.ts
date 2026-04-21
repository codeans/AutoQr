import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { randomToken } from "../../utils/crypto.js";
import { env } from "../../config/env.js";
import { toPublicUploadPath } from "../../utils/uploads.js";

const qrDir = path.resolve(env.UPLOAD_DIR_ABSOLUTE, "qr");
if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

export const generateQrAsset = async () => {
  const qrUrlToken = randomToken(18);
  const internalCode = `AQR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const incidentUrl = `${env.PUBLIC_BASE_URL}/incident/${qrUrlToken}`;
  const absolutePath = path.join(qrDir, `${internalCode}.png`);
  await QRCode.toFile(absolutePath, incidentUrl, { width: 512, margin: 2 });
  return { qrUrlToken, internalCode, qrImage: toPublicUploadPath(absolutePath) };
};
