import { z } from "zod";
import type { ApproxLocationFromIpResult } from "../../services/location/locationFallback.service.js";

/** Max age of a client GPS fix before requiring refresh (milliseconds). */
export const INCIDENT_GPS_MAX_CAPTURE_AGE_MS = 15 * 60 * 1000;

export const LOW_ACCURACY_THRESHOLD_METERS = 100;

/** Raw multipart / JSON-parseable location payloads from reporters. */

export const incidentLocationClientSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("gps"),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    accuracyMeters: z.coerce.number().positive().finite().max(50_000_000),
    capturedAt: z.string().datetime({ offset: true }),
    permissionStatus: z.literal("granted")
  }),
  z.object({
    mode: z.literal("server_fallback"),
    permissionStatus: z.literal("fallback_used"),
    gpsFailureReason: z.enum(["timeout", "position_unavailable", "unknown"]).optional()
  })
]);

export type IncidentLocationClientInput = z.infer<typeof incidentLocationClientSchema>;

export type PersistedIncidentLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  locationType: "gps" | "ip_based";
  capturedAt: Date;
  permissionStatus: "granted" | "fallback_used";
  lowAccuracy: boolean;
  approxCity?: string;
  approxCountry?: string;
  gpsFailureReason?: string;
};

/** Returns parsed object/array or undefined when missing; throws INVALID_LOCATION_JSON for bad JSON. */
export function parseLocationField(raw: unknown): unknown {
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      throw new Error("INVALID_LOCATION_JSON");
    }
  }
  if (typeof raw === "object") return raw;
  throw new Error("INVALID_LOCATION_SHAPE");
}

/** Age check for GPS fixes supplied by the client. */
export function assertGpsCapturedAtFresh(isoCapturedAt: string, nowMs: number = Date.now()) {
  const t = Date.parse(isoCapturedAt);
  if (Number.isNaN(t)) throw new Error("INVALID_CAPTURE_TIME");
  if (nowMs - t > INCIDENT_GPS_MAX_CAPTURE_AGE_MS) throw new Error("STALE_LOCATION");
}

/** Build persisted subdocument after validation + optional server IP fallback resolution. */

export async function resolvePersistedIncidentLocation(args: {
  client: IncidentLocationClientInput;
  serverFallbackResolver: () => Promise<ApproxLocationFromIpResult | null>;
  nowMs?: number;
}): Promise<{ location: PersistedIncidentLocation } | { error: "FALLBACK_FAILED" | "GPS_STALE"; message: string }> {
  const nowMs = args.nowMs ?? Date.now();

  if (args.client.mode === "gps") {
    try {
      assertGpsCapturedAtFresh(args.client.capturedAt, nowMs);
    } catch {
      return { error: "GPS_STALE", message: "Location capture expired. Refresh location before submitting." };
    }
    const lowAccuracy = args.client.accuracyMeters > LOW_ACCURACY_THRESHOLD_METERS;
    return {
      location: {
        latitude: args.client.latitude,
        longitude: args.client.longitude,
        accuracyMeters: args.client.accuracyMeters,
        locationType: "gps",
        capturedAt: new Date(args.client.capturedAt),
        permissionStatus: "granted",
        lowAccuracy
      }
    };
  }

  const resolved = await args.serverFallbackResolver();
  if (!resolved) {
    return { error: "FALLBACK_FAILED", message: "Could not resolve approximate location. Try again." };
  }

  return {
    location: {
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      accuracyMeters: resolved.accuracyMeters,
      locationType: "ip_based",
      capturedAt: new Date(nowMs),
      permissionStatus: "fallback_used",
      lowAccuracy: resolved.accuracyMeters > LOW_ACCURACY_THRESHOLD_METERS,
      approxCity: resolved.approxCity,
      approxCountry: resolved.approxCountry,
      gpsFailureReason: args.client.gpsFailureReason
    }
  };
}

export function appendLocationAlertLines(baseMessage: string, loc: PersistedIncidentLocation): string {
  let extra = "";
  if (loc.locationType === "gps") {
    extra += `\nExact Location: https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
    if (loc.lowAccuracy) extra += "\n(Low Accuracy GPS)";
  } else {
    const locLine =
      [loc.approxCity, loc.approxCountry].filter(Boolean).join(", ") || "Unavailable";
    extra += `\nApprox Location (IP-based): ${locLine}`;
    if (
      typeof loc.latitude === "number" &&
      typeof loc.longitude === "number" &&
      Number.isFinite(loc.latitude) &&
      Number.isFinite(loc.longitude)
    ) {
      extra += `\nApproximate map pin: https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
    }
  }
  return `${baseMessage}${extra}`;
}
