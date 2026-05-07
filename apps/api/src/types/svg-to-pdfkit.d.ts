import type PDFDocument from "pdfkit";

declare module "svg-to-pdfkit" {
  function SVGtoPDF(
    doc: InstanceType<typeof PDFDocument>,
    svg: string,
    x: number,
    y: number,
    options?: { width?: number; height?: number; preserveAspectRatio?: string }
  ): void;
  export = SVGtoPDF;
}
