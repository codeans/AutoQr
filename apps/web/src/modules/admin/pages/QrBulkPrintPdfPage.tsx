import { FormEvent, useEffect, useState } from "react";
import { Button, Card, PageHeader, Select, Input } from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

type BatchOption = {
  _id: string;
  batchCode: string;
  label: string;
  quantity: number;
};

export const QrBulkPrintPdfPage = () => {
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [printBatchId, setPrintBatchId] = useState("");
  const [printStatus, setPrintStatus] = useState("generated");
  const [serialFrom, setSerialFrom] = useState("");
  const [serialTo, setSerialTo] = useState("");
  const [maxTags, setMaxTags] = useState(2500);
  const [layoutPreset, setLayoutPreset] = useState<"a4_20" | "a4_28" | "a4_40">("a4_20");
  const [drawCutGuides, setDrawCutGuides] = useState(true);
  const [printPending, setPrintPending] = useState(false);
  const [printError, setPrintError] = useState("");

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

  const canSubmitPrint =
    Boolean(printBatchId) || (Boolean(serialFrom.trim()) && Boolean(serialTo.trim()));

  const submitBulkPrint = async (e: FormEvent) => {
    e.preventDefault();
    setPrintError("");
    if (!canSubmitPrint) {
      setPrintError("Select a batch, or enter both serial from and serial to.");
      return;
    }
    setPrintPending(true);
    try {
      const blob = await adminPlatformService.downloadBulkStickerPdf({
        batchId: printBatchId || undefined,
        status: printStatus || undefined,
        serialFrom: serialFrom.trim() || undefined,
        serialTo: serialTo.trim() || undefined,
        maxTags,
        layoutPreset,
        drawCutGuides
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `autoqr-stickers-${layoutPreset}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setPrintError(msg ?? "Could not generate PDF. Check filters and try again.");
    } finally {
      setPrintPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk print (vendor PDF)"
        subtitle="Server-built A4 sheets with vector QR codes. For editable browser layouts use HTML templates."
      />

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Download merged PDF</h2>
        <p className="mt-1 text-sm text-slate-600">
          300&nbsp;DPI–equivalent sharpness at print size and pure black modules. Safe for large runs — processing stays
          on the API, not the browser.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={submitBulkPrint}>
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
            <label className="text-xs font-medium text-slate-600">Layout (stickers / sheet)</label>
            <Select
              value={layoutPreset}
              onChange={(e) => setLayoutPreset(e.target.value as "a4_20" | "a4_28" | "a4_40")}
              className="w-full"
            >
              <option value="a4_20">A4 · 4×5 (20)</option>
              <option value="a4_28">A4 · 4×7 (28)</option>
              <option value="a4_40">A4 · 5×8 (40)</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Serial from (optional subset)</label>
            <Input value={serialFrom} onChange={(e) => setSerialFrom(e.target.value)} placeholder="BATCH-…-000001" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Serial to</label>
            <Input value={serialTo} onChange={(e) => setSerialTo(e.target.value)} placeholder="BATCH-…-01000" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Max tags in file</label>
            <Input
              type="number"
              min={1}
              max={5000}
              value={maxTags}
              onChange={(e) => setMaxTags(Number(e.target.value) || 2500)}
            />
          </div>
          <div className="flex flex-col justify-end gap-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-600">
              Each sticker includes <strong>batch number</strong>, <strong>activation code</strong>, and serial (PDF
              only). Vendor file uses vector QR + pure black.
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={drawCutGuides} onChange={(e) => setDrawCutGuides(e.target.checked)} />
              Light cell outline (trim alignment)
            </label>
            {printError ? <p className="text-sm text-red-600">{printError}</p> : null}
            <div>
              <Button type="submit" disabled={printPending || !canSubmitPrint}>
                {printPending ? "Building PDF…" : "Download merged PDF"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
