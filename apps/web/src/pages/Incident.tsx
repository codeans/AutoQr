import { ImageIcon, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toGermanE164 } from "@autoqr/shared";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../components/marketing/shared/Field";
import { GermanPhoneInput } from "../features/calls/components/GermanPhoneInput";
import { MultiImageUploader } from "../features/calls/components/MultiImageUploader";
import { submitIncident } from "../features/calls/services/incidentApi";
import { api } from "../lib/api";

export const IncidentPage = () => {
  const { t } = useTranslation();
  const { token, qrId } = useParams();
  const publicToken = token ?? qrId ?? "";
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);
  const [qrInfo, setQrInfo] = useState<{ status: string; car: { nickname?: string; make?: string; model?: string; color?: string } | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/public/incident/${publicToken}`)
      .then((res) => setQrInfo(res.data.qr))
      .catch(() => setQrInfo(null))
      .finally(() => setLoading(false));
  }, [publicToken]);

  const phoneE164 = useMemo(() => toGermanE164(reporterPhone), [reporterPhone]);
  const canSubmit = !!phoneE164 && message.trim().length >= 5 && consent && !pending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!phoneE164) {
      setSubmitError(t("incident.errorInvalidPhone"));
      return;
    }
    if (message.trim().length < 5) {
      setSubmitError(t("incident.errorMessageTooShort"));
      return;
    }
    if (!consent) {
      setSubmitError(t("incident.errorConsentRequired"));
      return;
    }
    setPending(true);
    try {
      const incident = await submitIncident({
        token: publicToken,
        reporterName,
        reporterPhoneE164: phoneE164,
        message,
        files
      });
      const params = new URLSearchParams({
        incidentId: incident.id,
        ownerUserId: incident.ownerUserId,
        sessionToken: incident.reporterSessionToken,
        phone: incident.reporterPhone,
        autoStart: "1"
      });
      const callUrl = `/call/reporter?${params.toString()}`;
      const popup = window.open(callUrl, "_blank", "noopener=yes,noreferrer=yes,width=440,height=760");
      if (!popup) {
        window.location.assign(callUrl);
      }
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? t("incident.errorSubmitGeneric"));
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <section className="relative min-h-[70vh] py-20">
        <Container size="narrow">
          <div className="mx-auto max-w-lg rounded-3xl border border-surface-border bg-surface-soft p-8 text-center text-content-muted">
            {t("incident.loadingSecureChannel")}
          </div>
        </Container>
      </section>
    );
  }

  const carLabel = qrInfo?.car
    ? [qrInfo.car.nickname, [qrInfo.car.make, qrInfo.car.model].filter(Boolean).join(" ")].filter(Boolean).join(" · ")
    : "";

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-soft" />
      <Container size="narrow">
        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-700">
            <ShieldAlert className="h-3.5 w-3.5" />
            {t("incident.secureContactBadge")}
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {t("incident.eyebrow")}
          </p>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-content sm:text-5xl">
            {t("incident.pageHeadline")}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-content-muted">
            {t("incident.pageIntro")}
          </p>

          {carLabel && (
            <div className="mt-6 rounded-2xl border border-surface-border bg-white p-4 text-sm text-content">
              <p className="text-[11px] uppercase tracking-[0.2em] text-content-subtle">{t("incident.reportingAbout")}</p>
              <p className="mt-1 font-medium">{carLabel}</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-10 space-y-6">
            <FieldGroup>
              <FieldLabel htmlFor="reporterName">{t("incident.reporterNameLabel")}</FieldLabel>
              <TextField
                id="reporterName"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                maxLength={120}
                placeholder={t("incident.reporterNamePlaceholder")}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="reporterPhone">{t("incident.germanPhoneRequired")}</FieldLabel>
              <GermanPhoneInput id="reporterPhone" value={reporterPhone} onChange={setReporterPhone} required />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="message">{t("incident.whatHappenedLabel")}</FieldLabel>
              <TextArea
                id="message"
                required
                minLength={5}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("incident.incidentMessagePlaceholder")}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>
                <span className="inline-flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5" /> {t("incident.incidentPhotosLabel")}
                </span>
              </FieldLabel>
              <MultiImageUploader onChange={setFiles} />
            </FieldGroup>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface-border bg-white p-4 text-sm text-content">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-700 focus:ring-brand-500/30"
              />
              <span>{t("incident.consentLong")}</span>
            </label>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                {submitError}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" className="w-full sm:flex-1" disabled={!canSubmit}>
                <span className="inline-flex items-center justify-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  {pending ? t("incident.connecting") : t("incident.connectToOwner")}
                </span>
              </Button>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-soft p-4 text-[12.5px] text-content-muted">
              <div className="flex items-center gap-2 font-semibold text-content">
                <Sparkles className="h-3.5 w-3.5 text-brand-700" /> {t("incident.whatHappensNext")}
              </div>
              <p className="mt-1">
                {t("incident.whatHappensNextBody", { action: t("incident.connectToOwner") })}
              </p>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
};
