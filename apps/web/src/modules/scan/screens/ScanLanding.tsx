import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../../../components/marketing/shared/Field";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { fetchLanding, requestOwnerCall, submitAlert } from "../services/scan.service";
import type { ScanLanding as LandingType, ScanReason } from "../services/scan.service";
import { ReasonOption } from "../components/ReasonOption";

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
  const navigate = useNavigate();
  const [landing, setLanding] = useState<LandingType | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState<ScanReason | null>(null);
  const [message, setMessage] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState<{ severity: string; ownerMaskedDisplay: string } | null>(null);
  const [callInfo, setCallInfo] = useState<string | null>(null);

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
  }, [token, t]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason || !token) return;
    setError("");
    setPending(true);
    try {
      const result = await submitAlert(token, {
        reason,
        message: message || undefined,
        reporterName: reporterName || undefined,
        reporterPhone: reporterPhone || undefined,
        consent
      });
      setSubmitted({
        severity: result.severity,
        ownerMaskedDisplay: result.ownerMaskedDisplay
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("scan.couldNotSendAlert"));
    } finally {
      setPending(false);
    }
  };

  const callOwner = async () => {
    if (!token || !reporterPhone) {
      setCallInfo(t("scan.phoneRequiredForCall"));
      return;
    }
    try {
      const res = await requestOwnerCall(token, {
        reporterPhone,
        reporterName: reporterName || undefined,
        reason: reason ?? undefined
      });
      setCallInfo(res.message);
      const params = new URLSearchParams({
        incidentId: res.incidentId,
        ownerUserId: res.ownerUserId,
        sessionToken: res.reporterSessionToken,
        phone: res.reporterPhone,
        autoStart: "1"
      });
      navigate(`/call/reporter?${params.toString()}`);
    } catch (err: any) {
      setCallInfo(err?.response?.data?.message ?? t("scan.couldNotStartCall"));
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-fog-50">{t("scan.tagNotFoundTitle")}</h1>
        <p className="mt-3 text-fog-300">{error}</p>
      </div>
    );
  }

  if (!landing) {
    return <div className="mx-auto max-w-lg px-6 py-16 text-fog-300">{t("scan.loading")}</div>;
  }

  if (!landing.activated) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-fog-50">{t("scan.notActiveTitle")}</h1>
        <p className="mt-3 text-fog-300">
          {landing.message ?? t("scan.notActiveMessage")}
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ink-950 py-16">
        <Container size="narrow">
          <Reveal>
            <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-2xl text-accent">✓</div>
              <h1 className="mt-6 font-display text-3xl text-fog-50">{submitted.ownerMaskedDisplay}</h1>
              <p className="mt-3 text-[15px] text-fog-300">
                {submitted.severity === "emergency"
                  ? t("scan.emergencyContactsNotified")
                  : t("scan.thankYouResponseSoon")}
              </p>
              <div className="mt-8">
                <Button variant="secondary" onClick={callOwner} size="lg" className="w-full">
                  {t("scan.connectPrivateCall")}
                </Button>
                {callInfo && <p className="mt-4 text-[13px] text-fog-300">{callInfo}</p>}
              </div>
            </div>
          </Reveal>
        </Container>
      </div>
    );
  }

  const car = landing.car;

  return (
    <div className="min-h-screen bg-ink-950 py-12">
      <Container size="narrow">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.2em] text-fog-400">{t("scan.privacyBridge")}</div>
            <h1 className="mt-4 font-display text-4xl text-fog-50 sm:text-5xl">
              {car?.nickname || t("scan.landingTitleFallback")} {t("scan.landingTitleSuffix")}
            </h1>
            <p className="mt-4 text-[15px] text-fog-300">
              {car?.displayMessage || t("scan.landingSubtitle")}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-[13.5px]">
              {car?.make && (
                <div>
                  <dt className="text-fog-400">{t("scan.carDetails.make")}</dt>
                  <dd className="text-fog-100">{car.make}</dd>
                </div>
              )}
              {car?.model && (
                <div>
                  <dt className="text-fog-400">{t("scan.carDetails.model")}</dt>
                  <dd className="text-fog-100">{car.model}</dd>
                </div>
              )}
              {car?.color && (
                <div>
                  <dt className="text-fog-400">{t("scan.carDetails.color")}</dt>
                  <dd className="text-fog-100">{car.color}</dd>
                </div>
              )}
              {car?.maskedRegistration && (
                <div>
                  <dt className="text-fog-400">{t("scan.carDetails.plate")}</dt>
                  <dd className="font-mono text-fog-100">{car.maskedRegistration}</dd>
                </div>
              )}
            </dl>

            <form onSubmit={submit} className="mt-10 space-y-6">
              <div>
                <h2 className="text-[12px] uppercase tracking-[0.2em] text-fog-400">{t("scan.whyLabel")}</h2>
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

              {reason && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel htmlFor="name">{t("scan.yourNameOptional")}</FieldLabel>
                    <TextField id="name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="phone">{t("scan.yourPhoneLabel")}</FieldLabel>
                    <TextField
                      id="phone"
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                    />
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
              )}

              {reason && (
                <label className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-[13px] text-fog-300">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1"
                  />
                  <span>{t("scan.consentLabel")}</span>
                </label>
              )}

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">{error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" size="lg" className="w-full" disabled={!reason || pending}>
                  {pending ? t("scan.sending") : t("scan.alertOwner")}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={callOwner}
                  disabled={!reporterPhone}
                >
                  {t("scan.requestMaskedCall")}
                </Button>
              </div>
              {callInfo && <p className="text-[13px] text-fog-300">{callInfo}</p>}
            </form>
          </div>
        </Reveal>
      </Container>
    </div>
  );
};
