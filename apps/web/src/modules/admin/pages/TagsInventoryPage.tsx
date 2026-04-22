import { useEffect, useMemo, useState } from "react";
import {
  Card,
  DataTable,
  EmptyState,
  FilterBar,
  LoadingState,
  PageHeader,
  SecondaryButton,
  Select,
  StatCard,
  StatusBadge,
  Input
} from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  in_stock: "neutral",
  assigned_to_order: "info",
  shipped: "info",
  delivered: "info",
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

  const refresh = () =>
    adminPlatformService.listTags({ status: status || undefined, search: search || undefined } as any).then(setTags);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [status]);

  const stats = useMemo(() => {
    const sum = { total: tags.length, inStock: 0, assigned: 0, activated: 0, disabled: 0 };
    for (const t of tags) {
      if (t.status === "in_stock") sum.inStock += 1;
      if (["assigned_to_order", "shipped", "delivered"].includes(t.status)) sum.assigned += 1;
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
        subtitle="Every pre-generated car QR appears here. Each QR has a unique activation code that becomes unusable once an owner activates it."
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
          {["in_stock", "assigned_to_order", "shipped", "delivered", "activated", "disabled", "lost"].map((s) => (
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
              <SecondaryButton
                key="a"
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
            ])}
          />
        </Card>
      )}
    </div>
  );
};
