import { useState } from "react";
import { Button } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SearchInput } from "../components/SearchInput";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminOrders } from "../hooks/useAdminOrders";
import { adminService } from "../services/admin.service";
import { AdminOrder } from "../types/admin.types";
import { statusTone } from "../utils/admin.helpers";

export const OrdersPage = () => {
  const { data, refetch, isLoading } = useAdminOrders();
  const [query, setQuery] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  if (isLoading) return <LoadingState rows={8} />;

  const orders = (data?.orders ?? []).filter((order: AdminOrder) =>
    [order.userId?.name, order.vehicleOrItemId?.registrationNumber, order.paymentStatus, order.orderStatus]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const markOrderAsComplete = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      await adminService.completeOrder(orderId);
      await refetch();
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Orders" subtitle="Professional order board with payment chips, amounts, and timeline hints." />
      <FilterBar>
        <SearchInput className="flex-1" placeholder="Search owner, item, status..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </FilterBar>
      <SectionCard title="Order records">
        <DataTable
          columns={["Owner", "Item", "Amount", "Payment", "Order", "Timeline", "Created", "Actions"]}
          rows={orders.map((order: AdminOrder) => [
            order.userId?.name ?? "-",
            order.vehicleOrItemId?.registrationNumber ?? "-",
            `${order.amount} ${order.currency}`,
            <StatusBadge label={order.paymentStatus || "pending"} tone={statusTone(order.paymentStatus || "pending")} />,
            <StatusBadge label={order.orderStatus || "pending"} tone={statusTone(order.orderStatus || "pending")} />,
            <div className="text-xs text-slate-500">
              <p>1. Created</p>
              <p>2. Payment {order.paymentStatus || "pending"}</p>
              <p>3. Fulfillment queue</p>
            </div>,
            new Date(order.createdAt).toLocaleString(),
            <Button
              className="px-3 py-1.5 text-xs"
              onClick={() => markOrderAsComplete(order._id)}
              disabled={processingOrderId === order._id || order.paymentStatus === "success"}
            >
              {processingOrderId === order._id ? "Completing..." : order.paymentStatus === "success" ? "Completed" : "Mark as Complete"}
            </Button>
          ])}
        />
      </SectionCard>
    </div>
  );
};
