import { api } from "../../../lib/api";

export const adminService = {
  getDashboard: async () => (await api.get("/admin/dashboard")).data,
  getUsers: async () => (await api.get("/admin/users")).data,
  updateUserStatus: async (id: string, status: string) => (await api.patch(`/admin/users/${id}/status`, { status })).data,
  getVehicles: async () => (await api.get("/admin/vehicles")).data,
  updateVehicleStatus: async (id: string, status: string) => (await api.patch(`/admin/vehicles/${id}/status`, { status })).data,
  getOrders: async () => (await api.get("/admin/orders")).data,
  completeOrder: async (id: string) => (await api.post(`/admin/orders/${id}/complete`)).data,
  getPayments: async () => (await api.get("/admin/payments")).data,
  getQrs: async () => (await api.get("/admin/qrs")).data,
  getQrPreviewBlob: async (id: string) => (await api.get(`/admin/qrs/${id}/preview`, { responseType: "blob" })).data as Blob,
  updateQrStatus: async (id: string, status: string) => (await api.patch(`/admin/qrs/${id}/status`, { status })).data,
  getIncidents: async () => (await api.get("/admin/incidents")).data,
  updateIncident: async (id: string, payload: { status: string; adminNotes?: string; escalationFlag?: boolean }) =>
    (await api.patch(`/admin/incidents/${id}`, payload)).data,
  getCalls: async () => (await api.get("/admin/calls")).data,
  getShipments: async () => (await api.get("/admin/shipments")).data,
  updateShipment: async (id: string, payload: { status: string; courier: string; trackingNumber: string; notes: string }) =>
    (await api.patch(`/admin/shipments/${id}`, payload)).data,
  getContent: async () => (await api.get("/admin/content")).data,
  saveContent: async (payload: { slug: string; title: string; sections: Array<Record<string, unknown>> }) => (await api.put("/admin/content", payload)).data,
  getSettings: async () => (await api.get("/admin/settings")).data,
  saveSetting: async (payload: { key: string; value: string }) => (await api.put("/admin/settings", payload)).data,
  getAuditLogs: async () => (await api.get("/admin/audit-logs")).data
};
