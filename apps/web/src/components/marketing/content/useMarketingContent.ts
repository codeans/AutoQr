import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { currentLocale } from "../../../i18n";
import {
  defaultMarketingContentByLocale,
  type MarketingContent
} from "./defaults";

type Section = { type: string; data?: unknown };

type CmsResponse = {
  content?: {
    slug: string;
    sections?: Section[];
  };
};

const mergeDeep = <T,>(base: T, override: unknown): T => {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return (override ?? base) as T;
  }
  const out: Record<string, unknown> = { ...(base as object) } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const baseVal = (base as Record<string, unknown>)?.[key];
    out[key] = baseVal && typeof baseVal === "object" && !Array.isArray(baseVal)
      ? mergeDeep(baseVal, value)
      : value;
  }
  return out as T;
};

export const useMarketingContent = (): MarketingContent => {
  const locale = currentLocale();
  const { data } = useQuery({
    queryKey: ["public-content", "marketing", locale],
    queryFn: async () => {
      const res = await api.get<CmsResponse>("/public/content/marketing", {
        params: { lang: locale }
      });
      return res.data;
    },
    staleTime: 60_000,
    retry: false
  });

  const fallback = defaultMarketingContentByLocale[locale] ?? defaultMarketingContentByLocale.de;
  if (!data?.content?.sections?.length) return fallback;

  const bySection: Record<string, unknown> = {};
  for (const section of data.content.sections) {
    if (section?.type) bySection[section.type] = section.data ?? section;
  }

  const keys: (keyof MarketingContent)[] = [
    "hero",
    "problem",
    "solution",
    "useCases",
    "workflow",
    "privacy",
    "pricing",
    "testimonials",
    "faq",
    "cta"
  ];

  const merged = { ...fallback };
  for (const key of keys) {
    if (bySection[key]) {
      (merged as Record<string, unknown>)[key] = mergeDeep(fallback[key], bySection[key]);
    }
  }
  return merged;
};
