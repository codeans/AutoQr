import { createRequire } from "node:module";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { env } from "../../../config/env.js";
import type { StickerGridLayout } from "./qrPrintTemplate.js";
import { stickersPerPage } from "./qrPrintTemplate.js";

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports -- svg-to-pdfkit is CJS-only
const SVGtoPDF = require("svg-to-pdfkit") as (
  doc: InstanceType<typeof PDFDocument>,
  svg: string,
  x: number,
  y: number,
  options?: { width?: number; height?: number }
) => void;

export type PrintableTag = {
  serial: string;
  publicToken: string;
  activationCode: string;
  /** TagBatch.batchCode — shown on every sticker with activation code */
  batchCode: string;
};

export const tagIncidentUrl = (publicToken: string) => {
  const base = env.PUBLIC_BASE_URL.replace(/\/$/, "");
  return `${base}/incident/${publicToken}`;
};

/**
 * Vector QR (SVG) matching production scan URLs — independent of stored PNG assets.
 */
export async function qrSvgForIncidentUrl(incidentUrl: string): Promise<string> {
  return QRCode.toString(incidentUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 0,
    color: { dark: "#000000", light: "#FFFFFF" }
  });
}

export type BuildStickerPdfOptions = {
  layout: StickerGridLayout;
  /** Hairline rectangle around each cell (trim guide), not full bleed */
  drawCutGuides: boolean;
};

function cellOrigin(layout: StickerGridLayout, indexOnPage: number) {
  const col = indexOnPage % layout.cols;
  const row = Math.floor(indexOnPage / layout.cols);
  const x = layout.marginPt + col * (layout.cellWidthPt + layout.gapPt);
  const y = layout.marginPt + row * (layout.cellHeightPt + layout.gapPt);
  return { x, y };
}

/**
 * Streams a single merged PDF to `out` (e.g. Express res).
 * Processes one tag at a time to keep memory bounded for large runs.
 */
export async function streamStickerPdf(
  tags: AsyncIterable<PrintableTag>,
  out: NodeJS.WritableStream,
  options: BuildStickerPdfOptions
): Promise<{ count: number }> {
  const { layout, drawCutGuides } = options;
  const perPage = stickersPerPage(layout);

  const doc = new PDFDocument({
    size: [layout.pageWidthPt, layout.pageHeightPt],
    margin: 0,
    compress: true,
    autoFirstPage: true,
    pdfVersion: "1.5",
    info: {
      Title: "AutoQR sticker sheets",
      Author: "AutoQR",
      Creator: "AutoQR bulk print"
    }
  });

  const finished = new Promise<void>((resolve, reject) => {
    out.once("error", reject);
    out.once("finish", () => resolve());
  });

  doc.pipe(out);

  let index = 0;
  let count = 0;

  for await (const tag of tags) {
    if (index > 0 && index % perPage === 0) {
      doc.addPage({ size: [layout.pageWidthPt, layout.pageHeightPt], margin: 0 });
    }

    const pageSlot = index % perPage;
    const { x, y } = cellOrigin(layout, pageSlot);

    if (drawCutGuides) {
      doc
        .save()
        .strokeColor("#dddddd")
        .lineWidth(0.15)
        .rect(x, y, layout.cellWidthPt, layout.cellHeightPt)
        .stroke()
        .restore();
    }

    const url = tagIncidentUrl(tag.publicToken);
    const svg = await qrSvgForIncidentUrl(url);

    /** Batch no. + activation (+ small serial) — keep in sync with label drawing below */
    const labelBand = layout.labelFontPt + layout.codeFontPt + (layout.labelFontPt - 1) + 12;
    const maxQr = Math.min(
      layout.cellWidthPt - 4,
      layout.cellHeightPt - layout.qrPaddingTopPt - labelBand
    );
    const qrSize = Math.max(24, maxQr);
    const qx = x + (layout.cellWidthPt - qrSize) / 2;
    const qy = y + layout.qrPaddingTopPt;

    doc.fillColor("#000000");
    SVGtoPDF(doc, svg, qx, qy, { width: qrSize, height: qrSize });

    const labelY = qy + qrSize + 3;
    const w = layout.cellWidthPt - 4;
    let ty = labelY;

    doc.fillColor("#000000").font("Helvetica").fontSize(layout.labelFontPt);
    doc.text(`Batch: ${tag.batchCode}`, x + 2, ty, { width: w, align: "center", lineBreak: false });
    ty += layout.labelFontPt + 2;

    doc.font("Courier").fontSize(layout.codeFontPt).fillColor("#000000");
    doc.text(`Activation: ${tag.activationCode}`, x + 2, ty, { width: w, align: "center", lineBreak: false });
    ty += layout.codeFontPt + 2;

    doc.font("Helvetica").fontSize(Math.max(4, layout.labelFontPt - 1)).fillColor("#000000");
    doc.text(tag.serial, x + 2, ty, { width: w, align: "center", lineBreak: false });

    index += 1;
    count += 1;
  }

  if (count === 0) {
    doc.fontSize(12).fillColor("#000000").text("No tags matched the selected print filters.", 48, 48, {
      width: layout.pageWidthPt - 96
    });
  }

  doc.end();
  await finished;
  return { count };
}
