import { api } from "../../../lib/api";

export const adminService = {
  getDashboard: async () => (await api.get("/admin/dashboard")).data,
  getUsers: async () => (await api.get("/admin/users")).data,
  updateUserStatus: async (id: string, status: string) => (await api.patch(`/admin/users/${id}/status`, { status })).data,
  getCars: async () => (await api.get("/admin/cars")).data,
  updateCar: async (id: string, payload: Record<string, unknown>) => (await api.patch(`/admin/cars/${id}`, payload)).data,
  getOrders: async () => (await api.get("/admin/orders")).data,
  completeOrder: async (id: string) => (await api.post(`/admin/orders/${id}/complete`)).data,
  getPayments: async () => (await api.get("/admin/payments")).data,
  getIncidents: async () => (await api.get("/admin/incidents")).data,
  updateIncident: async (id: string, payload: { status: string; adminNotes?: string; escalationFlag?: boolean }) =>
    (await api.patch(`/admin/incidents/${id}`, payload)).data,
  getCalls: async () => (await api.get("/admin/calls")).data,
  getCallbacks: async () => (await api.get("/admin/callbacks")).data,
  getShipments: async () => (await api.get("/admin/shipments")).data,
  updateShipment: async (id: string, payload: { status: string; courier: string; trackingNumber: string; notes: string }) =>
    (await api.patch(`/admin/shipments/${id}`, payload)).data,
  getContent: async () => (await api.get("/admin/content")).data,
  saveContent: async (payload: {
    slug: string;
    title?: string;
    title_de?: string;
    title_en?: string;
    sections?: Array<Record<string, unknown>>;
    sections_de?: Array<Record<string, unknown>>;
    sections_en?: Array<Record<string, unknown>>;
    body?: { de?: string; en?: string };
    published?: boolean;
  }) => (await api.put("/admin/content", payload)).data,
  getSettings: async () => (await api.get("/admin/settings")).data,
  saveSetting: async (payload: { key: string; value: string }) => (await api.put("/admin/settings", payload)).data,
  getAuditLogs: async () => (await api.get("/admin/audit-logs")).data
};
