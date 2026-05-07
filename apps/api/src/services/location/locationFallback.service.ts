import geoip from "geoip-lite";
import { logger } from "../../utils/logger.js";

export type ApproxLocationFromIpResult = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  approxCity?: string;
  approxCountry?: string;
};

function pickAddressParts(components: { long_name: string; short_name: string; types: string[] }[]) {
  let approxCity = "";
  let approxCountry = "";
  for (const c of components) {
    if (c.types.includes("locality")) approxCity = c.long_name;
    if (c.types.includes("administrative_area_level_1") && !approxCity && c.long_name)
      approxCity = c.long_name;
    if (c.types.includes("country")) approxCountry = c.long_name;
  }
  return { approxCity, approxCountry };
}

async function reverseGeocodeCityCountry(
  lat: number,
  lng: number,
  apiKey: string
): Promise<{ approxCity?: string; approxCountry?: string }> {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=` +
    `${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      logger.warn("google.geocode.failed_status", { status: res.status });
      return {};
    }
    const data = (await res.json()) as {
      status: string;
      results?: { address_components: { long_name: string; short_name: string; types: string[] }[] }[];
    };
    if (data.status !== "OK" || !data.results?.[0]?.address_components) return {};
    return pickAddressParts(data.results[0].address_components);
  } catch (err) {
    logger.warn("google.geocode.error", { err: (err as Error)?.message });
    return {};
  }
}

/**
 * Approximate location from the **client** IP observed by this API (`X-Forwarded-For` /
 * `trust proxy`). Uses bundled GeoIP-lite; optionally refines city/country labels via Google
 * Geocoding when `GOOGLE_MAPS_API_KEY` is configured.
 */
export async function resolveApproxLocationFromHttpRequest(opts: {
  clientIp?: string | null;
  googleMapsApiKey: string;
}): Promise<ApproxLocationFromIpResult | null> {
  const raw = opts.clientIp?.trim();
  if (!raw) {
    logger.warn("geo.fallback.no_client_ip");
    return null;
  }

  const geo = geoip.lookup(raw);
  if (!geo || !Array.isArray(geo.ll) || geo.ll.length < 2) {
    logger.warn("geo.fallback.lookup_miss", { clientIpMasked: "***" });
    return null;
  }

  const latitude = geo.ll[0];
  const longitude = geo.ll[1];
  /** IP geolocation uncertainty is inherently large; aligns with coarse IPv4 centroid accuracy. */
  const accuracyMeters = 50_000;
  let approxCity = geo.city || "";
  let approxCountry = geo.country || "";

  if (opts.googleMapsApiKey) {
    const refined = await reverseGeocodeCityCountry(latitude, longitude, opts.googleMapsApiKey);
    approxCity = refined.approxCity || approxCity;
    approxCountry = refined.approxCountry || approxCountry;
  }

  return {
    latitude,
    longitude,
    accuracyMeters,
    ...(approxCity ? { approxCity } : {}),
    ...(approxCountry ? { approxCountry } : {})
  };
}
