import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { OrderCard } from "../components/OrderCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { Timeline } from "../components/Timeline";
import { useUserOrders } from "../hooks/useUserOrders";
import { formatCurrency, formatDateTime } from "../utils/user.helpers";

export const OrdersScreen = () => {
  const { data, isLoading, checkoutMutation } = useUserOrders();

  const onPayNow = async (orderId: string) => {
    const payload = await checkoutMutation.mutateAsync(orderId);
    if (payload.url) window.location.href = payload.url;
  };

  if (isLoading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      {data?.orders?.length ? (
        <div className="space-y-4">
          {data.orders.map((order) => (
            <OrderCard key={order._id} order={order} onPayNow={onPayNow} isProcessing={checkoutMutation.isPending} />
          ))}
        </div>
      ) : (
        <EmptyState title="No orders yet" message="Your one-time AutoQr purchase details will appear here after registration." />
      )}

      <SectionCard title="Order and payment table" subtitle="Understand payment state, invoice availability, and overall order status.">
        <DataTable
          columns={["Order date", "Amount", "Payment", "Order", "Invoice", "QR generation"]}
          rows={(data?.orders ?? []).map((order) => [
            formatDateTime(order.createdAt),
            formatCurrency(order.amount, order.currency),
            <StatusBadge status={order.payment?.status ?? order.paymentStatus} />,
            <StatusBadge status={order.orderStatus} />,
            order.invoiceNumber || "Pending",
            order.paymentStatus === "success" ? "Generated/Active soon" : "Waiting payment"
          ])}
        />
      </SectionCard>

      <SectionCard title="Print and delivery timeline" subtitle="Visibility into print, dispatch, and delivery lifecycle until lifetime activation.">
        <Timeline
          items={[
            { title: "paid", status: data?.orders?.some((order) => order.paymentStatus === "success") ? "success" : "pending" },
            { title: "qr_generated", status: data?.orders?.some((order) => order.orderStatus === "processing") ? "info" : "pending" },
            { title: "dispatched", status: data?.orders?.some((order) => order.orderStatus === "dispatched") ? "warning" : "pending" },
            { title: "delivered", status: data?.orders?.some((order) => order.orderStatus === "delivered") ? "success" : "pending" },
            { title: "activated", description: "Lifetime active after completion", status: "active" }
          ]}
        />
      </SectionCard>
    </div>
  );
};
