import { describe, expect, it } from "vitest";
import {
  appendLocationAlertLines,
  incidentLocationClientSchema,
  resolvePersistedIncidentLocation,
  assertGpsCapturedAtFresh,
  INCIDENT_GPS_MAX_CAPTURE_AGE_MS
} from "../src/modules/public/incidentLocation.schema.js";

describe("incidentLocationClientSchema", () => {
  it("parses gps payload", () => {
    const parsed = incidentLocationClientSchema.parse({
      mode: "gps",
      latitude: "52.5",
      longitude: "13.4",
      accuracyMeters: "12",
      capturedAt: "2026-05-05T10:00:00.000Z",
      permissionStatus: "granted"
    });
    expect(parsed.mode).toBe("gps");
    expect(parsed.latitude).toBeCloseTo(52.5);
  });

  it("parses server_fallback payload", () => {
    const parsed = incidentLocationClientSchema.parse({
      mode: "server_fallback",
      permissionStatus: "fallback_used",
      gpsFailureReason: "timeout"
    });
    expect(parsed.mode).toBe("server_fallback");
  });
});

describe("assertGpsCapturedAtFresh", () => {
  it("throws when stale", () => {
    const old = new Date(Date.now() - INCIDENT_GPS_MAX_CAPTURE_AGE_MS - 1000).toISOString();
    expect(() => assertGpsCapturedAtFresh(old)).toThrow("STALE_LOCATION");
  });
});

describe("resolvePersistedIncidentLocation", () => {
  it("returns GPS_STALE when gps capture is too old", async () => {
    const old = new Date(Date.now() - INCIDENT_GPS_MAX_CAPTURE_AGE_MS - 5000).toISOString();
    const r = await resolvePersistedIncidentLocation({
      client: {
        mode: "gps",
        latitude: 0,
        longitude: 0,
        accuracyMeters: 12,
        capturedAt: old,
        permissionStatus: "granted"
      },
      serverFallbackResolver: async () => null,
      nowMs: Date.now()
    });
    expect("error" in r && r.error).toBe("GPS_STALE");
  });

  it("builds gps document with lowAccuracy when accuracy high", async () => {
    const capturedAt = new Date().toISOString();
    const r = await resolvePersistedIncidentLocation({
      client: {
        mode: "gps",
        latitude: 0,
        longitude: 0,
        accuracyMeters: 250,
        capturedAt,
        permissionStatus: "granted"
      },
      serverFallbackResolver: async () => null,
      nowMs: Date.now()
    });
    if ("error" in r) throw new Error(JSON.stringify(r));
    expect(r.location.locationType).toBe("gps");
    expect(r.location.lowAccuracy).toBe(true);
  });

  it("returns FALLBACK_FAILED when resolver returns null", async () => {
    const r = await resolvePersistedIncidentLocation({
      client: { mode: "server_fallback", permissionStatus: "fallback_used", gpsFailureReason: "timeout" },
      serverFallbackResolver: async () => null,
      nowMs: 1_700_000_000_000
    });
    expect("error" in r && r.error).toBe("FALLBACK_FAILED");
  });

  it("stores ip_based location from resolver", async () => {
    const r = await resolvePersistedIncidentLocation({
      client: { mode: "server_fallback", permissionStatus: "fallback_used" },
      serverFallbackResolver: async () => ({
        latitude: 52.5,
        longitude: 13.4,
        accuracyMeters: 5000,
        approxCity: "Berlin",
        approxCountry: "Germany"
      }),
      nowMs: 1_700_000_000_000
    });
    if ("error" in r) throw new Error(JSON.stringify(r));
    expect(r.location.locationType).toBe("ip_based");
    expect(r.location.approxCity).toBe("Berlin");
  });
});

describe("appendLocationAlertLines", () => {
  it("adds exact maps link for gps", () => {
    const text = appendLocationAlertLines("Hello.", {
      latitude: 1,
      longitude: 2,
      accuracyMeters: 20,
      locationType: "gps",
      capturedAt: new Date(),
      permissionStatus: "granted",
      lowAccuracy: false
    });
    expect(text).toContain("Exact Location: https://maps.google.com/?q=1,2");
  });

  it("adds approximate line for ip_based", () => {
    const text = appendLocationAlertLines("Hello.", {
      latitude: 1,
      longitude: 2,
      accuracyMeters: 5000,
      locationType: "ip_based",
      capturedAt: new Date(),
      permissionStatus: "fallback_used",
      lowAccuracy: true,
      approxCity: "Paris",
      approxCountry: "France"
    });
    expect(text).toContain("Approx Location (IP-based): Paris, France");
  });
});
