import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../../../components/marketing/shared/Field";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { fetchLanding, requestOwnerCall, submitAlert } from "../services/scan.service";
import type { ScanLanding as LandingType, ScanReason } from "../services/scan.service";
import { ReasonOption } from "../components/ReasonOption";

const REASONS: Array<{
  reason: ScanReason;
  label: string;
  description: string;
  severity: "info" | "urgent" | "emergency";
}> = [
  {
    reason: "wrong_parking",
    label: "Wrongly parked car",
    description: "Blocking a driveway, parked in a restricted zone, or in your spot.",
    severity: "info"
  },
  {
    reason: "headlights_on",
    label: "Headlights left on",
    description: "Lights or hazards on — the car battery will drain.",
    severity: "urgent"
  },
  {
    reason: "flat_tyre",
    label: "Flat tyre",
    description: "One of the car's tyres looks flat or deflated.",
    severity: "urgent"
  },
  {
    reason: "towing",
    label: "Car being towed",
    description: "A towing service is about to tow this car.",
    severity: "urgent"
  },
  {
    reason: "door_or_window_open",
    label: "Door or window open",
    description: "A car door, boot, or window appears to be open.",
    severity: "urgent"
  },
  {
    reason: "car_damaged",
    label: "Car damaged",
    description: "The car looks scratched, dented, or otherwise damaged.",
    severity: "urgent"
  },
  {
    reason: "accident",
    label: "Accident / emergency",
    description: "An accident, fire, or medical emergency involving this car.",
    severity: "emergency"
  },
  {
    reason: "other",
    label: "Something else",
    description: "Leave a private note for the car owner.",
    severity: "info"
  }
];

export const ScanLandingScreen = () => {
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

  useEffect(() => {
    if (!token) return;
    fetchLanding(token)
      .then(setLanding)
      .catch(() => setError("We couldn't find this car tag."));
  }, [token]);

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
      setError(err?.response?.data?.message ?? "Could not send the alert.");
    } finally {
      setPending(false);
    }
  };

  const callOwner = async () => {
    if (!token || !reporterPhone) {
      setCallInfo("Please enter your phone number first so we can set up a masked call with the car owner.");
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
      setCallInfo(err?.response?.data?.message ?? "Could not start the call.");
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-fog-50">Car tag not found</h1>
        <p className="mt-3 text-fog-300">{error}</p>
      </div>
    );
  }

  if (!landing) {
    return <div className="mx-auto max-w-lg px-6 py-16 text-fog-300">Loading…</div>;
  }

  if (!landing.activated) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-3xl text-fog-50">This car tag is not active yet</h1>
        <p className="mt-3 text-fog-300">
          {landing.message ??
            "The car owner hasn't activated this tag yet. Please try again later or contact AutoQR support."}
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
                  ? "Emergency contacts have also been notified."
                  : "Thanks for caring — the car owner will respond as soon as possible."}
              </p>
              <div className="mt-8">
                <Button variant="secondary" onClick={callOwner} size="lg" className="w-full">
                  Connect a private call
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
            <div className="text-[11px] uppercase tracking-[0.2em] text-fog-400">AutoQR · Car owner privacy bridge</div>
            <h1 className="mt-4 font-display text-4xl text-fog-50 sm:text-5xl">
              {car?.nickname || "This car"} needs a heads-up.
            </h1>
            <p className="mt-4 text-[15px] text-fog-300">
              {car?.displayMessage ||
                "The car owner's number is never shown. Pick a reason and we'll alert them instantly."}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-[13.5px]">
              {car?.make && (
                <div>
                  <dt className="text-fog-400">Make</dt>
                  <dd className="text-fog-100">{car.make}</dd>
                </div>
              )}
              {car?.model && (
                <div>
                  <dt className="text-fog-400">Model</dt>
                  <dd className="text-fog-100">{car.model}</dd>
                </div>
              )}
              {car?.color && (
                <div>
                  <dt className="text-fog-400">Colour</dt>
                  <dd className="text-fog-100">{car.color}</dd>
                </div>
              )}
              {car?.maskedRegistration && (
                <div>
                  <dt className="text-fog-400">Plate</dt>
                  <dd className="font-mono text-fog-100">{car.maskedRegistration}</dd>
                </div>
              )}
            </dl>

            <form onSubmit={submit} className="mt-10 space-y-6">
              <div>
                <h2 className="text-[12px] uppercase tracking-[0.2em] text-fog-400">Why are you reaching out about this car?</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {REASONS.map((r) => (
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
                    <FieldLabel htmlFor="name">Your name (optional)</FieldLabel>
                    <TextField id="name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="phone">Your phone (needed for a private call with the car owner)</FieldLabel>
                    <TextField
                      id="phone"
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="message">Private note (optional)</FieldLabel>
                    <TextArea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Example: Your car is blocking my driveway near the main entrance."
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
                  <span>
                    I understand this alert will be shared with the car owner. My phone number will be masked if I request a
                    call.
                  </span>
                </label>
              )}

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">{error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" size="lg" className="w-full" disabled={!reason || pending}>
                  {pending ? "Sending…" : "Alert the car owner"}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={callOwner}
                  disabled={!reporterPhone}
                >
                  Request masked call
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
