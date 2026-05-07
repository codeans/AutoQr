/**
 * Print-ready HTML/CSS for bulk QR sticker sheets (A4, physical units).
 * Admin templates wrap each sticker; placeholders are replaced per tag.
 */

export type StickerProductKind = "car" | "keys";

export type StickerPrintLayout = {
  /** Sticker cell width */
  stickerWidthMm: number;
  stickerHeightMm: number;
  pageMarginMm: number;
  gapMm: number;
};

export type StickerPrintProfile = StickerPrintLayout & {
  headline: string;
  /** Inner HTML only (placed inside each .sticker cell). Use placeholders. */
  innerHtml: string;
};

const A4_W_MM = 210;
const A4_H_MM = 297;

export const STICKER_PRINT_STORAGE_PREFIX = "autoqr.stickerPrint.profile.";

export const DEFAULT_INNER_HTML_CAR = `<div class="t-inner" style="height:100%;box-sizing:border-box;padding:1.5mm;display:grid;grid-template-rows:1fr auto auto auto;align-items:center;justify-items:center;gap:0.6mm;min-height:0;">
  <div style="display:grid;place-items:center;min-height:0;width:100%;">{{qr_image}}</div>
  <div style="font-size:8pt;font-weight:700;text-align:center;line-height:1.1;">{{headline}}</div>
  <div style="font-size:6.5pt;font-family:ui-monospace,monospace;text-align:center;">{{qr_id}}</div>
  <div style="font-size:5pt;text-align:center;line-height:1.2;color:#222;">{{activation_code}} · {{batch_code}}</div>
</div>`;

export const DEFAULT_INNER_HTML_KEYS = `<div class="t-inner" style="height:100%;box-sizing:border-box;padding:1mm;display:grid;grid-template-rows:1fr auto auto;align-items:center;justify-items:center;gap:0.4mm;min-height:0;">
  <div style="display:grid;place-items:center;min-height:0;width:100%;">{{qr_image}}</div>
  <div style="font-size:6.5pt;font-weight:700;text-align:center;line-height:1.05;">{{headline}}</div>
  <div style="font-size:5.5pt;font-family:ui-monospace,monospace;text-align:center;">{{qr_id}}</div>
</div>`;

export const defaultProfile = (kind: StickerProductKind): StickerPrintProfile =>
  kind === "car"
    ? {
        stickerWidthMm: 50.8,
        stickerHeightMm: 50.8,
        pageMarginMm: 8,
        gapMm: 1.5,
        headline: "SCAN TO CALL OWNER",
        innerHtml: DEFAULT_INNER_HTML_CAR
      }
    : {
        stickerWidthMm: 38,
        stickerHeightMm: 38,
        pageMarginMm: 8,
        gapMm: 1.2,
        headline: "KEYS · SCAN TO CALL OWNER",
        innerHtml: DEFAULT_INNER_HTML_KEYS
      };

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Remove script tags from admin-supplied HTML (admin-only surface). */
export function stripUnsafeMarkup(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=/gi, " data-stripped=");
}

export function computeStickerGrid(layout: StickerPrintLayout): { cols: number; rows: number } {
  const innerW = A4_W_MM - 2 * layout.pageMarginMm;
  const innerH = A4_H_MM - 2 * layout.pageMarginMm;
  const cellW = layout.stickerWidthMm + layout.gapMm;
  const cellH = layout.stickerHeightMm + layout.gapMm;
  const cols = Math.max(1, Math.floor((innerW + layout.gapMm) / cellW));
  const rows = Math.max(1, Math.floor((innerH + layout.gapMm) / cellH));
  return { cols, rows };
}

function qrBlockMm(layout: StickerPrintLayout): number {
  const m = Math.min(layout.stickerWidthMm, layout.stickerHeightMm);
  return Math.max(12, Math.round((m - 11) * 0.62 * 10) / 10);
}

export type StickerTagRow = {
  serial: string;
  activationCode: string;
  qrImage?: string;
  batchId?: { batchCode?: string } | string | null;
};

export function batchCodeFromTag(tag: StickerTagRow): string {
  const b = tag.batchId;
  if (!b || typeof b === "string") return "—";
  return b.batchCode ?? "—";
}

function interpolateInner(
  inner: string,
  tag: StickerTagRow,
  absQrSrc: string,
  qrMm: number,
  headline: string
): string {
  const qrImg =
    absQrSrc.length > 0
      ? `<img src="${escapeHtml(absQrSrc)}" alt="" width="${Math.round(qrMm * 11.81)}" height="${Math.round(qrMm * 11.81)}" style="width:${qrMm}mm;height:${qrMm}mm;max-width:100%;max-height:100%;object-fit:contain;display:block;margin:0 auto;" />`
      : `<span style="font-size:6pt;color:#999;">No QR image</span>`;

  const id = `#${escapeHtml(tag.serial.replace(/^#/, ""))}`;

  return stripUnsafeMarkup(inner)
    .replace(/\{\{qr_image\}\}/gi, qrImg)
    .replace(/\{\{qr_id\}\}/gi, escapeHtml(id))
    .replace(/\{\{serial\}\}/gi, escapeHtml(tag.serial))
    .replace(/\{\{activation_code\}\}/gi, escapeHtml(tag.activationCode))
    .replace(/\{\{batch_code\}\}/gi, escapeHtml(batchCodeFromTag(tag)))
    .replace(/\{\{headline\}\}/gi, escapeHtml(headline));
}

const shellCss = `
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; }
* { box-sizing: border-box; }
.print-root {
  width: 210mm;
  min-height: 297mm;
  padding: var(--page-margin);
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--sticker-w));
  grid-auto-rows: var(--sticker-h);
  gap: var(--gap);
  justify-content: start;
  align-content: start;
  background: #fff;
}
.print-root.sheet-page:not(:last-child) {
  page-break-after: always;
  break-after: page;
}
.sticker {
  width: var(--sticker-w);
  height: var(--sticker-h);
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  border: 0.35pt solid #111;
  overflow: hidden;
}
@media print {
  html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

/**
 * Build a full HTML document: one A4 page per sheet, grid of stickers, no breaks inside cells.
 */
/** Demo rows for live preview when no batch is loaded yet. */
export function sampleTagsForPreview(count = 10): StickerTagRow[] {
  return Array.from({ length: count }, (_, i) => ({
    serial: `SAMPLE-${String(i + 1).padStart(4, "0")}`,
    activationCode: "DEMO12AB",
    batchId: { batchCode: "BATCH-DEMO" },
    qrImage: "https://placehold.co/400x400/111/fff/png?text=QR"
  }));
}

export function buildStickerPrintHtml(
  tags: StickerTagRow[],
  profile: StickerPrintProfile,
  resolveQrSrc: (path?: string) => string,
  options?: { autoPrint?: boolean }
): string {
  const { cols, rows } = computeStickerGrid(profile);
  const perPage = cols * rows;
  const qrMm = qrBlockMm(profile);

  const rootVars = `:root {
    --sticker-w: ${profile.stickerWidthMm}mm;
    --sticker-h: ${profile.stickerHeightMm}mm;
    --page-margin: ${profile.pageMarginMm}mm;
    --gap: ${profile.gapMm}mm;
    --cols: ${cols};
  }`;

  const pages: string[] = [];
  if (tags.length === 0) {
    pages.push(
      `<div class="print-root sheet-page"><p style="padding:10mm;margin:0;font:11pt system-ui,sans-serif;color:#333;">No tags matched the current filters.</p></div>`
    );
  } else {
    for (let i = 0; i < tags.length; i += perPage) {
      const chunk = tags.slice(i, i + perPage);
      const cells = chunk
        .map((tag) => {
          const src = resolveQrSrc(tag.qrImage);
          const body = interpolateInner(profile.innerHtml, tag, src, qrMm, profile.headline);
          return `<article class="sticker">${body}</article>`;
        })
        .join("\n");
      pages.push(`<div class="print-root sheet-page">${cells}</div>`);
    }
  }

  const autoPrint = options?.autoPrint !== false;
  const printScript = autoPrint
    ? `<script>
    (function () {
      function go() {
        window.focus();
        window.print();
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(go).catch(go);
      } else {
        window.addEventListener("load", go);
      }
    })();
  </script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AutoQR sticker print</title>
  <style>${rootVars}
${shellCss}
  </style>
</head>
<body>
  ${pages.join("\n")}
  ${printScript}
</body>
</html>`;
}

/** Preview: first page only, optional scale for on-screen iframe. */
export function buildStickerPreviewHtml(
  tags: StickerTagRow[],
  profile: StickerPrintProfile,
  resolveQrSrc: (path?: string) => string,
  options?: { maxStickers?: number; previewScale?: number }
): string {
  const max = options?.maxStickers ?? 12;
  const scale = options?.previewScale ?? 0.55;
  const slice = tags.slice(0, max);
  const inner = buildStickerPrintHtml(slice, profile, resolveQrSrc, { autoPrint: false })
    .replace("<body>", `<body style="transform:scale(${scale});transform-origin:top left;width:${100 / scale}%;">`);
  return inner;
}

export function loadProfile(kind: StickerProductKind): StickerPrintProfile {
  try {
    const raw = localStorage.getItem(`${STICKER_PRINT_STORAGE_PREFIX}${kind}`);
    if (!raw) return defaultProfile(kind);
    const o = JSON.parse(raw) as Partial<StickerPrintProfile>;
    const base = defaultProfile(kind);
    return {
      ...base,
      ...o,
      stickerWidthMm: Number(o.stickerWidthMm) > 0 ? Number(o.stickerWidthMm) : base.stickerWidthMm,
      stickerHeightMm: Number(o.stickerHeightMm) > 0 ? Number(o.stickerHeightMm) : base.stickerHeightMm,
      pageMarginMm: Number(o.pageMarginMm) >= 0 ? Number(o.pageMarginMm) : base.pageMarginMm,
      gapMm: Number(o.gapMm) >= 0 ? Number(o.gapMm) : base.gapMm,
      headline: typeof o.headline === "string" ? o.headline : base.headline,
      innerHtml: typeof o.innerHtml === "string" && o.innerHtml.trim() ? o.innerHtml : base.innerHtml
    };
  } catch {
    return defaultProfile(kind);
  }
}

export function saveProfile(kind: StickerProductKind, profile: StickerPrintProfile): void {
  localStorage.setItem(`${STICKER_PRINT_STORAGE_PREFIX}${kind}`, JSON.stringify(profile));
}
