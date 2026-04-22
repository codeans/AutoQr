import { api } from "../../../lib/api";

export const adminPlatformService = {
  listPlans: async () => (await api.get("/admin/plans")).data.plans,
  upsertPlan: async (payload: any) =>
    (await (payload._id ? api.put(`/admin/plans/${payload._id}`, payload) : api.post("/admin/plans", payload))).data.plan,
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

  listTags: async (filters: Record<string, string> = {}) =>
    (await api.get("/admin/tags", { params: filters })).data.tags,
  disableTag: async (id: string) => (await api.patch(`/admin/tags/${id}/disable`)).data.tag,

  listActivationRecords: async (filters: Record<string, string> = {}) =>
    (await api.get("/admin/tags/activations", { params: filters })).data.records,

  listConsent: async () => (await api.get("/admin/consent")).data.records,

  analyticsSummary: async () => (await api.get("/admin/analytics/summary")).data.metrics,
  analyticsRecent: async () => (await api.get("/admin/analytics/events")).data.events
};
