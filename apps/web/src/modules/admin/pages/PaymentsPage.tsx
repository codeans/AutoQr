import { useMemo, useState } from "react";
import { Button, DetailPanel, Modal } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatsCard } from "../components/StatsCard";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminPayments } from "../hooks/useAdminPayments";
import { AdminPayment } from "../types/admin.types";
import { statusTone } from "../utils/admin.helpers";

export const PaymentsPage = () => {
  const { data, isLoading } = useAdminPayments();
  const [selected, setSelected] = useState<AdminPayment | null>(null);
  const [modal, setModal] = useState(false);
  const payments = data?.payments ?? [];
  const totalRevenue = useMemo(() => payments.reduce((acc: number, item: AdminPayment) => acc + Number(item.amount || 0), 0), [payments]);

  if (isLoading) return <LoadingState rows={8} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Payments" subtitle="Revenue analytics cards and polished transaction records." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Transactions" value={payments.length} hint="All providers" />
        <StatsCard title="Successful" value={payments.filter((item: AdminPayment) => ["success", "paid"].includes(item.status || "")).length} hint="Captured records" />
        <StatsCard title="Revenue" value={`${totalRevenue} EUR`} hint="Total amount" />
      </div>

      <SectionCard title="Payment table">
        <DataTable
          columns={["Transaction", "Owner", "Amount", "Status", "Provider", "Time", "Actions"]}
          rows={payments.map((payment: AdminPayment) => [
            payment.transactionId || "-",
            payment.userId?.email || "-",
            `${payment.amount} EUR`,
            <StatusBadge label={payment.status || "pending"} tone={statusTone(payment.status || "pending")} />,
            payment.provider || "-",
            new Date(payment.createdAt).toLocaleString(),
            <Button
              className="bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              onClick={() => {
                setSelected(payment);
                setModal(true);
              }}
            >
              Details
            </Button>
          ])}
        />
      </SectionCard>

      <Modal open={modal} onClose={() => setModal(false)} title="Transaction details">
        {selected && (
          <div className="grid gap-3 md:grid-cols-2">
            <DetailPanel title="Identity">
              <p>
                <strong>ID:</strong> {selected.transactionId || "-"}
              </p>
              <p>
                <strong>Provider:</strong> {selected.provider || "-"}
              </p>
              <p>
                <strong>Status:</strong> <StatusBadge label={selected.status || "pending"} tone={statusTone(selected.status || "pending")} />
              </p>
            </DetailPanel>
            <DetailPanel title="Financial">
              <p>
                <strong>Amount:</strong> {selected.amount || 0} EUR
              </p>
              <p>
                <strong>Owner:</strong> {selected.userId?.email || "-"}
              </p>
              <p>
                <strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}
              </p>
            </DetailPanel>
          </div>
        )}
      </Modal>
    </div>
  );
};
