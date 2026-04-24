import { isLocale, type Locale } from "@autoqr/shared";
import { currentLocale } from "./index";

const NON_LOCALIZED_PREFIXES = ["/dashboard", "/admin", "/onboard", "/scan", "/call", "/uploads"];

export const stripLocalePrefix = (pathname: string) => {
  const parts = pathname.split("/");
  const first = parts[1];
  if (isLocale(first)) {
    const rest = parts.slice(2).join("/");
    return `/${rest}`.replace(/\/+$/, "") || "/";
  }
  return pathname || "/";
};

export const localizePath = (to: string, locale: Locale = currentLocale()) => {
  if (!to.startsWith("/")) return to;
  const normalized = stripLocalePrefix(to);
  if (NON_LOCALIZED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return normalized;
  }
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
};
