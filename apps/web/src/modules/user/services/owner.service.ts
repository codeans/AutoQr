import { api } from "../../../lib/api";

export type OwnerTag = {
  _id: string;
  serial: string;
  publicToken: string;
  activationCode: string;
  status: string;
  carId?: string;
  keyId?: string;
  linkedAssetType?: "car" | "keys" | null;
  activatedAt?: string;
  lastScanAt?: string;
  scanCount?: number;
};

export type OwnerCar = {
  _id: string;
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  nickname?: string;
  displayMessage?: string;
  plateImage?: string;
  activationStatus?: string;
  isPrimary?: boolean;
  activeTagId?: string;
  tags?: OwnerTag[];
};

export type OwnerEmergencyContact = {
  _id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: number;
  notifyOnEmergencyOnly: boolean;
  isVerified: boolean;
};

export type OwnerScanAlert = {
  _id: string;
  reason: string;
  severity: "info" | "urgent" | "emergency";
  message: string;
  reporterPhone?: string;
  reporterName?: string;
  status: string;
  createdAt: string;
  carId?: string;
  tagId?: string;
  location?: { latitude?: number; longitude?: number; address?: string };
};

type CarPayload = {
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  nickname?: string;
};

export const ownerService = {
  listTags: async () => {
    const { data } = await api.get<{ tags: OwnerTag[] }>("/owner/tags");
    return data.tags;
  },
  activateTag: async (payload: {
    activationCode: string;
    assetType?: "car" | "keys";
    carId?: string;
    carPayload?: CarPayload;
    keyPayload?: {
      label: string;
      keyType: string;
      description?: string;
      returnInstructions?: string;
      image?: string;
    };
  }) => {
    const { data } = await api.post("/owner/tags/activate", payload);
    return data;
  },
  activateTagWithImage: async (payload: {
    activationCode: string;
    carId?: string;
    carPayload?: CarPayload;
    plateImage?: File | null;
  }) => {
    const form = new FormData();
    form.append("activationCode", payload.activationCode);
    if (payload.carId) form.append("carId", payload.carId);
    if (payload.carPayload) form.append("carPayload", JSON.stringify(payload.carPayload));
    if (payload.plateImage) form.append("plateImage", payload.plateImage);
    const { data } = await api.post("/owner/tags/activate-with-image", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  listActivationHistory: async () => {
    const { data } = await api.get("/owner/tags/activations");
    return data.records as Array<{
      _id: string;
      serial: string;
      activationCode: string;
      outcome: string;
      createdAt: string;
      carId?: { registrationNumber?: string; make?: string; model?: string; nickname?: string } | null;
      tagId?: { serial?: string; publicToken?: string } | null;
    }>;
  },
  listCars: async () => {
    const { data } = await api.get<{ cars: OwnerCar[] }>("/owner/cars");
    return data.cars;
  },
  createCar: async (payload: Partial<OwnerCar>) => {
    const { data } = await api.post<{ car: OwnerCar }>("/owner/cars", payload);
    return data.car;
  },
  updateCar: async (id: string, payload: Partial<OwnerCar>) => {
    const { data } = await api.put<{ car: OwnerCar }>(`/owner/cars/${id}`, payload);
    return data.car;
  },
  deleteCar: async (id: string) => {
    await api.delete(`/owner/cars/${id}`);
  },
  makePrimary: async (id: string) => {
    const { data } = await api.post<{ car: OwnerCar }>(`/owner/cars/${id}/primary`);
    return data.car;
  },
  listEmergencyContacts: async () => {
    const { data } = await api.get<{ contacts: OwnerEmergencyContact[] }>("/owner/emergency-contacts");
    return data.contacts;
  },
  createEmergencyContact: async (payload: Partial<OwnerEmergencyContact>) => {
    const { data } = await api.post<{ contact: OwnerEmergencyContact }>("/owner/emergency-contacts", payload);
    return data.contact;
  },
  updateEmergencyContact: async (id: string, payload: Partial<OwnerEmergencyContact>) => {
    const { data } = await api.put<{ contact: OwnerEmergencyContact }>(`/owner/emergency-contacts/${id}`, payload);
    return data.contact;
  },
  deleteEmergencyContact: async (id: string) => {
    await api.delete(`/owner/emergency-contacts/${id}`);
  },
  listScanAlerts: async () => {
    const { data } = await api.get<{ scans: OwnerScanAlert[] }>("/owner/scan/alerts");
    return data.scans;
  },
  acknowledgeScan: async (id: string) => {
    const { data } = await api.post(`/owner/scan/alerts/${id}/ack`);
    return data.scan;
  }
};
