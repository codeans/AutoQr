import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { de } from "./locales/de";
import { en } from "./locales/en";

export type Locale = "de" | "en";
export const SUPPORTED_LOCALES: Locale[] = ["de", "en"];
export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English"
};

const STORAGE_KEY = "autoqr.locale";

const normalize = (tag: string | null | undefined): Locale | null => {
  if (!tag) return null;
  const lower = tag.toLowerCase();
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("en")) return "en";
  return null;
};

const detectInitialLocale = async (): Promise<Locale> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const fromStorage = normalize(stored);
    if (fromStorage) return fromStorage;
  } catch {
    /* noop */
  }
  try {
    const locales = Localization.getLocales?.() || [];
    const primary = locales[0]?.languageTag || locales[0]?.languageCode || null;
    const region = locales[0]?.regionCode || null;
    if (region && ["DE", "AT", "CH", "LI", "LU"].includes(region)) return "de";
    const fromDevice = normalize(primary);
    if (fromDevice) return fromDevice;
  } catch {
    /* noop */
  }
  return DEFAULT_LOCALE;
};

export const initI18n = async () => {
  const locale = await detectInitialLocale();
  if (i18n.isInitialized) {
    if (i18n.language !== locale) await i18n.changeLanguage(locale);
    return;
  }
  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources: {
      de: { common: de },
      en: { common: en }
    },
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });
};

export const setLocale = async (locale: Locale) => {
  await i18n.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* noop */
  }
};

export const currentLocale = (): Locale => {
  const lng = (i18n.language || DEFAULT_LOCALE).toLowerCase();
  return normalize(lng) || DEFAULT_LOCALE;
};

export { STORAGE_KEY as LOCALE_STORAGE_KEY };
export default i18n;
