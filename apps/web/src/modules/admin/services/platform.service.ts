import { api } from "../../../lib/api";

export const adminPlatformService = {
  listPlans: async () => (await api.get("/admin/plans")).data.plans,
  upsertPlan: async (payload: any) =>
    (await (payload._id ? api.put(`/admin/plans/${payload._id}`, payload) : api.post("/admin/plans", payload))).data.plan,
  updatePlanPricing: async (
    id: string,
    body: { priceCents: number; compareAtCents?: number; currency?: "EUR" }
  ) => (await api.patch(`/admin/plans/${id}/pricing`, body)).data.plan,
  archivePlan: async (id: string) => (await api.delete(`/admin/plans/${id}`)).data.plan,

  listBatches: async () => (await api.get("/admin/tags/batches")).data.batches,
  createBatch: async (payload: { label: string; quantity: number; notes?: string }) =>
    (await api.post("/admin/tags/batches", payload)).data.batch,
  updateBatchStatus: async (id: string, status: string) =>
    (await api.patch(`/admin/tags/batches/${id}/status`, { status })).data.batch,
  exportBatchCsv: async (id: string) => {
    const res = await api.get(`/admin/tags/batches/${id}/export`, {
      params: { format: "csv" },
      responseType: "blob"
    });
    return res.data as Blob;
  },
  exportBatchJson: async (id: string) =>
    (await api.get(`/admin/tags/batches/${id}/export`, { params: { format: "json" } })).data,

  listTags: async (filters: Record<string, string | number | undefined> = {}) =>
    (await api.get("/admin/tags", { params: filters })).data.tags,

  /** Print-ready merged PDF (vector QR, A4 grid). Server streams; keep maxTags within vendor limits. */
  downloadBulkStickerPdf: async (payload: {
    batchId?: string;
    status?: string;
    serialFrom?: string;
    serialTo?: string;
    tagIds?: string[];
    maxTags?: number;
    layoutPreset?: "a4_20" | "a4_28" | "a4_40";
    drawCutGuides?: boolean;
  }) => {
    const res = await api.post("/admin/tags/print-pdf", payload, { responseType: "blob" });
    return res.data as Blob;
  },

  disableTag: async (id: string) => (await api.patch(`/admin/tags/${id}/disable`)).data.tag,

  listActivationRecords: async (filters: Record<string, string> = {}) =>
    (await api.get("/admin/tags/activations", { params: filters })).data.records,

  listConsent: async () => (await api.get("/admin/consent")).data.records,

  analyticsSummary: async () => (await api.get("/admin/analytics/summary")).data.metrics,
  analyticsRecent: async () => (await api.get("/admin/analytics/events")).data.events
};
