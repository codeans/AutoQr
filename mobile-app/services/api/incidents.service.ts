import { apiClient } from "./client";
import type { CallSession, Incident, ScanEvent } from "@/types/domain";

export async function listIncidents(): Promise<Incident[]> {
  const res = await apiClient.get<{ incidents: Incident[] }>("/owner/incidents");
  return res.incidents ?? [];
}

export async function getIncident(id: string): Promise<{
  incident: Incident;
  calls: CallSession[];
}> {
  const res = await apiClient.get<{ incident: Incident; calls: CallSession[] }>(
    `/owner/incidents/${id}`
  );
  return { incident: res.incident, calls: res.calls ?? [] };
}

export async function listScanAlerts(): Promise<ScanEvent[]> {
  const res = await apiClient.get<{ scans: ScanEvent[] }>("/owner/scan/alerts");
  return res.scans ?? [];
}

export async function acknowledgeScan(id: string): Promise<ScanEvent> {
  const res = await apiClient.post<{ scan: ScanEvent }>(`/owner/scan/alerts/${id}/ack`, {});
  return res.scan;
}

export async function listCalls(): Promise<CallSession[]> {
  const res = await apiClient.get<{ calls: CallSession[] }>("/owner/calls");
  return res.calls ?? [];
}
