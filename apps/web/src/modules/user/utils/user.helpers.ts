import { formatMoney } from "../../../utils/intlCurrency";
import { UserBadgeTone } from "../types/user.types";

export const prettifyStatus = (value?: string) => (value ?? "unknown").replace(/_/g, " ");

export const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export const formatCurrency = (amount?: number, currency = "EUR", i18nLanguage?: string) => {
  if (typeof amount !== "number") return "-";
  return formatMoney(amount, currency, i18nLanguage);
};

export const statusTone = (status?: string): UserBadgeTone => {
  const normalized = (status ?? "").toLowerCase();
  if (["success", "paid", "delivered", "activated", "resolved", "completed", "connected", "ended", "active"].includes(normalized)) {
    return "success";
  }
  if (["missed", "pending", "created", "open", "printing", "packed", "dispatched", "ungenerated"].includes(normalized)) {
    return "warning";
  }
  if (["failed", "declined", "rejected", "cancelled", "inactive"].includes(normalized)) {
    return "danger";
  }
  if (["generated", "processing", "info"].includes(normalized)) {
    return "info";
  }
  return "neutral";
};

export const sortByDateDesc = <T extends { createdAt?: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
