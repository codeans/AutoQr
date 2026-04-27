export type HeroBeatId = "arrival" | "parking" | "reveal" | "walkaway";

export interface NarrativeBeat {
  id: HeroBeatId;
  /** Scroll progress (0–1) where the panel starts fading in. */
  start: number;
  /** Scroll progress (0–1) where the panel finishes fading out. */
  end: number;
  /** Two-digit chapter label, e.g. "01". */
  chapter: string;
  showCTA?: boolean;
}
