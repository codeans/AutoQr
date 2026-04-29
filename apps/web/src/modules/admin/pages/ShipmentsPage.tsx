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
import { AdminUser } from "../types/admin.types";
import { statusTone } from "../utils/admin.helpers";

interface ShipmentTag {
  _id: string;
  serial?: string;
  status?: string;
  ownerUserId?: AdminUser;
  orderId?: {
    _id?: string;
    shippingAddress?: {
      fullName?: string;
      city?: string;
      country?: string;
    };
    fulfillment?: {
      courier?: string;
      trackingNumber?: string;
      notes?: string;
    };
  };
}

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
        status: prev[id]?.status || "printed",
        courier: prev[id]?.courier || "",
        trackingNumber: prev[id]?.trackingNumber || "",
        notes: prev[id]?.notes || "",
        [field]: value
      }
    }));
  };

  const save = async (id: string) => {
    const payload = draft[id] || { status: "printed", courier: "", trackingNumber: "", notes: "" };
    await adminService.updateShipment(id, payload);
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;
  const shipments: ShipmentTag[] = data?.shipments ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="Car tag shipments" subtitle="Dispatch car QR stickers to car owners — courier data, tracking numbers, and progress updates." />
      <div className="grid gap-4 md:grid-cols-4">
        {["printed", "dispatched", "unlinked", "activated"].map((status) => (
          <StatsCard key={status} title={status.replace(/_/g, " ")} value={shipments.filter((item) => item.status === status).length} />
        ))}
      </div>

      <SectionCard title="Shipment operations">
        <DataTable
          columns={["Tag serial", "Car owner", "Destination", "Status", "Courier/Tracking", "Actions"]}
          rows={shipments.map((tag) => [
            tag.serial || "-",
            <div key={`own-${tag._id}`}>
              <p className="font-medium text-slate-800">{tag.ownerUserId?.name ?? "-"}</p>
              <p className="text-xs text-slate-500">{tag.ownerUserId?.email ?? "-"}</p>
              <p className="text-xs text-slate-500">{tag.ownerUserId?.phone ?? "-"}</p>
            </div>,
            <div key={`dest-${tag._id}`} className="text-xs text-slate-600">
              {tag.orderId?.shippingAddress
                ? `${tag.orderId.shippingAddress.fullName ?? ""} · ${tag.orderId.shippingAddress.city ?? ""} ${tag.orderId.shippingAddress.country ?? ""}`
                : "-"}
            </div>,
            <StatusBadge key={`st-${tag._id}`} label={(tag.status || "packed").replace(/_/g, " ")} tone={statusTone(tag.status || "packed")} />,
            <div key={`fields-${tag._id}`} className="space-y-1 text-xs">
              <Input placeholder="Courier" value={draft[tag._id]?.courier ?? tag.orderId?.fulfillment?.courier ?? ""} onChange={(e) => setDraftField(tag._id, "courier", e.target.value)} />
              <Input
                placeholder="Tracking no."
                value={draft[tag._id]?.trackingNumber ?? tag.orderId?.fulfillment?.trackingNumber ?? ""}
                onChange={(e) => setDraftField(tag._id, "trackingNumber", e.target.value)}
              />
              <Input placeholder="Notes" value={draft[tag._id]?.notes ?? tag.orderId?.fulfillment?.notes ?? ""} onChange={(e) => setDraftField(tag._id, "notes", e.target.value)} />
            </div>,
            <div key={`act-${tag._id}`} className="space-y-2">
              <Select value={draft[tag._id]?.status || "printed"} onChange={(e) => setDraftField(tag._id, "status", e.target.value)}>
                {["printed", "dispatched", "unlinked"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Button className="w-full px-3 py-1.5 text-xs" onClick={() => save(tag._id)}>
                Update shipment
              </Button>
            </div>
          ])}
        />
      </SectionCard>
    </div>
  );
};
