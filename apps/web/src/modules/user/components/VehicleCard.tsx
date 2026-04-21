import { CarFront, Package } from "lucide-react";
import { Card } from "../../../components/ui";
import { assetBaseUrl } from "../../../lib/runtimeConfig";
import { UserVehicle } from "../types/user.types";
import { prettifyStatus } from "../utils/user.helpers";
import { StatusBadge } from "./StatusBadge";

const apiBase = assetBaseUrl;

export const VehicleCard = ({ vehicle }: { vehicle: UserVehicle }) => (
  <Card className="overflow-hidden p-0">
    <div className="grid md:grid-cols-[220px_1fr]">
      <div className="h-48 bg-slate-100 md:h-full">
        {vehicle.frontImage ? (
          <img src={`${apiBase}${vehicle.frontImage}`} alt={vehicle.registrationNumber} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Package className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{prettifyStatus(vehicle.type)}</p>
            <h3 className="text-lg font-semibold text-slate-900">{vehicle.registrationNumber}</h3>
          </div>
          <CarFront className="h-5 w-5 text-action" />
        </div>
        <p className="text-sm text-slate-600">{vehicle.details || "No additional details submitted."}</p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={vehicle.status} />
          <StatusBadge status={vehicle.qrStatus} />
          <StatusBadge status={vehicle.order?.paymentStatus ?? "pending"} />
        </div>
        {vehicle.shipmentMeta?.trackingNumber ? (
          <p className="text-xs text-slate-500">Tracking #{vehicle.shipmentMeta.trackingNumber}</p>
        ) : null}
      </div>
    </div>
  </Card>
);
