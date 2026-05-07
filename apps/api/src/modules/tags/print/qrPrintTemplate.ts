/** 1 mm in PDF points (1/72 inch) */
export const MM_TO_PT = 2.834645669;

export type PrintLayoutPreset = "a4_20" | "a4_28" | "a4_40";

export type StickerGridLayout = {
  preset: PrintLayoutPreset;
  pageWidthPt: number;
  pageHeightPt: number;
  marginPt: number;
  cols: number;
  rows: number;
  cellWidthPt: number;
  cellHeightPt: number;
  gapPt: number;
  qrPaddingTopPt: number;
  labelFontPt: number;
  codeFontPt: number;
};

const A4_W_MM = 210;
const A4_H_MM = 297;

/**
 * Reusable sticker grid: fixed cell geometry derived from page size, margins, and grid.
 * QR is centered horizontally; label band sits below the QR within the same cell.
 */
export function getStickerGridLayout(preset: PrintLayoutPreset): StickerGridLayout {
  const pageWidthPt = A4_W_MM * MM_TO_PT;
  const pageHeightPt = A4_H_MM * MM_TO_PT;
  const marginMm = 8;
  const marginPt = marginMm * MM_TO_PT;
  const gapMm = 0.6;
  const gapPt = gapMm * MM_TO_PT;

  const defs: Record<PrintLayoutPreset, { cols: number; rows: number }> = {
    a4_20: { cols: 4, rows: 5 },
    a4_28: { cols: 4, rows: 7 },
    a4_40: { cols: 5, rows: 8 }
  };
  const { cols, rows } = defs[preset];

  const innerW = pageWidthPt - 2 * marginPt;
  const innerH = pageHeightPt - 2 * marginPt;
  const cellWidthPt = (innerW - (cols - 1) * gapPt) / cols;
  const cellHeightPt = (innerH - (rows - 1) * gapPt) / rows;

  return {
    preset,
    pageWidthPt,
    pageHeightPt,
    marginPt,
    cols,
    rows,
    cellWidthPt,
    cellHeightPt,
    gapPt,
    qrPaddingTopPt: 1.2 * MM_TO_PT,
    labelFontPt: preset === "a4_40" ? 5.5 : 6.5,
    codeFontPt: preset === "a4_40" ? 4.8 : 5.5
  };
}

export function stickersPerPage(layout: StickerGridLayout): number {
  return layout.cols * layout.rows;
}
