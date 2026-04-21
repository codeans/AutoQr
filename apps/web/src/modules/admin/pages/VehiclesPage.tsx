import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, DetailPanel } from "../../../components/ui";
import { ActionMenu } from "../components/ActionMenu";
import { DataTable } from "../components/DataTable";
import { DetailDrawer } from "../components/DetailDrawer";
import { FilterBar } from "../components/FilterBar";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SearchInput } from "../components/SearchInput";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { adminService } from "../services/admin.service";
import { AdminVehicle } from "../types/admin.types";
import { assetBase, statusTone } from "../utils/admin.helpers";

export const VehiclesPage = () => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: adminService.getVehicles
  });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminVehicle | null>(null);
  const [drawer, setDrawer] = useState(false);

  const setStatus = async (id: string, status: string) => {
    await adminService.updateVehicleStatus(id, status);
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;
  const vehicles = (data?.vehicles ?? []).filter((vehicle: AdminVehicle) =>
    [vehicle.registrationNumber, vehicle.type, vehicle.userId?.name, vehicle.userId?.email].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Vehicles & Items" subtitle="Card-table hybrid view with owner linkage, statuses, and image previews." />
      <FilterBar>
        <SearchInput className="flex-1" placeholder="Search registration, owner, email..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </FilterBar>

      <SectionCard title="Quick cards">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {vehicles.slice(0, 8).map((vehicle: AdminVehicle) => (
            <button
              type="button"
              key={`vehicle-card-${vehicle._id}`}
              onClick={() => {
                setSelected(vehicle);
                setDrawer(true);
              }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-white"
            >
              <p className="font-semibold text-slate-900">{vehicle.registrationNumber || "-"}</p>
              <p className="text-xs text-slate-500">{vehicle.type || "Item"}</p>
              <div className="mt-2">
                <StatusBadge label={vehicle.status || "pending"} tone={statusTone(vehicle.status || "pending")} />
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Registration table">
        <DataTable
          columns={["Registration", "Type", "Owner", "Status", "Image", "Actions"]}
          rows={vehicles.map((vehicle: AdminVehicle) => [
            vehicle.registrationNumber || "-",
            vehicle.type || "Vehicle",
            <div>
              <p className="font-medium text-slate-800">{vehicle.userId?.name || "-"}</p>
              <p className="text-xs text-slate-500">{vehicle.userId?.email || "-"}</p>
            </div>,
            <StatusBadge label={vehicle.status || "pending"} tone={statusTone(vehicle.status || "pending")} />,
            vehicle.frontImage ? (
              <a href={`${assetBase}${vehicle.frontImage}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-700 underline">
                Preview
              </a>
            ) : (
              <span className="text-xs text-slate-500">No image</span>
            ),
            <ActionMenu
              actions={[
                { label: "Approve", onClick: () => setStatus(vehicle._id, "paid") },
                { label: "Request Fix", onClick: () => setStatus(vehicle._id, "pending_payment"), tone: "danger" }
              ]}
            />
          ])}
        />
      </SectionCard>

      <DetailDrawer open={drawer} onClose={() => setDrawer(false)} title="Vehicle detail">
        {selected && (
          <>
            <DetailPanel title="Registration">
              <p>
                <strong>Number:</strong> {selected.registrationNumber || "-"}
              </p>
              <p>
                <strong>Type:</strong> {selected.type || "-"}
              </p>
            </DetailPanel>
            <DetailPanel title="Owner details">
              <p>
                <strong>Name:</strong> {selected.userId?.name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {selected.userId?.email || "-"}
              </p>
            </DetailPanel>
          </>
        )}
      </DetailDrawer>
    </div>
  );
};
