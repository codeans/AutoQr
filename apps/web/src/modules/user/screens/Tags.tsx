import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  DataTable,
  EmptyState,
  LoadingState,
  SectionTitle,
  StatusBadge
} from "../../../components/ui";
import { ownerService } from "../services/owner.service";
import type { OwnerTag } from "../services/owner.service";

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  activated: "success",
  generated: "neutral",
  printed: "info",
  dispatched: "info",
  unlinked: "info",
  disabled: "danger",
  lost: "danger"
};

type HistoryRow = Awaited<ReturnType<typeof ownerService.listActivationHistory>>[number];

export const TagsScreen = () => {
  const [tags, setTags] = useState<OwnerTag[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ownerService.listTags(), ownerService.listActivationHistory().catch(() => [])])
      .then(([t, h]) => {
        setTags(t);
        setHistory(h);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="My car QRs"
        subtitle="QR stickers activated on your account. Each QR is permanently bound to a specific car and its activation code has been consumed."
      />
      {tags.length === 0 ? (
        <EmptyState
          title="No QRs activated yet"
          message="Received your sticker? Head to Activate to enter the one-time code and link it to your car."
        />
      ) : (
        <Card>
          <DataTable
            columns={[
              "Serial",
              "Status",
              "Linked car",
              "Scans",
              "Last scan",
              "Activated at",
              "Public page"
            ]}
            rows={tags.map((tag) => {
              const car = (tag as any).carId;
              const carLabel = car
                ? typeof car === "string"
                  ? "—"
                  : `${car.registrationNumber ?? ""}${car.make ? ` · ${car.make} ${car.model ?? ""}` : ""}`
                : "—";
              return [
                <span key="s" className="font-mono text-sm text-slate-900">
                  {tag.serial}
                </span>,
                <StatusBadge key="st" label={tag.status.replace(/_/g, " ")} tone={statusTone[tag.status] ?? "neutral"} />,
                <span key="car" className="text-sm text-slate-700">{carLabel}</span>,
                tag.scanCount ?? 0,
                tag.lastScanAt ? new Date(tag.lastScanAt).toLocaleString() : "—",
                tag.activatedAt ? new Date(tag.activatedAt).toLocaleString() : "—",
                <Link
                  key="u"
                  to={`/scan/${tag.publicToken}?preview=1`}
                  className="text-sm text-blue-600 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </Link>
              ];
            })}
          />
        </Card>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-semibold text-slate-900">Activation history</h3>
          <Card>
            <DataTable
              columns={["When", "QR serial", "Car", "Outcome"]}
              rows={history.map((r) => [
                new Date(r.createdAt).toLocaleString(),
                <span key="s" className="font-mono text-xs text-slate-900">{r.serial}</span>,
                r.carId
                  ? `${r.carId.registrationNumber ?? ""}${r.carId.make ? ` · ${r.carId.make}` : ""}`
                  : "—",
                <StatusBadge
                  key="o"
                  label={r.outcome.replace(/_/g, " ")}
                  tone={r.outcome === "success" ? "success" : "warning"}
                />
              ])}
            />
          </Card>
        </div>
      )}
    </div>
  );
};
