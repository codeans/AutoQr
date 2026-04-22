import { useEffect, useState } from "react";
import {
  Card,
  DataTable,
  EmptyState,
  FilterBar,
  Input,
  LoadingState,
  PageHeader,
  SecondaryButton,
  Select,
  StatusBadge
} from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

type ActivationRecordRow = {
  _id: string;
  serial: string;
  activationCode: string;
  outcome: string;
  createdAt: string;
  ipAddress?: string;
  message?: string;
  userId?: { name?: string; email?: string; phone?: string } | null;
  carId?: { registrationNumber?: string; make?: string; model?: string; nickname?: string } | null;
  tagId?: { serial?: string; publicToken?: string; status?: string } | null;
};

const outcomeTone: Record<string, "success" | "danger" | "warning" | "info" | "neutral"> = {
  success: "success",
  invalid_code: "danger",
  already_used: "warning",
  disabled: "danger",
  rate_limited: "warning",
  error: "danger"
};

export const ActivationRecordsPage = () => {
  const [records, setRecords] = useState<ActivationRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState("");
  const [search, setSearch] = useState("");

  const refresh = () =>
    adminPlatformService
      .listActivationRecords({ outcome: outcome || undefined, search: search || undefined } as any)
      .then(setRecords);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [outcome]);

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activation records"
        subtitle="Every QR activation that has ever succeeded. Each record links a physical QR to an owner account and a specific car, and the activation code becomes consumed after a successful activation."
      />

      <FilterBar>
        <Select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="md:max-w-xs">
          <option value="">All outcomes</option>
          {["success", "invalid_code", "already_used", "disabled", "rate_limited", "error"].map((o) => (
            <option key={o} value={o}>
              {o.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Search by serial or activation code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-md"
        />
        <SecondaryButton type="button" onClick={() => refresh()}>
          Apply
        </SecondaryButton>
      </FilterBar>

      {records.length === 0 ? (
        <EmptyState
          title="No activations yet"
          message="Activation records will appear here as owners activate their QR stickers."
        />
      ) : (
        <Card>
          <DataTable
            columns={[
              "Activated at",
              "QR serial",
              "Activation code",
              "Outcome",
              "User",
              "Car",
              "IP"
            ]}
            rows={records.map((r) => [
              new Date(r.createdAt).toLocaleString(),
              <span key="s" className="font-mono text-xs text-slate-900">{r.serial}</span>,
              <span key="c" className="font-mono text-xs text-slate-700">{r.activationCode}</span>,
              <StatusBadge key="o" label={r.outcome.replace(/_/g, " ")} tone={outcomeTone[r.outcome] ?? "neutral"} />,
              r.userId ? `${r.userId.name ?? ""} (${r.userId.email ?? ""})` : "—",
              r.carId
                ? `${r.carId.registrationNumber ?? ""}${r.carId.make ? ` · ${r.carId.make} ${r.carId.model ?? ""}` : ""}`
                : "—",
              <span key="ip" className="font-mono text-xs text-slate-500">{r.ipAddress || "—"}</span>
            ])}
          />
        </Card>
      )}
    </div>
  );
};
