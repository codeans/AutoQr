import { Tone } from "../types/admin.types";
import { assetBaseUrl } from "../../../lib/runtimeConfig";

export const statusTone = (status: string): Tone => {
  if (["active", "success", "paid", "delivered", "activated", "connected", "ended", "resolved"].includes(status)) return "success";
  if (["failed", "rejected", "disabled", "escalated"].includes(status)) return "danger";
  return "warning";
};

export const assetBase = assetBaseUrl;

export const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
