import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DetailPanel } from "../../../components/ui";
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
import { AdminCar } from "../types/admin.types";
import { statusTone } from "../utils/admin.helpers";

export const CarsPage = () => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: adminService.getCars
  });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminCar | null>(null);
  const [drawer, setDrawer] = useState(false);

  const setStatus = async (id: string, activationStatus: string) => {
    await adminService.updateCar(id, { activationStatus });
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;
  const cars: AdminCar[] = (data?.cars ?? []).filter((car: AdminCar) =>
    [car.registrationNumber, car.make, car.model, car.nickname, car.userId?.name, car.userId?.email]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Cars" subtitle="All registered cars, linked to their owners, tags, and activation state." />
      <FilterBar>
        <SearchInput className="flex-1" placeholder="Search registration, make, model, owner..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </FilterBar>

      <SectionCard title="Quick cards">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cars.slice(0, 8).map((car) => (
            <button
              type="button"
              key={`car-card-${car._id}`}
              onClick={() => {
                setSelected(car);
                setDrawer(true);
              }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-white"
            >
              <p className="font-semibold text-slate-900">{car.registrationNumber || "-"}</p>
              <p className="text-xs text-slate-500">
                {[car.make, car.model].filter(Boolean).join(" ") || car.nickname || "Car"}
              </p>
              <div className="mt-2">
                <StatusBadge label={car.activationStatus || "pending"} tone={statusTone(car.activationStatus || "pending")} />
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Car registration table">
        <DataTable
          columns={["Registration", "Make / Model", "Owner", "Status", "Actions"]}
          rows={cars.map((car) => [
            <span key={`reg-${car._id}`} className="font-mono text-sm text-slate-900">
              {car.registrationNumber || "-"}
            </span>,
            <div key={`mm-${car._id}`}>
              <p className="font-medium text-slate-800">
                {[car.make, car.model].filter(Boolean).join(" ") || "—"}
              </p>
              {car.color && <p className="text-xs text-slate-500">{car.color}{car.year ? ` · ${car.year}` : ""}</p>}
            </div>,
            <div key={`own-${car._id}`}>
              <p className="font-medium text-slate-800">{car.userId?.name || "-"}</p>
              <p className="text-xs text-slate-500">{car.userId?.email || "-"}</p>
            </div>,
            <StatusBadge key={`st-${car._id}`} label={car.activationStatus || "pending"} tone={statusTone(car.activationStatus || "pending")} />,
            <ActionMenu
              key={`act-${car._id}`}
              actions={[
                { label: "Mark activated", onClick: () => setStatus(car._id, "activated") },
                { label: "Deactivate", onClick: () => setStatus(car._id, "deactivated"), tone: "danger" }
              ]}
            />
          ])}
        />
      </SectionCard>

      <DetailDrawer open={drawer} onClose={() => setDrawer(false)} title="Car detail">
        {selected && (
          <>
            <DetailPanel title="Registration">
              <p>
                <strong>Number:</strong> {selected.registrationNumber || "-"}
              </p>
              <p>
                <strong>Make:</strong> {selected.make || "-"}
              </p>
              <p>
                <strong>Model:</strong> {selected.model || "-"}
              </p>
              <p>
                <strong>Colour:</strong> {selected.color || "-"}
              </p>
              <p>
                <strong>Year:</strong> {selected.year ?? "-"}
              </p>
              <p>
                <strong>Nickname:</strong> {selected.nickname || "-"}
              </p>
            </DetailPanel>
            <DetailPanel title="Car owner">
              <p>
                <strong>Name:</strong> {selected.userId?.name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {selected.userId?.email || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {selected.userId?.phone || "-"}
              </p>
            </DetailPanel>
          </>
        )}
      </DetailDrawer>
    </div>
  );
};
