import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES } from "@autoqr/shared";
import { currentLocale } from "../i18n";
import { localizePath, stripLocalePrefix } from "../i18n/routing";

type Props = {
  title?: string;
  description?: string;
  path?: string;
};

const SITE_URL = (import.meta.env.VITE_SITE_URL as string) || "https://autoqr.de";

export const SEO = ({ title, description, path }: Props) => {
  const { t } = useTranslation();
  const locale = currentLocale();
  const resolvedTitle = title || (t("meta.defaultTitle") as string);
  const resolvedDescription = description || (t("meta.defaultDescription") as string);
  const rawPath = path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const basePath = stripLocalePrefix(rawPath);
  const canonicalPath = localizePath(basePath, locale);
  const canonical = `${SITE_URL}${canonicalPath}`;

  return (
    <Helmet>
      <html lang={locale} />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={canonical} />
      {SUPPORTED_LOCALES.map((loc) => (
        <link
          key={loc}
          rel="alternate"
          hrefLang={loc}
          href={`${SITE_URL}${localizePath(basePath, loc)}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${localizePath(basePath, "de")}`} />
      <meta property="og:locale" content={locale === "de" ? "de_DE" : "en_US"} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={t("meta.siteName") as string} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
    </Helmet>
  );
};
