import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, FALLBACK_LOCALE, SUPPORTED_LOCALES, type Locale } from "@autoqr/shared";
import { de } from "./locales/de.js";
import { en } from "./locales/en.js";

export const LOCALE_STORAGE_KEY = "autoqr_locale";
export const LOCALE_COOKIE = "autoqr_locale";

const resources = {
  de: { common: de },
  en: { common: en }
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["path", "localStorage", "cookie", "navigator"],
      lookupFromPathIndex: 0,
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      lookupCookie: LOCALE_COOKIE,
      caches: ["localStorage", "cookie"],
      cookieMinutes: 60 * 24 * 365
    }
  });

export const setLocale = (locale: Locale) => {
  void i18n.changeLanguage(locale);
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    document.documentElement.lang = locale;
  } catch {
    /* noop */
  }
};

export const currentLocale = (): Locale => {
  const lng = (i18n.language || DEFAULT_LOCALE).toLowerCase();
  if (lng.startsWith("de")) return "de";
  if (lng.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
};

if (typeof document !== "undefined") {
  document.documentElement.lang = currentLocale();
}

export default i18n;
