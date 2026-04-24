export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";
export const FALLBACK_LOCALE: Locale = "de";

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English"
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  de: "DE",
  en: "EN"
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);

export const normalizeLocale = (value: unknown): Locale | null => {
  if (typeof value !== "string") return null;
  const lowered = value.toLowerCase();
  if (lowered.startsWith("de")) return "de";
  if (lowered.startsWith("en")) return "en";
  return null;
};

const GERMAN_SPEAKING_COUNTRIES = new Set(["DE", "AT", "CH", "LI", "LU"]);

export const localeForCountry = (country: string | null | undefined): Locale | null => {
  if (!country) return null;
  const code = country.toUpperCase();
  if (GERMAN_SPEAKING_COUNTRIES.has(code)) return "de";
  return "en";
};

export const parseAcceptLanguage = (header: string | null | undefined): Locale | null => {
  if (!header) return null;
  const entries = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      const quality = q ? parseFloat(q) : 1;
      return { tag: tag.trim(), quality: Number.isNaN(quality) ? 1 : quality };
    })
    .sort((a, b) => b.quality - a.quality);
  for (const entry of entries) {
    const locale = normalizeLocale(entry.tag);
    if (locale) return locale;
  }
  return null;
};

export const resolveLocale = (options: {
  explicit?: string | null;
  stored?: string | null;
  countryCode?: string | null;
  acceptLanguage?: string | null;
}): Locale => {
  const { explicit, stored, countryCode, acceptLanguage } = options;
  const explicitLocale = normalizeLocale(explicit);
  if (explicitLocale) return explicitLocale;
  const storedLocale = normalizeLocale(stored);
  if (storedLocale) return storedLocale;
  const countryLocale = localeForCountry(countryCode);
  if (countryCode && countryLocale === "de") return "de";
  const headerLocale = parseAcceptLanguage(acceptLanguage);
  if (headerLocale) return headerLocale;
  if (countryLocale) return countryLocale;
  return DEFAULT_LOCALE;
};
