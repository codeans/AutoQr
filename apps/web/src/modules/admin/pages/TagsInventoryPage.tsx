import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  FilterBar,
  LoadingState,
  Modal,
  PageHeader,
  SecondaryButton,
  Select,
  StatCard,
  StatusBadge,
  Input
} from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";
import { assetBaseUrl } from "../../../lib/runtimeConfig";
const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  generated: "neutral",
  printed: "info",
  dispatched: "info",
  unlinked: "info",
  activated: "success",
  disabled: "danger",
  lost: "danger"
};

type TagRow = {
  _id: string;
  serial: string;
  publicToken: string;
  activationCode: string;
  status: string;
  qrImage?: string;
  scanCount?: number;
  activatedAt?: string;
  createdAt?: string;
  ownerUserId?: { name?: string; email?: string; phone?: string } | string | null;
  carId?: { registrationNumber?: string; make?: string; model?: string; nickname?: string } | string | null;
  batchId?: { batchCode?: string; label?: string } | string | null;
  orderId?: { _id?: string; orderStatus?: string; paymentStatus?: string } | string | null;
};

const ownerLabel = (owner: TagRow["ownerUserId"]) => {
  if (!owner || typeof owner === "string") return "—";
  return owner.name ?? owner.email ?? owner.phone ?? "—";
};

const carLabel = (car: TagRow["carId"]) => {
  if (!car || typeof car === "string") return "—";
  const tail = [car.make, car.model].filter(Boolean).join(" ");
  const reg = car.registrationNumber ?? "—";
  return tail ? `${reg} · ${tail}` : reg;
};

const batchLabel = (batch: TagRow["batchId"]) => {
  if (!batch || typeof batch === "string") return "—";
  return batch.batchCode ?? "—";
};

export const TagsInventoryPage = () => {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [previewTag, setPreviewTag] = useState<TagRow | null>(null);

  const resolveQrSrc = useCallback((qrImage?: string) => {
    if (!qrImage) return "";
    if (/^https?:\/\//i.test(qrImage)) return qrImage;
    return `${assetBaseUrl}${qrImage.startsWith("/") ? "" : "/"}${qrImage}`;
  }, []);

  const downloadQr = async (tag: TagRow) => {
    const src = resolveQrSrc(tag.qrImage);
    if (!src) return;
    try {
      const res = await fetch(src, { credentials: "include" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tag.serial || "qr"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  const printQr = (tag: TagRow) => {
    const src = resolveQrSrc(tag.qrImage);
    if (!src) return;
    const win = window.open("", "_blank", "width=600,height=700");
    if (!win) return;
    const safeSerial = (tag.serial ?? "").replace(/[<>&"']/g, "");
    const safeCode = (tag.activationCode ?? "").replace(/[<>&"']/g, "");
    const safeBatch = batchLabel(tag.batchId).replace(/[<>&"']/g, "");
    win.document.write(`<!doctype html><html><head><title>QR ${safeSerial}</title>
<style>
  body { margin:0; font-family: ui-sans-serif, system-ui, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .sheet { text-align:center; padding:24px; }
  .sheet img { width:320px; height:320px; }
  .meta { margin-top:16px; font-size:14px; color:#111; }
  .batch { font-size: 13px; color:#111; margin-top: 8px; }
  .code { font-family: ui-monospace, monospace; letter-spacing: 1px; font-size: 13px; color:#111; margin-top: 6px; }
  @media print { @page { margin: 12mm; } }
</style></head><body>
  <div class="sheet">
    <img src="${src}" alt="QR" />
    <div class="meta"><strong>${safeSerial}</strong></div>
    <div class="batch"><strong>Batch:</strong> ${safeBatch}</div>
    <div class="code"><strong>Activation:</strong> ${safeCode}</div>
  </div>
  <script>
    const img = document.querySelector('img');
    const go = () => { window.focus(); window.print(); };
    if (img.complete) go(); else img.addEventListener('load', go);
  </script>
</body></html>`);
    win.document.close();
  };

  const refresh = () =>
    adminPlatformService.listTags({ status: status || undefined, search: search || undefined } as any).then(setTags);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [status]);

  const stats = useMemo(() => {
    const sum = { total: tags.length, inStock: 0, assigned: 0, activated: 0, disabled: 0 };
    for (const t of tags) {
      if (t.status === "generated") sum.inStock += 1;
      if (["printed", "dispatched", "unlinked"].includes(t.status)) sum.assigned += 1;
      if (t.status === "activated") sum.activated += 1;
      if (["disabled", "lost"].includes(t.status)) sum.disabled += 1;
    }
    return sum;
  }, [tags]);

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR inventory"
        subtitle="Every pre-generated car QR appears here. Each QR has a unique activation code that becomes unusable once an owner activates it. Bulk vendor PDF and browser HTML sheets live under their own admin pages in this section."
      />

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Total QRs" value={stats.total} />
        <StatCard title="In stock" value={stats.inStock} />
        <StatCard title="Assigned / Dispatched" value={stats.assigned} />
        <StatCard title="Activated" value={stats.activated} />
        <StatCard title="Disabled / Lost" value={stats.disabled} />
      </div>

      <FilterBar>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:max-w-xs">
          <option value="">All statuses</option>
          {["generated", "printed", "dispatched", "unlinked", "activated", "disabled", "lost"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Search by serial, public token, or activation code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-md"
        />
        <SecondaryButton type="button" onClick={() => refresh()}>
          Apply
        </SecondaryButton>
      </FilterBar>

      {tags.length === 0 ? (
        <EmptyState title="No QRs match" message="Generate a batch or adjust your filters." />
      ) : (
        <Card>
          <DataTable
            columns={[
              "Serial",
              "Batch",
              "Status",
              "Activation code",
              "Owner",
              "Car",
              "Scans",
              "Activated at",
              "Actions"
            ]}
            rows={tags.map((t) => [
              <span key="s" className="font-mono text-xs text-slate-900">{t.serial}</span>,
              <span key="b" className="font-mono text-xs text-slate-600">{batchLabel(t.batchId)}</span>,
              <StatusBadge key="st" label={t.status.replace(/_/g, " ")} tone={tone[t.status] ?? "neutral"} />,
              <span key="c" className="font-mono text-xs text-slate-700">{t.activationCode}</span>,
              ownerLabel(t.ownerUserId),
              carLabel(t.carId),
              t.scanCount ?? 0,
              t.activatedAt ? new Date(t.activatedAt).toLocaleString() : "—",
              <div key="a" className="flex flex-wrap gap-2">
                <SecondaryButton
                  type="button"
                  onClick={() => setPreviewTag(t)}
                  disabled={!t.qrImage}
                >
                  Preview
                </SecondaryButton>
                <SecondaryButton
                  type="button"
                  onClick={async () => {
                    if (!confirm("Disable this QR? The public scan page will stop responding.")) return;
                    await adminPlatformService.disableTag(t._id);
                    await refresh();
                  }}
                  className="text-red-600"
                  disabled={t.status === "disabled"}
                >
                  Disable
                </SecondaryButton>
              </div>
            ])}
          />
        </Card>
      )}

      <Modal
        open={!!previewTag}
        title={previewTag ? `QR preview · ${previewTag.serial}` : "QR preview"}
        onClose={() => setPreviewTag(null)}
      >
        {previewTag && (
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
              {previewTag.qrImage ? (
                <img
                  src={resolveQrSrc(previewTag.qrImage)}
                  alt={`QR ${previewTag.serial}`}
                  className="h-64 w-64 object-contain"
                />
              ) : (
                <p className="text-sm text-slate-500">No QR image available for this tag.</p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-500">Serial</dt>
                <dd className="font-mono text-slate-900">{previewTag.serial}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Activation code</dt>
                <dd className="font-mono text-slate-900">{previewTag.activationCode}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">Public token</dt>
                <dd className="font-mono break-all text-slate-900">{previewTag.publicToken}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <SecondaryButton type="button" onClick={() => setPreviewTag(null)}>
                Close
              </SecondaryButton>
              <SecondaryButton
                type="button"
                onClick={() => printQr(previewTag)}
                disabled={!previewTag.qrImage}
              >
                Print
              </SecondaryButton>
              <Button
                type="button"
                onClick={() => downloadQr(previewTag)}
                disabled={!previewTag.qrImage}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
