import { submitIncident } from "../../../features/calls/services/incidentApi";
import type { SubmitIncidentPayload } from "../../../features/calls/services/incidentApi";

const STORAGE_KEY = "autoqr:incident-submit-queue";

export type SerializedQueuedIncident = Omit<SubmitIncidentPayload, "files"> & {
  imageDataUrls: string[];
  queuedAt: string;
};

async function filesToDataUrls(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(
      await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      })
    );
  }
  return urls;
}

async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "application/octet-stream" });
}

export async function enqueueOfflineIncidentDraft(payload: SubmitIncidentPayload): Promise<void> {
  const serial: SerializedQueuedIncident = {
    token: payload.token,
    reporterName: payload.reporterName,
    reporterPhoneE164: payload.reporterPhoneE164,
    message: payload.message,
    location: payload.location,
    imageDataUrls: await filesToDataUrls(payload.files),
    queuedAt: new Date().toISOString()
  };
  const existing = loadQueueRaw();
  existing.push(serial);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

function loadQueueRaw(): SerializedQueuedIncident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SerializedQueuedIncident[]) : [];
  } catch {
    return [];
  }
}

export function peekIncidentQueue(): SerializedQueuedIncident[] {
  return loadQueueRaw();
}

export function persistQueue(items: SerializedQueuedIncident[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Sends queued drafts (e.g. after reconnect). Keeps failed items in storage. */
export async function flushIncidentSubmitQueue(): Promise<void> {
  const q = peekIncidentQueue();
  if (q.length === 0) return;
  const failed: SerializedQueuedIncident[] = [];
  for (const item of q) {
    try {
      const payload = await queuedItemToSubmitPayload(item);
      await submitIncident(payload);
    } catch {
      failed.push(item);
    }
  }
  persistQueue(failed);
}

export async function queuedItemToSubmitPayload(item: SerializedQueuedIncident): Promise<SubmitIncidentPayload> {
  const files = await Promise.all(
    item.imageDataUrls.map((url, i) => dataUrlToFile(url, `photo-${i + 1}.jpg`))
  );
  return {
    token: item.token,
    reporterName: item.reporterName,
    reporterPhoneE164: item.reporterPhoneE164,
    message: item.message,
    location: item.location,
    files
  };
}
