import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  PageHeader,
  SecondaryButton,
  Select,
  Input,
  Textarea
} from "../../../components/ui";
import { assetBaseUrl } from "../../../lib/runtimeConfig";
import { adminPlatformService } from "../services/platform.service";
import type { StickerProductKind, StickerPrintProfile, StickerTagRow } from "../utils/qrStickerPrintHtml";
import {
  buildStickerPreviewHtml,
  buildStickerPrintHtml,
  computeStickerGrid,
  defaultProfile,
  loadProfile,
  sampleTagsForPreview,
  saveProfile
} from "../utils/qrStickerPrintHtml";

type BatchOption = {
  _id: string;
  batchCode: string;
  label: string;
  quantity: number;
};

type TagRow = {
  _id: string;
  serial: string;
  activationCode: string;
  qrImage?: string;
  batchId?: { batchCode?: string } | string | null;
};

export const QrHtmlTemplatesPage = () => {
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [printBatchId, setPrintBatchId] = useState("");
  const [printStatus, setPrintStatus] = useState("generated");
  const [serialFrom, setSerialFrom] = useState("");
  const [serialTo, setSerialTo] = useState("");
  const [maxTags, setMaxTags] = useState(2500);

  const [templateKind, setTemplateKind] = useState<StickerProductKind>("car");
  const [stickerProfile, setStickerProfile] = useState<StickerPrintProfile>(() => loadProfile("car"));
  const [previewRows, setPreviewRows] = useState<StickerTagRow[] | null>(null);
  const [htmlPrintPending, setHtmlPrintPending] = useState(false);
  const [htmlPrintError, setHtmlPrintError] = useState("");

  useEffect(() => {
    setStickerProfile(loadProfile(templateKind));
  }, [templateKind]);

  useEffect(() => {
    adminPlatformService.listBatches().then((rows) =>
      setBatches(
        rows.map((b: { _id: string; batchCode: string; label: string; quantity: number }) => ({
          _id: b._id,
          batchCode: b.batchCode,
          label: b.label,
          quantity: b.quantity
        }))
      )
    );
  }, []);

  const resolveQrSrc = useCallback((qrImage?: string) => {
    if (!qrImage) return "";
    if (/^https?:\/\//i.test(qrImage)) return qrImage;
    return `${assetBaseUrl}${qrImage.startsWith("/") ? "" : "/"}${qrImage}`;
  }, []);

  const canSubmitPrint =
    Boolean(printBatchId) || (Boolean(serialFrom.trim()) && Boolean(serialTo.trim()));

  const mapTagToStickerRow = useCallback((t: TagRow): StickerTagRow => {
    return {
      serial: t.serial,
      activationCode: t.activationCode,
      qrImage: t.qrImage,
      batchId: t.batchId
    };
  }, []);

  const stickerGridStats = useMemo(() => computeStickerGrid(stickerProfile), [stickerProfile]);

  const previewStickerTags = useMemo(
    () => previewRows ?? sampleTagsForPreview(10),
    [previewRows]
  );

  const previewHtmlDoc = useMemo(
    () => buildStickerPreviewHtml(previewStickerTags, stickerProfile, resolveQrSrc, { maxStickers: 12 }),
    [previewStickerTags, stickerProfile, resolveQrSrc]
  );

  const loadPreviewFromFilters = async () => {
    setHtmlPrintError("");
    if (!canSubmitPrint) {
      setHtmlPrintError("Select a batch, or enter both serial from and serial to.");
      return;
    }
    setHtmlPrintPending(true);
    try {
      const rows = (await adminPlatformService.listTags({
        batchId: printBatchId || undefined,
        status: printStatus || undefined,
        serialFrom: serialFrom.trim() || undefined,
        serialTo: serialTo.trim() || undefined,
        limit: 12
      })) as TagRow[];
      setPreviewRows(rows.map(mapTagToStickerRow));
    } catch {
      setHtmlPrintError("Could not load tags for preview.");
    } finally {
      setHtmlPrintPending(false);
    }
  };

  const openHtmlStickerPrint = async () => {
    setHtmlPrintError("");
    if (!canSubmitPrint) {
      setHtmlPrintError("Select a batch, or enter both serial from and serial to.");
      return;
    }
    setHtmlPrintPending(true);
    try {
      const rows = (await adminPlatformService.listTags({
        batchId: printBatchId || undefined,
        status: printStatus || undefined,
        serialFrom: serialFrom.trim() || undefined,
        serialTo: serialTo.trim() || undefined,
        limit: Math.min(maxTags, 5000)
      })) as TagRow[];
      const stickers = rows.map(mapTagToStickerRow);
      const html = buildStickerPrintHtml(stickers, stickerProfile, resolveQrSrc, { autoPrint: true });
      const win = window.open("", "_blank");
      if (!win) {
        setHtmlPrintError("Popup blocked — allow popups for this site.");
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch {
      setHtmlPrintError("Could not load tags for HTML print.");
    } finally {
      setHtmlPrintPending(false);
    }
  };

  const openHtmlStickerPrintNoAuto = async () => {
    setHtmlPrintError("");
    if (!canSubmitPrint) {
      setHtmlPrintError("Select a batch, or enter both serial from and serial to.");
      return;
    }
    setHtmlPrintPending(true);
    try {
      const rows = (await adminPlatformService.listTags({
        batchId: printBatchId || undefined,
        status: printStatus || undefined,
        serialFrom: serialFrom.trim() || undefined,
        serialTo: serialTo.trim() || undefined,
        limit: Math.min(maxTags, 5000)
      })) as TagRow[];
      const stickers = rows.map(mapTagToStickerRow);
      const html = buildStickerPrintHtml(stickers, stickerProfile, resolveQrSrc, { autoPrint: false });
      const win = window.open("", "_blank");
      if (!win) {
        setHtmlPrintError("Popup blocked — allow popups for this site.");
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch {
      setHtmlPrintError("Could not load tags for HTML print.");
    } finally {
      setHtmlPrintPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="HTML templates"
        subtitle="Browser-based A4 sticker sheets using editable Car / Keys profiles (mm layout, inner HTML). For vector PDF bulk runs use Bulk print (vendor PDF) in this sidebar section."
      />

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Browser print (HTML templates)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Two saved profiles — <strong>Car QR</strong> and <strong>Keys QR</strong> — with editable sticker size
          (millimetres), margins, and inner HTML. Placeholders:{" "}
          <code className="rounded bg-slate-100 px-1">{"{{qr_image}}"}</code>,{" "}
          <code className="rounded bg-slate-100 px-1">{"{{qr_id}}"}</code>,{" "}
          <code className="rounded bg-slate-100 px-1">{"{{headline}}"}</code>,{" "}
          <code className="rounded bg-slate-100 px-1">{"{{activation_code}}"}</code>,{" "}
          <code className="rounded bg-slate-100 px-1">{"{{batch_code}}"}</code>,{" "}
          <code className="rounded bg-slate-100 px-1">{"{{serial}}"}</code>. Settings persist in this browser
          (localStorage).
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Static example file (10 stickers):{" "}
          <a
            className="text-blue-600 underline"
            href="/print-templates/qr-sticker-a4-example.html"
            target="_blank"
            rel="noreferrer"
          >
            /print-templates/qr-sticker-a4-example.html
          </a>
        </p>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-800">Which tags to print</h3>
          <p className="mt-1 text-xs text-slate-600">
            Pick a batch, or enter both serial endpoints. Optional status filter narrows rows.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Batch</label>
              <Select value={printBatchId} onChange={(e) => setPrintBatchId(e.target.value)} className="w-full">
                <option value="">— Optional if serial range set —</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batchCode} · {b.label} ({b.quantity})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Status filter</label>
              <Select value={printStatus} onChange={(e) => setPrintStatus(e.target.value)} className="w-full">
                <option value="">Any status</option>
                {["generated", "printed", "dispatched", "unlinked", "activated", "disabled", "lost"].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Max tags in sheet</label>
              <Input
                type="number"
                min={1}
                max={5000}
                value={maxTags}
                onChange={(e) => setMaxTags(Number(e.target.value) || 2500)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Serial from (optional subset)</label>
              <Input value={serialFrom} onChange={(e) => setSerialFrom(e.target.value)} placeholder="BATCH-…-000001" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Serial to</label>
              <Input value={serialTo} onChange={(e) => setSerialTo(e.target.value)} placeholder="BATCH-…-01000" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Template profile</label>
              <Select
                value={templateKind}
                onChange={(e) => setTemplateKind(e.target.value as StickerProductKind)}
                className="w-full"
              >
                <option value="car">Car QR (default 50.8×50.8&nbsp;mm ≈ 2×2&nbsp;in)</option>
                <option value="keys">Keys QR (default 38×38&nbsp;mm, compact)</option>
              </Select>
              <p className="text-xs text-amber-700">
                Save the current profile before switching Car/Keys, or your unsaved edits are discarded.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Sticker width (mm)</label>
                <Input
                  type="number"
                  min={12}
                  max={210}
                  step={0.1}
                  value={stickerProfile.stickerWidthMm}
                  onChange={(e) =>
                    setStickerProfile((p) => ({ ...p, stickerWidthMm: Number(e.target.value) || p.stickerWidthMm }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Sticker height (mm)</label>
                <Input
                  type="number"
                  min={12}
                  max={297}
                  step={0.1}
                  value={stickerProfile.stickerHeightMm}
                  onChange={(e) =>
                    setStickerProfile((p) => ({ ...p, stickerHeightMm: Number(e.target.value) || p.stickerHeightMm }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Page margin (mm)</label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={stickerProfile.pageMarginMm}
                  onChange={(e) =>
                    setStickerProfile((p) => ({ ...p, pageMarginMm: Number(e.target.value) || p.pageMarginMm }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Gap between cells (mm)</label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={stickerProfile.gapMm}
                  onChange={(e) =>
                    setStickerProfile((p) => ({ ...p, gapMm: Number(e.target.value) || p.gapMm }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Headline (also {"{{headline}}"})</label>
              <Input
                value={stickerProfile.headline}
                onChange={(e) => setStickerProfile((p) => ({ ...p, headline: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Inner HTML (one sticker)</label>
              <Textarea
                className="min-h-[200px] w-full font-mono text-xs"
                value={stickerProfile.innerHtml}
                onChange={(e) => setStickerProfile((p) => ({ ...p, innerHtml: e.target.value }))}
                spellCheck={false}
              />
            </div>
            <p className="text-xs text-slate-600">
              Grid on A4: <strong>{stickerGridStats.cols}×{stickerGridStats.rows}</strong> (
              {stickerGridStats.cols * stickerGridStats.rows} stickers per page). Auto-fits from sticker size and
              margins.
            </p>
            <div className="flex flex-wrap gap-2">
              <SecondaryButton
                type="button"
                onClick={() => {
                  saveProfile(templateKind, stickerProfile);
                }}
              >
                Save template ({templateKind})
              </SecondaryButton>
              <SecondaryButton
                type="button"
                onClick={() => {
                  const next = defaultProfile(templateKind);
                  setStickerProfile(next);
                  saveProfile(templateKind, next);
                }}
              >
                Restore defaults
              </SecondaryButton>
              <SecondaryButton type="button" disabled={htmlPrintPending || !canSubmitPrint} onClick={loadPreviewFromFilters}>
                Load 12 real QRs into preview
              </SecondaryButton>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={htmlPrintPending || !canSubmitPrint} onClick={openHtmlStickerPrint}>
                {htmlPrintPending ? "Loading…" : "Open HTML sheet + print dialog"}
              </Button>
              <SecondaryButton type="button" disabled={htmlPrintPending || !canSubmitPrint} onClick={openHtmlStickerPrintNoAuto}>
                Open HTML sheet only
              </SecondaryButton>
            </div>
            {htmlPrintError ? <p className="text-sm text-red-600">{htmlPrintError}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Live preview (scaled)</label>
            <p className="text-xs text-slate-500">
              Uses placeholder QRs until you use &quot;Load 12 real QRs&quot;. Images must be allowed for
              placehold.co in devtools if blocked.
            </p>
            <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-2">
              <iframe title="Sticker template preview" className="h-[min(520px,70vh)] w-full bg-white" sandbox="" srcDoc={previewHtmlDoc} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
