import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Select } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatsCard } from "../components/StatsCard";
import { StatusBadge } from "../components/StatusBadge";
import { adminService } from "../services/admin.service";
import { AdminQr } from "../types/admin.types";
import { statusTone } from "../utils/admin.helpers";

export const ShipmentsPage = () => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-shipments"],
    queryFn: adminService.getShipments
  });
  const [draft, setDraft] = useState<Record<string, { status: string; courier: string; trackingNumber: string; notes: string }>>({});

  const setDraftField = (id: string, field: "status" | "courier" | "trackingNumber" | "notes", value: string) => {
    setDraft((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status || "packed",
        courier: prev[id]?.courier || "",
        trackingNumber: prev[id]?.trackingNumber || "",
        notes: prev[id]?.notes || "",
        [field]: value
      }
    }));
  };

  const save = async (id: string) => {
    const payload = draft[id] || { status: "packed", courier: "", trackingNumber: "", notes: "" };
    await adminService.updateShipment(id, payload);
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;
  const shipments = data?.shipments ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="Shipments" subtitle="Workflow cards and table controls for dispatch, courier data, and progress updates." />
      <div className="grid gap-4 md:grid-cols-4">
        {["packed", "dispatched", "delivered", "activated"].map((status) => (
          <StatsCard key={status} title={status} value={shipments.filter((item: AdminQr) => item.status === status).length} />
        ))}
      </div>

      <SectionCard title="Shipment operations">
        <DataTable
          columns={["QR", "Owner", "Item", "Status", "Courier/Tracking", "Actions"]}
          rows={shipments.map((qr: AdminQr) => [
            qr.internalCode || "-",
            `${qr.userId?.name ?? "-"} / ${qr.userId?.phone ?? "-"}`,
            qr.vehicleOrItemId?.registrationNumber ?? "-",
            <StatusBadge label={qr.status || "packed"} tone={statusTone(qr.status || "packed")} />,
            <div className="space-y-1 text-xs">
              <Input placeholder="Courier" value={draft[qr._id]?.courier || qr.shipmentMeta?.courier || ""} onChange={(e) => setDraftField(qr._id, "courier", e.target.value)} />
              <Input
                placeholder="Tracking no."
                value={draft[qr._id]?.trackingNumber || qr.shipmentMeta?.trackingNumber || ""}
                onChange={(e) => setDraftField(qr._id, "trackingNumber", e.target.value)}
              />
              <Input placeholder="Notes" value={draft[qr._id]?.notes || qr.shipmentMeta?.notes || ""} onChange={(e) => setDraftField(qr._id, "notes", e.target.value)} />
            </div>,
            <div className="space-y-2">
              <Select value={draft[qr._id]?.status || qr.status} onChange={(e) => setDraftField(qr._id, "status", e.target.value)}>
                {["packed", "dispatched", "delivered", "activated", "disabled"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Button className="w-full px-3 py-1.5 text-xs" onClick={() => save(qr._id)}>
                Update Shipment
              </Button>
            </div>
          ])}
        />
      </SectionCard>
    </div>
  );
};
