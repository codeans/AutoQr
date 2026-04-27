import type { NarrativeBeat } from "../types/narrative";

/**
 * Timing + structural metadata for each beat. Localized text lives in
 * `i18n/locales/*.ts` under `landingHero.chapters[id]`.
 */
export const heroNarrativeBeats: NarrativeBeat[] = [
  { id: "arrival", start: 0, end: 0.22, chapter: "01" },
  { id: "parking", start: 0.25, end: 0.48, chapter: "02" },
  { id: "reveal", start: 0.5, end: 0.72, chapter: "03" },
  { id: "walkaway", start: 0.75, end: 1.0, chapter: "04", showCTA: true }
];
