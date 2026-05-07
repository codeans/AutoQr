import type { Plan } from "./types";

const DE = (lang: string) => lang === "de" || lang.toLowerCase().startsWith("de-");

export type LocalizedPlanCopy = {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
};

export function localizePlan(plan: Plan, language: string): LocalizedPlanCopy {
  if (DE(language)) {
    return {
      name: plan.nameDe?.trim() ? plan.nameDe : plan.name,
      tagline: plan.taglineDe?.trim() ? plan.taglineDe : plan.tagline,
      description: plan.descriptionDe?.trim() ? plan.descriptionDe : plan.description,
      highlights: plan.highlightsDe?.length ? plan.highlightsDe : plan.highlights
    };
  }
  return {
    name: plan.name,
    tagline: plan.tagline,
    description: plan.description,
    highlights: plan.highlights
  };
}

export function formatEmergencyContactCap(plan: Plan, unlimitedLabel: string): string {
  if (plan.slug === "fleet-pro" || plan.emergencyContactLimit >= 500) return unlimitedLabel;
  return String(plan.emergencyContactLimit);
}

export function vehicleCap(plan: Plan): number {
  return plan.carLimit ?? 0;
}
