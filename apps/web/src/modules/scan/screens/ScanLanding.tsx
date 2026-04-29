import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, ImageIcon, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";
import { toGermanE164 } from "@autoqr/shared";
import { Button } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../../../components/marketing/shared/Field";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { fetchLanding } from "../services/scan.service";
import type { ScanLanding as LandingType, ScanReason } from "../services/scan.service";
import { ReasonOption } from "../components/ReasonOption";
import { GermanPhoneInput } from "../../../features/calls/components/GermanPhoneInput";
import { MultiImageUploader } from "../../../features/calls/components/MultiImageUploader";
import { submitIncident } from "../../../features/calls/services/incidentApi";

type Mode = "preview" | "live";

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

type Props = {
  mode?: Mode;
};

export const ScanLandingScreen = ({ mode = "preview" }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token: tokenParam, qrId } = useParams();
  const token = tokenParam ?? qrId ?? "";
  const isLive = mode === "live";

  const [landing, setLanding] = useState<LandingType | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState<ScanReason | null>(null);
  const [message, setMessage] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState<null | "alert" | "call">(null);

  const phoneE164 = useMemo(() => toGermanE164(reporterPhone), [reporterPhone]);

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
    fetchLanding(token)
      .then(setLanding)
      .catch(() => setError(t("scan.tagNotFoundMessage")));
  }, [t, token]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-content">{t("scan.tagNotFoundTitle")}</h1>
        <p className="mt-3 text-content-muted">{error}</p>
      </div>
    );
  }

  if (!landing) {
    return <div className="mx-auto max-w-lg px-6 py-16 text-content-muted">{t("scan.loading")}</div>;
  }

  if (!landing.activated) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-content">QR Code Not Activated Yet</h1>
        <p className="mt-3 text-content-muted">
          This AutoQr code has not been activated. If this is your QR, please create or log in to your account and
          activate it using your activation code.
        </p>
        <div className="mt-6 grid gap-3">
          <Button type="button" size="lg" className="w-full" onClick={() => navigate("/setup-qr")}>
            Activate QR
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => navigate("/login?redirect=/setup-qr")}
          >
            Login
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => navigate("/register?redirect=/setup-qr")}
          >
            Register
          </Button>
        </div>
      </div>
    );
  }

  const car = landing.car;
  const key = landing.key;
  const assetType: "car" | "keys" = landing.assetType ?? (car ? "car" : "keys");
  const activeReason = (assetType === "keys" ? ("other" as ScanReason) : reason) ?? null;

  const composedMessage = () => {
    const reasonLabel = activeReason ? t(`scan.reasons.${REASONS.find((r) => r.reason === activeReason)?.key}.label`) : "";
    const trimmed = message.trim();
    if (reasonLabel && trimmed) return `[${reasonLabel}] ${trimmed}`;
    if (reasonLabel) return reasonLabel;
    return trimmed;
  };

  const validate = () => {
    if (!phoneE164) {
      setSubmitError(t("incident.errorInvalidPhone"));
      return false;
    }
    if (!activeReason && message.trim().length < 5) {
      setSubmitError(t("incident.errorMessageTooShort"));
      return false;
    }
    if (!consent) {
      setSubmitError(t("incident.errorConsentRequired"));
      return false;
    }
    setSubmitError("");
    return true;
  };

  const doSubmit = async (action: "alert" | "call") => {
    if (!isLive) return;
    if (!validate()) return;
    setPending(action);
    try {
      const incident = await submitIncident({
        token,
        reporterName,
        reporterPhoneE164: phoneE164!,
        message: composedMessage() || (activeReason ?? "other"),
        files
      });
      if (action === "call") {
        const params = new URLSearchParams({
          incidentId: incident.id,
          ownerUserId: incident.ownerUserId,
          sessionToken: incident.reporterSessionToken,
          phone: incident.reporterPhone,
          autoStart: "1"
        });
        const callUrl = `/call/reporter?${params.toString()}`;
        const popup = window.open(callUrl, "_blank", "noopener=yes,noreferrer=yes,width=440,height=760");
        if (!popup) window.location.assign(callUrl);
      } else {
        setSubmitError("");
        setMessage("");
        setReason(null);
        setFiles([]);
        setConsent(false);
        alert(t("scan.thankYouResponseSoon"));
      }
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? t("incident.errorSubmitGeneric"));
    } finally {
      setPending(null);
    }
  };

  const buttonsDisabled = !isLive || pending !== null;

  return (
    <div className="min-h-screen bg-surface-soft py-12">
      <Container size="narrow">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            {isLive ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-800">
                <ShieldAlert className="h-3.5 w-3.5" />
                {t("incident.secureContactBadge")}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-800">
                <Eye className="h-3.5 w-3.5" />
                Preview Mode
              </div>
            )}
            <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-content-subtle">{t("scan.privacyBridge")}</div>
            <h1 className="mt-4 font-display text-4xl text-content sm:text-5xl">
              {assetType === "car"
                ? `${car?.nickname || t("scan.landingTitleFallback")} ${t("scan.landingTitleSuffix")}`
                : "I Found These Keys"}
            </h1>
            <p className="mt-4 text-[15px] text-content-muted">
              {assetType === "car"
                ? car?.displayMessage || t("scan.landingSubtitle")
                : "Request secure contact with the QR owner. You can add optional details about where you found the keys."}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-surface-border bg-white p-5 text-[13.5px]">
              {assetType === "car" ? (
                <>
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
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-content-subtle">Key label</dt>
                    <dd className="text-content">{key?.label ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-content-subtle">Key type</dt>
                    <dd className="text-content">{key?.keyType ?? "-"}</dd>
                  </div>
                  {key?.description && (
                    <div className="col-span-2">
                      <dt className="text-content-subtle">Description</dt>
                      <dd className="text-content">{key.description}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>

            <div className="mt-10 space-y-6">
              <div>
                <h2 className="text-[12px] uppercase tracking-[0.2em] text-content-subtle">{t("scan.whyLabel")}</h2>
                {assetType === "car" ? (
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
                ) : (
                  <p className="mt-4 text-content-muted">
                    These keys have an activated QR code. Add any optional details and request contact with the
                    owner.
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FieldGroup>
                  <FieldLabel htmlFor="name">{t("scan.yourNameOptional")}</FieldLabel>
                  <TextField
                    id="name"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    maxLength={120}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="phone">{t("scan.yourPhoneLabel")}</FieldLabel>
                  <GermanPhoneInput id="phone" value={reporterPhone} onChange={setReporterPhone} required={isLive} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="message">{t("scan.privateNoteLabel")}</FieldLabel>
                  <TextArea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("scan.privateNotePlaceholder")}
                    maxLength={2000}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>
                    <span className="inline-flex items-center gap-2">
                      <ImageIcon className="h-3.5 w-3.5" /> {t("incident.incidentPhotosLabel")}
                    </span>
                  </FieldLabel>
                  <MultiImageUploader onChange={setFiles} disabled={!isLive} />
                </FieldGroup>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-surface-border bg-white p-4 text-[13px] text-content-muted">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={!isLive}
                  className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-700 focus:ring-brand-500/30"
                />
                <span className="flex items-start gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                  <span>{t("incident.consentLong")}</span>
                </span>
              </label>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  disabled={buttonsDisabled}
                  onClick={() => doSubmit("alert")}
                >
                  {pending === "alert" ? t("scan.sending") : t("scan.alertOwner")}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={buttonsDisabled}
                  onClick={() => doSubmit("call")}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <PhoneCall className="h-4 w-4" />
                    {pending === "call" ? t("incident.connecting") : t("scan.requestMaskedCall")}
                  </span>
                </Button>
              </div>

              {isLive ? (
                <div className="rounded-2xl border border-surface-border bg-white p-4 text-[12.5px] text-content-muted">
                  <div className="flex items-center gap-2 font-semibold text-content">
                    <Sparkles className="h-3.5 w-3.5 text-brand-700" /> {t("incident.whatHappensNext")}
                  </div>
                  <p className="mt-1">
                    {t("incident.whatHappensNextBody", { action: t("scan.requestMaskedCall") })}
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-content-subtle">
                  This preview mirrors the public page. Actions are disabled here — they go live when the QR is scanned.
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
};
