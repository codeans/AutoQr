import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, DetailPanel, Modal, Select, Timeline } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { DetailDrawer } from "../components/DetailDrawer";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { adminService } from "../services/admin.service";
import { AdminQr } from "../types/admin.types";
import { blobToDataUrl, escapeHtml, statusTone } from "../utils/admin.helpers";

export const QRsPage = () => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-qrs"],
    queryFn: adminService.getQrs
  });
  const [selected, setSelected] = useState<AdminQr | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const previewQuery = useQuery({
    queryKey: ["admin-qr-preview", selected?._id],
    enabled: previewModal && !!selected?._id,
    queryFn: async () => adminService.getQrPreviewBlob(selected?._id || "")
  });

  useEffect(() => {
    if (!previewQuery.data) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(previewQuery.data);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [previewQuery.data]);

  const updateStatus = async (id: string, status: string) => {
    await adminService.updateQrStatus(id, status);
    await refetch();
  };

  const printQr = async (qr: AdminQr) => {
    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (!printWindow) return;
    printWindow.opener = null;
    const internalCode = escapeHtml(qr.internalCode || "");
    printWindow.document.write("<!doctype html><title>Loading QR...</title><p>Loading QR...</p>");
    printWindow.document.close();

    try {
      const qrBlob = await adminService.getQrPreviewBlob(qr._id);
      const qrDataUrl = await blobToDataUrl(qrBlob);
      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>Print QR ${internalCode}</title>
            <style>
              body { margin: 0; font-family: Arial, sans-serif; display: grid; place-items: center; min-height: 100vh; }
              .wrap { text-align: center; padding: 24px; }
              img { max-width: min(90vw, 720px); height: auto; }
              .code { margin-top: 12px; font-size: 14px; color: #334155; }
              @media print { .code { color: #000; } }
            </style>
          </head>
          <body>
            <div class="wrap">
              <img src="${qrDataUrl}" alt="QR ${internalCode}" onload="window.print();" />
              <div class="code">${internalCode}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      printWindow.document.open();
      printWindow.document.write("<!doctype html><title>QR unavailable</title><p>QR image could not be loaded.</p>");
      printWindow.document.close();
    }
  };

  const downloadQr = async (qr: AdminQr) => {
    const qrBlob = await adminService.getQrPreviewBlob(qr._id);
    const objectUrl = URL.createObjectURL(qrBlob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${qr.internalCode || "qr"}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  };

  if (isLoading) return <LoadingState rows={8} />;
  const qrs = data?.qrs ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="QR Management" subtitle="Lifecycle controls with admin-only preview, print/download actions, and status management." />
      <SectionCard title="Lifecycle summary">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {["generated", "printed", "packed", "dispatched"].map((status) => (
            <div key={status} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold capitalize text-slate-800">{status}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{qrs.filter((qr: AdminQr) => qr.status === status).length}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="QR records">
        <DataTable
          columns={["Code", "Owner", "Item", "Status", "Update", "Actions", "Download"]}
          rows={qrs.map((qr: AdminQr) => [
            qr.internalCode || "-",
            qr.userId?.email || "-",
            qr.vehicleOrItemId?.registrationNumber || "-",
            <StatusBadge label={qr.status || "generated"} tone={statusTone(qr.status || "generated")} />,
            <Select value={qr.status} onChange={(e) => updateStatus(qr._id, e.target.value)}>
              {["generated", "printed", "packed", "dispatched", "delivered", "activated", "disabled"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>,
            <div className="flex gap-2">
              <Button
                className="bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                onClick={() => {
                  setSelected(qr);
                  setPreviewModal(true);
                }}
              >
                Preview QR
              </Button>
              <Button className="px-3 py-1.5 text-xs" onClick={() => printQr(qr)}>
                Print QR
              </Button>
              <Button
                className="bg-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                onClick={() => {
                  setSelected(qr);
                  setDrawer(true);
                }}
              >
                Details
              </Button>
            </div>,
            <button type="button" onClick={() => downloadQr(qr)} className="text-sm font-semibold text-slate-700 underline">
              Download
            </button>
          ])}
        />
      </SectionCard>

      <Modal open={previewModal} onClose={() => setPreviewModal(false)} title="QR Preview">
        {selected && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {previewQuery.isLoading && <LoadingState rows={3} />}
              {previewQuery.isError && <EmptyState title="Preview unavailable" message="The QR image could not be loaded." />}
              {previewUrl && !previewQuery.isLoading && (
                <img src={previewUrl} alt={`QR ${selected.internalCode || ""}`} className="mx-auto h-auto w-full max-w-md rounded-lg bg-white p-2" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">{selected.internalCode || "-"}</p>
              <Button className="px-3 py-1.5 text-xs" onClick={() => printQr(selected)}>
                Print QR
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <DetailDrawer open={drawer} onClose={() => setDrawer(false)} title="QR detail">
        {selected && (
          <>
            <DetailPanel title="QR data">
              <p>
                <strong>Code:</strong> {selected.internalCode || "-"}
              </p>
              <p>
                <strong>Owner:</strong> {selected.userId?.email || "-"}
              </p>
              <p>
                <strong>Item:</strong> {selected.vehicleOrItemId?.registrationNumber || "-"}
              </p>
            </DetailPanel>
            <DetailPanel title="Lifecycle timeline">
              <Timeline
                items={["generated", "printed", "packed", "dispatched", "delivered", "activated", "disabled"].map((step) => ({
                  title: step,
                  description: selected.status === step ? "Current state" : "Lifecycle stage",
                  tone: selected.status === step ? "success" : "neutral"
                }))}
              />
            </DetailPanel>
          </>
        )}
      </DetailDrawer>
    </div>
  );
};
