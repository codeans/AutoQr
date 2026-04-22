import { ImageIcon, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toGermanE164 } from "@autoqr/shared";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../components/marketing/shared/Field";
import { Eyebrow } from "../components/marketing/shared/HeadingBlock";
import { Reveal } from "../components/marketing/shared/Reveal";
import { GermanPhoneInput } from "../features/calls/components/GermanPhoneInput";
import { MultiImageUploader } from "../features/calls/components/MultiImageUploader";
import { submitIncident } from "../features/calls/services/incidentApi";
import { api } from "../lib/api";

export const IncidentPage = () => {
  const { token = "" } = useParams();
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
      .get(`/public/incident/${token}`)
      .then((res) => setQrInfo(res.data.qr))
      .catch(() => setQrInfo(null))
      .finally(() => setLoading(false));
  }, [token]);

  const phoneE164 = useMemo(() => toGermanE164(reporterPhone), [reporterPhone]);
  const canSubmit = !!phoneE164 && message.trim().length >= 5 && consent && !pending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!phoneE164) {
      setSubmitError("Please enter a valid German phone number.");
      return;
    }
    if (message.trim().length < 5) {
      setSubmitError("Please describe briefly what happened (at least 5 characters).");
      return;
    }
    if (!consent) {
      setSubmitError("Please accept the privacy consent to continue.");
      return;
    }
    setPending(true);
    try {
      const incident = await submitIncident({
        token,
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
      setSubmitError(err?.response?.data?.message ?? "Could not submit incident. Please check your details and try again.");
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <section className="relative min-h-[70vh] py-20">
        <Container size="narrow">
          <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center text-fog-300">
            Loading secure incident channel…
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(233,199,154,0.08),transparent_60%)]"
      />
      <Container size="narrow">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-200">
              <ShieldAlert className="h-3.5 w-3.5" />
              Secure vehicle contact
            </div>
            <Eyebrow className="mt-6">Report an incident</Eyebrow>
            <h1 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-fog-50 sm:text-5xl">
              Help the vehicle owner — safely and privately.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-fog-300">
              This tag belongs to a registered AutoQR vehicle owner. Share clear details and — if needed — connect directly via a private browser call. Your number stays hidden from the owner until they answer.
            </p>

            {carLabel && (
              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-[13.5px] text-fog-200">
                <p className="text-[11px] uppercase tracking-[0.2em] text-fog-400">Reporting about</p>
                <p className="mt-1 text-fog-50">{carLabel}</p>
              </div>
            )}

            <form onSubmit={submit} className="mt-10 space-y-6">
              <FieldGroup>
                <FieldLabel htmlFor="reporterName">Your name (optional)</FieldLabel>
                <TextField
                  id="reporterName"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  maxLength={120}
                  placeholder="Leave blank to stay anonymous"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="reporterPhone">German phone number *</FieldLabel>
                <GermanPhoneInput id="reporterPhone" value={reporterPhone} onChange={setReporterPhone} required />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="message">What happened? *</FieldLabel>
                <TextArea
                  id="message"
                  required
                  minLength={5}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the incident — location, time, anything urgent."
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5" /> Incident photos (optional)
                  </span>
                </FieldLabel>
                <MultiImageUploader onChange={setFiles} />
              </FieldGroup>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-ink-900 p-4 text-[13.5px] text-fog-200">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-ink-950 text-accent focus:ring-accent/30"
                />
                <span>
                  I confirm this report is truthful. I consent to AutoQR sharing it with the vehicle owner and — if I start a call — to a brief live audio connection. My phone number stays masked.
                </span>
              </label>

              {submitError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:flex-1"
                  disabled={!canSubmit}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <PhoneCall className="h-4 w-4" />
                    {pending ? "Connecting…" : "Connect to Vehicle Owner"}
                  </span>
                </Button>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-[12.5px] text-fog-400">
                <div className="flex items-center gap-2 font-semibold text-fog-200">
                  <Sparkles className="h-3.5 w-3.5" /> What happens next?
                </div>
                <p className="mt-1">
                  When you click <span className="text-fog-100">Connect to Vehicle Owner</span>, we open a secure call window, ask your browser for microphone access, and ring the owner's portal in real time.
                </p>
              </div>
            </form>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
