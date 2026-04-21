import { FormEvent, useState } from "react";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { Timeline } from "../components/Timeline";
import { VehicleCard } from "../components/VehicleCard";
import { useUserVehicles } from "../hooks/useUserVehicles";

export const VehiclesScreen = () => {
  const { data, isLoading, createVehicleMutation } = useUserVehicles();
  const [form, setForm] = useState({ type: "car", registrationNumber: "", details: "" });
  const [frontImage, setFrontImage] = useState<File | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = new FormData();
    payload.set("type", form.type);
    payload.set("registrationNumber", form.registrationNumber);
    payload.set("details", form.details);
    if (frontImage) payload.set("frontImage", frontImage);
    await createVehicleMutation.mutateAsync(payload);
    setForm({ type: "car", registrationNumber: "", details: "" });
    setFrontImage(null);
  };

  if (isLoading) return <LoadingState rows={7} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Register vehicle or item" subtitle="Add ownership details and activate one-time AutoQr lifecycle tracking.">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="text-sm font-medium text-slate-700">
            Type
            <Select value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))} className="mt-1">
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="item">Other Item</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Registration / Identifier
            <Input
              value={form.registrationNumber}
              onChange={(e) => setForm((current) => ({ ...current, registrationNumber: e.target.value }))}
              placeholder="AB-123-CD or item id"
              className="mt-1"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Owner-submitted details
            <Textarea
              value={form.details}
              onChange={(e) => setForm((current) => ({ ...current, details: e.target.value }))}
              placeholder="Color, model, identifiable marks, special notes..."
              className="mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Front image with number plate
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFrontImage(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              required
            />
          </label>
          <Button type="submit" disabled={createVehicleMutation.isPending} className="md:w-fit">
            {createVehicleMutation.isPending ? "Saving..." : "Save vehicle/item"}
          </Button>
        </form>
      </SectionCard>

      {data?.vehicles?.length ? (
        <div className="space-y-4">
          {data.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <EmptyState title="No vehicle registered" message="Register your first vehicle/item to generate and track your AutoQr order." />
      )}

      <SectionCard title="Lifecycle overview" subtitle="Track activation, order linkage, QR generation, and shipment flow by vehicle.">
        <DataTable
          columns={["Identifier", "Type", "QR Lifecycle", "Order Status", "Shipment", "Activation"]}
          rows={(data?.vehicles ?? []).map((vehicle) => [
            <div key={vehicle._id}>
              <p className="font-semibold text-slate-900">{vehicle.registrationNumber}</p>
              <p className="text-xs text-slate-500">{vehicle.details || "No details provided"}</p>
            </div>,
            vehicle.type,
            <StatusBadge status={vehicle.qrStatus} />,
            <StatusBadge status={vehicle.order?.orderStatus || "created"} />,
            <Timeline items={(vehicle.trackingTimeline ?? []).filter((step) => step.reached).map((step) => ({ title: step.status, status: step.status }))} />,
            <StatusBadge status={vehicle.status} />
          ])}
        />
      </SectionCard>
    </div>
  );
};
