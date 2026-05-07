import { api } from "../../../lib/api";

export type IncidentLocationSubmit =
  | {
      mode: "gps";
      latitude: number;
      longitude: number;
      accuracyMeters: number;
      capturedAt: string;
      permissionStatus: "granted";
    }
  | {
      mode: "server_fallback";
      permissionStatus: "fallback_used";
      gpsFailureReason?: "timeout" | "position_unavailable" | "unknown";
    };

export type SubmitIncidentPayload = {
  token: string;
  reporterName: string;
  reporterPhoneE164: string;
  message: string;
  files: File[];
  location: IncidentLocationSubmit;
};

export type SubmittedIncident = {
  id: string;
  status: string;
  reporterPhone: string;
  ownerUserId: string;
  reporterSessionToken: string;
  images: string[];
  imageCount: number;
  createdAt: string;
};

export const submitIncident = async (payload: SubmitIncidentPayload): Promise<SubmittedIncident> => {
  const body = new FormData();
  body.set("reporterName", payload.reporterName);
  body.set("reporterPhone", payload.reporterPhoneE164);
  body.set("message", payload.message);
  body.set("consent", "true");
  body.set("location", JSON.stringify(payload.location));
  payload.files.forEach((file) => body.append("images", file));
  const { data } = await api.post(`/public/incident/${payload.token}`, body, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.incident as SubmittedIncident;
};

export type ReporterIncidentView = {
  incident: {
    id: string;
    ownerUserId: string;
    reporterPhone: string;
    message: string;
    images: string[];
    createdAt: string;
    car: { make: string; model: string; nickname: string; color: string } | null;
    key?: { label: string; keyType: string; description?: string; returnInstructions?: string; image?: string } | null;
    linkedAssetType?: string | null;
  };
  latestCall: {
    id: string;
    status: string;
    duration?: number;
    endReason?: string;
    createdAt: string;
  } | null;
};

export const fetchReporterIncident = async (incidentId: string, sessionToken: string) => {
  const { data } = await api.get<ReporterIncidentView>(`/public/reporter/incident/${incidentId}`, {
    params: { sessionToken }
  });
  return data;
};
