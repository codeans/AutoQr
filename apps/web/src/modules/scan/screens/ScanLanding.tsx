import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, ShieldAlert } from "lucide-react";
import { Button } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../../../components/marketing/shared/Field";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { fetchLanding } from "../services/scan.service";
import type { ScanLanding as LandingType, ScanReason } from "../services/scan.service";
import { ReasonOption } from "../components/ReasonOption";
import { GermanPhoneInput } from "../../../features/calls/components/GermanPhoneInput";

type ReasonConfig = {
  reason: ScanReason;
  key: string;
  severity: "info" | "urgent" | "emergency";
};

const REASONS: ReasonConfig[] = [
  { reason: "wrong_parking", key: "wrongParking", severity: "info" },
  { reason: "headlights_on", key: "headlightsOn", severity: "urgent" },
  { reason: "flat_tyre", key: "flatTyre", severity: "urgent" },
  { reason: "towing", key: "towing", severity: "urgent" },
  { reason: "door_or_window_open", key: "doorOrWindowOpen", severity: "urgent" },
  { reason: "car_damaged", key: "carDamaged", severity: "urgent" },
  { reason: "accident", key: "accident", severity: "emergency" },
  { reason: "other", key: "other", severity: "info" }
];

export const ScanLandingScreen = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const previewMode = searchParams.get("preview") === "1";
  const [landing, setLanding] = useState<LandingType | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState<ScanReason | null>(null);
  const [message, setMessage] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterName, setReporterName] = useState("");

  const reasonOptions = useMemo(
    () =>
      REASONS.map((r) => ({
        reason: r.reason,
        severity: r.severity,
        label: t(`scan.reasons.${r.key}.label`),
        description: t(`scan.reasons.${r.key}.description`)
      })),
    [t]
  );

  useEffect(() => {
    if (!token) return;
    if (!previewMode) {
      navigate(`/incident/${token}`, { replace: true });
      return;
    }
    fetchLanding(token)
      .then(setLanding)
      .catch(() => setError(t("scan.tagNotFoundMessage")));
  }, [navigate, previewMode, t, token]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-content">{t("scan.tagNotFoundTitle")}</h1>
        <p className="mt-3 text-content-muted">{error}</p>
      </div>
    );
  }

  if (!previewMode) {
    return null;
  }

  if (!landing) {
    return <div className="mx-auto max-w-lg px-6 py-16 text-content-muted">{t("scan.loading")}</div>;
  }

  if (!landing.activated) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-content">{t("scan.notActiveTitle")}</h1>
        <p className="mt-3 text-content-muted">
          {landing.message ?? t("scan.notActiveMessage")}
        </p>
      </div>
    );
  }

  const car = landing.car;

  return (
    <div className="min-h-screen bg-surface-soft py-12">
      <Container size="narrow">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-800">
              <Eye className="h-3.5 w-3.5" />
              Preview Mode
            </div>
            <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-content-subtle">{t("scan.privacyBridge")}</div>
            <h1 className="mt-4 font-display text-4xl text-content sm:text-5xl">
              {car?.nickname || t("scan.landingTitleFallback")} {t("scan.landingTitleSuffix")}
            </h1>
            <p className="mt-4 text-[15px] text-content-muted">
              {car?.displayMessage || t("scan.landingSubtitle")}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-surface-border bg-white p-5 text-[13.5px]">
              {car?.make && (
                <div>
                  <dt className="text-content-subtle">{t("scan.carDetails.make")}</dt>
                  <dd className="text-content">{car.make}</dd>
                </div>
              )}
              {car?.model && (
                <div>
                  <dt className="text-content-subtle">{t("scan.carDetails.model")}</dt>
                  <dd className="text-content">{car.model}</dd>
                </div>
              )}
              {car?.color && (
                <div>
                  <dt className="text-content-subtle">{t("scan.carDetails.color")}</dt>
                  <dd className="text-content">{car.color}</dd>
                </div>
              )}
              {car?.maskedRegistration && (
                <div>
                  <dt className="text-content-subtle">{t("scan.carDetails.plate")}</dt>
                  <dd className="font-mono text-content">{car.maskedRegistration}</dd>
                </div>
              )}
            </dl>

            <div className="mt-10 space-y-6">
              <div>
                <h2 className="text-[12px] uppercase tracking-[0.2em] text-content-subtle">{t("scan.whyLabel")}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {reasonOptions.map((r) => (
                    <ReasonOption
                      key={r.reason}
                      reason={r.reason}
                      label={r.label}
                      description={r.description}
                      severity={r.severity}
                      selected={reason === r.reason}
                      onSelect={() => setReason(r.reason)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FieldGroup>
                  <FieldLabel htmlFor="name">{t("scan.yourNameOptional")}</FieldLabel>
                  <TextField id="name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="phone">{t("scan.yourPhoneLabel")}</FieldLabel>
                  <GermanPhoneInput id="phone" value={reporterPhone} onChange={setReporterPhone} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="message">{t("scan.privateNoteLabel")}</FieldLabel>
                  <TextArea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("scan.privateNotePlaceholder")}
                  />
                </FieldGroup>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-surface-border bg-white p-4 text-[13px] text-content-muted">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-brand-700" />
                <span>{t("scan.consentLabel")}</span>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" size="lg" className="w-full" onClick={() => navigate(`/incident/${token}`)}>
                  {t("scan.alertOwner")}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate(`/incident/${token}`)}
                >
                  {t("scan.requestMaskedCall")}
                </Button>
              </div>
              <p className="text-[13px] text-content-subtle">
                This preview mirrors the public page. Actions open the live incident flow for full submission and call handling.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
};
