import { ReceiptText } from "lucide-react";
import { Button, Card } from "../../../components/ui";
import { UserOrder } from "../types/user.types";
import { formatCurrency, formatDateTime } from "../utils/user.helpers";
import { StatusBadge } from "./StatusBadge";

type OrderCardProps = {
  order: UserOrder;
  onPayNow?: (orderId: string) => void;
  isProcessing?: boolean;
};

export const OrderCard = ({ order, onPayNow, isProcessing }: OrderCardProps) => (
  <Card className="space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="inline-flex items-center gap-2">
        <ReceiptText className="h-4 w-4 text-action" />
        <div>
          <p className="text-sm font-semibold text-slate-900">AutoQr Purchase</p>
          <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <StatusBadge status={order.orderStatus} />
        <StatusBadge status={order.payment?.status ?? order.paymentStatus} />
      </div>
    </div>
    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
      <p>
        <span className="text-xs text-slate-500">Amount</span>
        <br />
        {formatCurrency(order.amount, order.currency)}
      </p>
      <p>
        <span className="text-xs text-slate-500">Invoice</span>
        <br />
        {order.invoiceNumber || "Pending"}
      </p>
      <p>
        <span className="text-xs text-slate-500">Lifetime status</span>
        <br />
        {order.orderStatus === "delivered" ? "Lifetime active" : "In progress"}
      </p>
    </div>
    {onPayNow && order.paymentStatus === "pending" ? (
      <Button disabled={isProcessing} onClick={() => onPayNow(order._id)}>
        {isProcessing ? "Redirecting..." : "Pay now"}
      </Button>
    ) : null}
  </Card>
);
