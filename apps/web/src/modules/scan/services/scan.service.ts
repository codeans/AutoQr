import { api } from "../../../lib/api";

export type ScanLanding = {
  activated: boolean;
  tag: { id?: string; serial: string; status: string };
  assetType?: "car" | "keys" | null;
  car?: {
    id: string;
    nickname?: string;
    make?: string;
    model?: string;
    color?: string;
    displayMessage?: string;
    maskedRegistration?: string;
  } | null;
  key?: {
    id: string;
    label?: string;
    keyType?: string;
    description?: string;
    returnInstructions?: string;
    image?: string;
  } | null;
  message?: string;
};

export type ScanReason =
  | "wrong_parking"
  | "headlights_on"
  | "flat_tyre"
  | "towing"
  | "door_or_window_open"
  | "car_damaged"
  | "accident"
  | "other";

export const fetchLanding = async (token: string): Promise<ScanLanding> => {
  const { data } = await api.get(`/scan/${token}`);
  return data;
};

export const submitAlert = async (
  token: string,
  payload: {
    reason: ScanReason;
    message?: string;
    reporterName?: string;
    reporterPhone?: string;
    consent: boolean;
    location?: { latitude?: number; longitude?: number; address?: string };
  }
) => {
  const { data } = await api.post(`/scan/${token}/alert`, payload);
  return data;
};

export type OwnerCallSession = {
  incidentId: string;
  ownerUserId: string;
  reporterSessionToken: string;
  reporterPhone: string;
  message: string;
};

export const requestOwnerCall = async (
  token: string,
  payload: { reporterPhone: string; reporterName?: string; reason?: string }
): Promise<OwnerCallSession> => {
  const { data } = await api.post(`/scan/${token}/call`, payload);
  return data;
};
