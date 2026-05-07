import { MapPin, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { LocationAcquireOutcome } from "../hooks/useIncidentReporterLocation";

type Props = {
  outcome: Exclude<LocationAcquireOutcome, { kind: "denied" }>;
  googleMapsApiKey?: string;
};

/** OpenStreetMap static preview (no API key). Optional Google Embed when key is configured. */
export const IncidentLocationPreview = ({ outcome, googleMapsApiKey }: Props) => {
  const { t } = useTranslation();

  if (outcome.kind === "fallback" || outcome.kind === "unsupported") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-[13px] text-amber-950">
        <div className="flex items-start gap-2 font-semibold">
          <Navigation className="mt-0.5 h-4 w-4 shrink-0" />
          {t("incident.locationApproximateTitle")}
        </div>
        <p className="mt-2 text-amber-900/90">{t("incident.locationApproximateBody")}</p>
      </div>
    );
  }

  const { latitude, longitude, accuracyMeters } = outcome;
  const lowAcc = accuracyMeters > 100;

  const osmStaticUrl =
    `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}` +
    `&zoom=16&size=560x280&markers=${latitude},${longitude},lightblue1`;

  const embedUrl = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(googleMapsApiKey)}&q=${encodeURIComponent(`${latitude},${longitude}`)}&zoom=16`
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-white">
      <div className="relative aspect-[2/1] w-full bg-surface-soft">
        {embedUrl ? (
          <iframe
            title={t("incident.locationMapTitle")}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
          />
        ) : (
          <img
            src={osmStaticUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <a
          className="absolute bottom-2 right-2 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-medium text-brand-800 shadow"
          href={`https://maps.google.com/?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Maps
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-surface-border px-3 py-2 text-[12px] text-content-muted">
        <MapPin className="h-3.5 w-3.5 text-brand-700" />
        <span className="font-mono text-[11px] text-content">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
        <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px]">
          ±{Math.round(accuracyMeters)} m
        </span>
        {lowAcc && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
            {t("incident.locationLowAccuracy")}
          </span>
        )}
      </div>
    </div>
  );
};
