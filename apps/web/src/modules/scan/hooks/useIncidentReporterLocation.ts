import { useCallback, useState } from "react";

import type { IncidentLocationSubmit } from "../../../features/calls/services/incidentApi";

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0
};

const RETRY_DELAY_MS = 450;
export const GPS_MAX_AGE_MS = 10 * 60 * 1000;

export type LocationAcquireOutcome =
  | { kind: "gps"; latitude: number; longitude: number; accuracyMeters: number; capturedAt: string }
  | { kind: "fallback"; failureReason: "timeout" | "position_unavailable" | "unknown" }
  | { kind: "denied" }
  | { kind: "unsupported" };

/** GeolocationPositionError codes: 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT */
function isPermissionDenied(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 1;
}

function mapFailureReason(err: unknown): "timeout" | "position_unavailable" | "unknown" {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: number }).code;
    if (code === 3) return "timeout";
    if (code === 2) return "position_unavailable";
  }
  return "unknown";
}

function getCurrentPositionOnce(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("NO_GEO"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, GEO_OPTIONS);
  });
}

/**
 * At least 2 retries after failure → 3 attempts total.
 */
export async function acquireReporterGpsPosition(): Promise<LocationAcquireOutcome> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { kind: "unsupported" };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const pos = await getCurrentPositionOnce();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy;
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(acc)) {
        lastError = new Error("INVALID_COORDS");
        continue;
      }
      return {
        kind: "gps",
        latitude: lat,
        longitude: lng,
        accuracyMeters: Math.max(acc, 1),
        capturedAt: new Date().toISOString()
      };
    } catch (err) {
      lastError = err;
      if (isPermissionDenied(err)) {
        return { kind: "denied" };
      }
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  return { kind: "fallback", failureReason: mapFailureReason(lastError) };
}

export function isGpsCaptureStale(capturedAtIso: string, nowMs: number = Date.now()): boolean {
  const t = Date.parse(capturedAtIso);
  if (Number.isNaN(t)) return true;
  return nowMs - t > GPS_MAX_AGE_MS;
}

export function toSubmitPayload(outcome: LocationAcquireOutcome): IncidentLocationSubmit | null {
  if (outcome.kind === "gps") {
    return {
      mode: "gps",
      latitude: outcome.latitude,
      longitude: outcome.longitude,
      accuracyMeters: outcome.accuracyMeters,
      capturedAt: outcome.capturedAt,
      permissionStatus: "granted"
    };
  }
  if (outcome.kind === "fallback" || outcome.kind === "unsupported") {
    return {
      mode: "server_fallback",
      permissionStatus: "fallback_used",
      gpsFailureReason: outcome.kind === "unsupported" ? "unknown" : outcome.failureReason
    };
  }
  return null;
}

type HookState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; outcome: Exclude<LocationAcquireOutcome, { kind: "denied" }> }
  | { status: "denied" };

export function useIncidentReporterLocation() {
  const [state, setState] = useState<HookState>({ status: "idle" });

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const refresh = useCallback(async (): Promise<LocationAcquireOutcome> => {
    setState({ status: "loading" });
    const outcome = await acquireReporterGpsPosition();
    if (outcome.kind === "denied") {
      setState({ status: "denied" });
      return outcome;
    }
    setState({ status: "ready", outcome });
    return outcome;
  }, []);

  return { state, refresh, reset };
}
