/**
 * Maps UI language to a BCP 47 locale for currency amounts.
 * English UI → en-GB (EUR with "." decimal, "," thousands).
 * German UI → de-DE ("29,99 €" style).
 */
export function currencyDisplayLocale(i18nLanguage?: string | null): string {
  const base = (i18nLanguage ?? "en").split("-")[0]?.toLowerCase() ?? "en";
  return base === "de" ? "de-DE" : "en-GB";
}

export function formatMoney(amount: number, currency = "EUR", i18nLanguage?: string | null) {
  return new Intl.NumberFormat(currencyDisplayLocale(i18nLanguage), {
    style: "currency",
    currency
  }).format(amount);
}
