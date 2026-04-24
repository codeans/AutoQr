import type { NextFunction, Request, Response } from "express";
import { DEFAULT_LOCALE, resolveLocale, type Locale } from "@autoqr/shared";

declare global {
  namespace Express {
    interface Request {
      locale: Locale;
    }
  }
}

const LOCALE_COOKIE = "autoqr_locale";

export const localeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const queryLocale = typeof req.query.lang === "string" ? req.query.lang : null;
  const headerLocale = req.header("x-locale") || req.header("accept-language");
  const cookieLocale = (req.cookies && req.cookies[LOCALE_COOKIE]) || null;
  const country =
    req.header("cf-ipcountry") ||
    req.header("x-country") ||
    req.header("x-vercel-ip-country") ||
    null;

  req.locale = resolveLocale({
    explicit: queryLocale,
    stored: cookieLocale,
    countryCode: country,
    acceptLanguage: headerLocale
  }) || DEFAULT_LOCALE;

  next();
};

export const getRequestLocale = (req: Request): Locale => req.locale || DEFAULT_LOCALE;
