import { afterEach, describe, expect, it, vi } from "vitest";
import { acquireReporterGpsPosition } from "./useIncidentReporterLocation";

afterEach(() => {
  vi.unstubAllGlobals();
  delete (globalThis as unknown as { navigator?: Navigator }).navigator;
});

function stubNavigatorGeo(
  impl: (
    ok: (p: { coords: { latitude: number; longitude: number; accuracy: number }; timestamp?: number }) => void,
    err: (e: { code: number }) => void
  ) => void
) {
  const getCurrentPosition = (success: PositionCallback, error: PositionErrorCallback, _opts?: PositionOptions) => {
    impl(
      (partial) => {
        success({
          coords: {
            latitude: partial.coords.latitude,
            longitude: partial.coords.longitude,
            accuracy: partial.coords.accuracy,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON() {
              return {};
            }
          } as GeolocationCoordinates,
          timestamp: partial.timestamp ?? Date.now(),
          toJSON() {
            return {};
          }
        } as GeolocationPosition);
      },
      (e) => error(e as GeolocationPositionError)
    );
  };

  vi.stubGlobal("navigator", {
    geolocation: { getCurrentPosition }
  } as Navigator);
}

describe("acquireReporterGpsPosition", () => {
  it("returns denied when permission denied", async () => {
    stubNavigatorGeo((_ok, err) => err({ code: 1 }));
    const r = await acquireReporterGpsPosition();
    expect(r.kind).toBe("denied");
  });

  it("returns gps on first success", async () => {
    stubNavigatorGeo((ok) => {
      ok({ coords: { latitude: 52.1, longitude: 13.2, accuracy: 30 }, timestamp: 1 });
    });
    const r = await acquireReporterGpsPosition();
    expect(r.kind).toBe("gps");
    if (r.kind === "gps") {
      expect(r.latitude).toBeCloseTo(52.1);
      expect(r.accuracyMeters).toBeGreaterThanOrEqual(1);
    }
  });

  it("retries on timeout then succeeds", async () => {
    let n = 0;
    stubNavigatorGeo((ok, err) => {
      n++;
      if (n < 3) err({ code: 3 });
      else ok({ coords: { latitude: 50, longitude: 8, accuracy: 25 }, timestamp: 1 });
    });
    const r = await acquireReporterGpsPosition();
    expect(r.kind).toBe("gps");
    expect(n).toBe(3);
  });
});
