import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  LoadingState,
  PageHeader,
  SecondaryButton,
  Select,
  StatCard,
  StatusBadge,
  Textarea
} from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

const statusTone: Record<string, "neutral" | "success" | "warning" | "info"> = {
  generated: "info",
  printed: "info",
  ready_to_ship: "warning",
  shipped: "success",
  archived: "neutral",
  draft: "neutral"
};

type Batch = {
  _id: string;
  batchCode: string;
  label: string;
  quantity: number;
  generatedCount: number;
  printedCount?: number;
  inStockCount?: number;
  assignedCount?: number;
  activatedCount?: number;
  disabledCount?: number;
  status: string;
  createdAt: string;
  notes?: string;
};

export const TagBatchesPage = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ label: "", quantity: 100, notes: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => adminPlatformService.listBatches().then(setBatches);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const acc = { batches: batches.length, generated: 0, inStock: 0, assigned: 0, activated: 0 };
    for (const b of batches) {
      acc.generated += b.generatedCount ?? 0;
      acc.inStock += b.inStockCount ?? 0;
      acc.assigned += b.assignedCount ?? 0;
      acc.activated += b.activatedCount ?? 0;
    }
    return acc;
  }, [batches]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await adminPlatformService.createBatch({
        label: form.label,
        quantity: Number(form.quantity),
        notes: form.notes
      });
      setForm({ label: "", quantity: 100, notes: "" });
      await refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not create batch.");
    } finally {
      setPending(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await adminPlatformService.updateBatchStatus(id, status);
    await refresh();
  };

  const downloadCsv = async (batch: Batch) => {
    const blob = await adminPlatformService.exportBatchCsv(batch._id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${batch.batchCode}-activation-codes.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR batches"
        subtitle="Pre-generate physical QR stickers in batches. Each QR gets a unique serial and one-time activation code — print, stock, then dispatch against orders."
      />

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Batches" value={totals.batches} />
        <StatCard title="QRs generated" value={totals.generated} />
        <StatCard title="In stock" value={totals.inStock} />
        <StatCard title="Dispatched" value={totals.assigned} />
        <StatCard title="Activated" value={totals.activated} />
      </div>

      <Card>
        <h3 className="text-base font-semibold text-slate-900">Generate a new batch</h3>
        <p className="text-sm text-slate-600">
          Quantity is how many physical QR stickers to pre-generate. Each row includes a unique activation
          code that will be printed on the sticker.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={create}>
          <label className="text-sm font-medium text-slate-700">
            Batch label
            <Input
              required
              className="mt-1"
              placeholder="e.g. Q2 manufacturing run"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Quantity (max 2000)
            <Input
              type="number"
              required
              className="mt-1"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
              min={1}
              max={2000}
            />
          </label>
          <label className="md:col-span-3 text-sm font-medium text-slate-700">
            Notes
            <Textarea
              className="mt-1"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Internal notes for manufacturing / printing."
            />
          </label>
          {error && <p className="md:col-span-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="md:col-span-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Generating…" : "Generate batch"}
            </Button>
          </div>
        </form>
      </Card>

      {batches.length === 0 ? (
        <EmptyState title="No batches yet" message="Create your first batch to pre-generate QRs." />
      ) : (
        <Card>
          <DataTable
            columns={[
              "Batch code",
              "Label",
              "Qty",
              "In stock",
              "Dispatched",
              "Activated",
              "Status",
              "Created",
              "Export",
              "Set status"
            ]}
            rows={batches.map((b) => [
              <span key="c" className="font-mono text-sm">
                {b.batchCode}
              </span>,
              b.label || "—",
              `${b.generatedCount} / ${b.quantity}`,
              b.inStockCount ?? 0,
              b.assignedCount ?? 0,
              b.activatedCount ?? 0,
              <StatusBadge key="s" label={b.status} tone={statusTone[b.status] ?? "neutral"} />,
              new Date(b.createdAt).toLocaleDateString(),
              <div key="x" className="flex gap-2">
                <SecondaryButton type="button" onClick={() => downloadCsv(b)}>
                  CSV
                </SecondaryButton>
              </div>,
              <Select
                key="a"
                defaultValue={b.status}
                onChange={(e) => updateStatus(b._id, e.target.value)}
                className="max-w-[180px]"
              >
                {["generated", "printed", "ready_to_ship", "shipped", "archived"].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            ])}
          />
          <div className="mt-3 flex items-center gap-3">
            <SecondaryButton
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(JSON.stringify(batches, null, 2));
                alert("Batch metadata copied to clipboard.");
              }}
            >
              Export all (JSON)
            </SecondaryButton>
          </div>
        </Card>
      )}
    </div>
  );
};
