import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, DetailPanel, SecondaryButton } from "../../../components/ui";
import { ActionMenu } from "../components/ActionMenu";
import { DataTable } from "../components/DataTable";
import { DetailDrawer } from "../components/DetailDrawer";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { adminService } from "../services/admin.service";
import { AdminIncident } from "../types/admin.types";
import { assetBase, statusTone } from "../utils/admin.helpers";

export const IncidentsPage = () => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-incidents"],
    queryFn: adminService.getIncidents
  });
  const [selected, setSelected] = useState<AdminIncident | null>(null);
  const [drawer, setDrawer] = useState(false);

  const updateIncident = async (id: string, payload: { status: string; adminNotes?: string; escalationFlag?: boolean }) => {
    await adminService.updateIncident(id, payload);
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Car incidents" subtitle="Evidence-first review flow for car scan incidents with status updates and quick-view panel." />
      <SectionCard title="Car incident list">
        <DataTable
          columns={["Date", "Reporter", "Message", "Status", "Images", "Actions"]}
          rows={(data?.incidents ?? []).map((incident: AdminIncident) => [
            new Date(incident.createdAt).toLocaleString(),
            <div>
              <p className="font-medium text-slate-800">{incident.reporterName || "Anonymous"}</p>
              <p className="text-xs text-slate-500">{incident.reporterPhone || "-"}</p>
            </div>,
            <span className="max-w-xs break-words">{incident.message || "-"}</span>,
            <StatusBadge label={incident.status || "pending"} tone={statusTone(incident.status || "pending")} />,
            <div className="flex items-center gap-2">
              {(incident.images ?? []).slice(0, 2).map((img: string, idx: number) => (
                <a
                  key={`${incident._id}-img-${idx}`}
                  href={`${assetBase}${img}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600"
                >
                  Img
                </a>
              ))}
              {!incident.images?.length && <span className="text-xs text-slate-500">No images</span>}
            </div>,
            <div className="flex items-center gap-2">
              <SecondaryButton
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  setSelected(incident);
                  setDrawer(true);
                }}
              >
                Quick View
              </SecondaryButton>
              <ActionMenu
                actions={[
                  { label: "Resolve", onClick: () => updateIncident(incident._id, { status: "resolved" }) },
                  { label: "Escalate", onClick: () => updateIncident(incident._id, { status: "escalated", escalationFlag: true }), tone: "danger" }
                ]}
              />
            </div>
          ])}
        />
      </SectionCard>

      <DetailDrawer open={drawer} onClose={() => setDrawer(false)} title="Incident quick view">
        {selected && (
          <>
            <DetailPanel title="Reporter">
              <p>
                <strong>Name:</strong> {selected.reporterName || "Anonymous"}
              </p>
              <p>
                <strong>Phone:</strong> {selected.reporterPhone || "-"}
              </p>
            </DetailPanel>
            <DetailPanel title="Linked entities">
              <p>
                <strong>Car owner:</strong> {selected.ownerUserId?.email || "-"}
              </p>
              <p>
                <strong>Car:</strong>{" "}
                {selected.carId?.registrationNumber || "-"}
                {selected.carId?.make ? ` · ${selected.carId.make} ${selected.carId.model ?? ""}` : ""}
              </p>
            </DetailPanel>
            <DetailPanel title="Message">{selected.message || "-"}</DetailPanel>
          </>
        )}
      </DetailDrawer>
    </div>
  );
};
