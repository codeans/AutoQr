import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextField } from "../../../components/marketing/shared/Field";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { useAuth } from "../../../context/AuthContext";
import { fetchPlan, payPlan, startPlan } from "../services/plans.service";
import { formatCurrency } from "../types";
import type { Plan } from "../types";
import { OnboardingStepper } from "../components/OnboardingStepper";
import type { OnboardingStepKey } from "../components/OnboardingStepper";

type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Germany"
};

export const OnboardingScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, requestOtp, verifyOtp } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState<OnboardingStepKey>("plan");

  // account step
  const [accountMode, setAccountMode] = useState<"new" | "existing">("new");
  const [signup, setSignup] = useState({ name: "", email: "", address: "" });
  const [phone, setPhone] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [code, setCode] = useState("");

  // address step
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetchPlan(slug)
      .then((p) => {
        setPlan(p);
        setStep(user ? "address" : "account");
      })
      .catch(() => setLoadError("Plan not found."));
  }, [slug, user]);

  useEffect(() => {
    if (user?.name && !address.fullName) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name,
        phone: user.phone ?? prev.phone
      }));
    }
  }, [user, address.fullName]);

  const planSummary = useMemo(() => {
    if (!plan) return null;
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-soft p-5 text-[14px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-content-subtle">Selected plan</p>
            <h3 className="mt-1 font-display text-2xl text-content">{plan.name}</h3>
            <p className="mt-1 text-[13px] text-content-muted">
              {plan.tagsIncluded} tag{plan.tagsIncluded > 1 ? "s" : ""} · {plan.supportTier} support
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl text-content">
              {formatCurrency(plan.priceCents, plan.currency)}
            </p>
            <p className="text-[11px] text-content0">one-time</p>
          </div>
        </div>
      </div>
    );
  }, [plan]);

  if (loadError) {
    return (
      <SectionWrapper>
        <Container>
          <p className="text-red-300">{loadError}</p>
          <Link to="/plans" className="mt-4 text-content underline">
            Back to plans
          </Link>
        </Container>
      </SectionWrapper>
    );
  }

  if (!plan) {
    return (
      <SectionWrapper>
        <Container>Loading…</Container>
      </SectionWrapper>
    );
  }

  const requestCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await requestOtp(phone, accountMode === "new" ? "signup" : "login");
      setOtpRequested(true);
      setDevCode(res.devCode);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not send code. Check the number.");
    } finally {
      setPending(false);
    }
  };

  const verifyAndContinue = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await verifyOtp({
        phone,
        code,
        purpose: accountMode === "new" ? "signup" : "login",
        signup:
          accountMode === "new"
            ? {
                name: signup.name,
                email: signup.email,
                address: signup.address || "pending"
              }
            : undefined
      });
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || signup.name,
        phone: prev.phone || phone
      }));
      setStep("address");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Incorrect code.");
    } finally {
      setPending(false);
    }
  };

  const continueToPayment = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const order = await startPlan({ planId: plan._id, shippingAddress: address });
      const pay = await payPlan(order._id);
      if (pay.url) {
        window.location.href = pay.url;
        return;
      }
      if (pay.manualReview) {
        navigate(`/onboard/success?orderId=${order._id}&manualReview=1`);
        return;
      }
      navigate(`/onboard/success?orderId=${order._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not start the order.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface-soft">
      <SectionWrapper spacing="tight">
        <Container size="narrow">
          <Reveal>
            <Link to="/plans" className="text-[13px] text-content-subtle hover:text-content">
              ← Plans
            </Link>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-display text-3xl text-content sm:text-4xl">Start your plan</h1>
              <OnboardingStepper current={step} />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-6">
                {step === "plan" && (
                  <Panel
                    title="Plan summary"
                    description="You've selected this plan. Next, we'll set up your account with a one-time code."
                  >
                    {planSummary}
                    <Button size="lg" className="mt-6 w-full" onClick={() => setStep(user ? "address" : "account")}>
                      Continue
                    </Button>
                  </Panel>
                )}

                {step === "account" && !user && (
                  <Panel
                    title="Create your account"
                    description="We'll verify your mobile with a one-time code. No password needed."
                  >
                    <div className="mb-5 inline-flex rounded-full border border-surface-border bg-white/60 p-1 text-[12.5px]">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMode("new");
                          setOtpRequested(false);
                        }}
                        className={`rounded-full px-3.5 py-1.5 ${accountMode === "new" ? "bg-fog-50 text-ink-950" : "text-content-muted"}`}
                      >
                        New customer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMode("existing");
                          setOtpRequested(false);
                        }}
                        className={`rounded-full px-3.5 py-1.5 ${accountMode === "existing" ? "bg-fog-50 text-ink-950" : "text-content-muted"}`}
                      >
                        I already have an account
                      </button>
                    </div>

                    {!otpRequested ? (
                      <form onSubmit={requestCode} className="space-y-4">
                        {accountMode === "new" && (
                          <>
                            <FieldGroup>
                              <FieldLabel htmlFor="sname">Full name</FieldLabel>
                              <TextField
                                id="sname"
                                required
                                value={signup.name}
                                onChange={(e) => setSignup((p) => ({ ...p, name: e.target.value }))}
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <FieldLabel htmlFor="semail">Email</FieldLabel>
                              <TextField
                                id="semail"
                                type="email"
                                required
                                value={signup.email}
                                onChange={(e) => setSignup((p) => ({ ...p, email: e.target.value }))}
                              />
                            </FieldGroup>
                          </>
                        )}
                        <FieldGroup>
                          <FieldLabel htmlFor="sphone">Mobile number</FieldLabel>
                          <TextField
                            id="sphone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+49 ..."
                          />
                        </FieldGroup>
                        {error && <ErrorText>{error}</ErrorText>}
                        <Button type="submit" size="lg" className="w-full" disabled={pending}>
                          {pending ? "Sending code…" : "Send verification code"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={verifyAndContinue} className="space-y-4">
                        <FieldGroup>
                          <FieldLabel htmlFor="code">One-time code</FieldLabel>
                          <TextField
                            id="code"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="6-digit code"
                            autoComplete="one-time-code"
                            maxLength={8}
                          />
                        </FieldGroup>
                        {devCode && (
                          <p className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[12.5px] text-brand-700">
                            Dev code: <strong>{devCode}</strong>
                          </p>
                        )}
                        {error && <ErrorText>{error}</ErrorText>}
                        <Button type="submit" size="lg" className="w-full" disabled={pending}>
                          {pending ? "Verifying…" : "Verify & continue"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setOtpRequested(false)}
                          className="w-full text-[13px] text-content-subtle hover:text-content"
                        >
                          Use a different number
                        </button>
                      </form>
                    )}
                  </Panel>
                )}

                {step === "address" && (
                  <Panel
                    title="Shipping address"
                    description="Where should we send your tags? Your phone stays private — it's only used for the masked-call relay and login."
                  >
                    <form onSubmit={continueToPayment} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldGroup>
                          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                          <TextField
                            id="fullName"
                            required
                            value={address.fullName}
                            onChange={(e) => setAddress((p) => ({ ...p, fullName: e.target.value }))}
                          />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel htmlFor="phone">Phone</FieldLabel>
                          <TextField
                            id="phone"
                            required
                            value={address.phone}
                            onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))}
                          />
                        </FieldGroup>
                      </div>
                      <FieldGroup>
                        <FieldLabel htmlFor="line1">Address line 1</FieldLabel>
                        <TextField
                          id="line1"
                          required
                          value={address.line1}
                          onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))}
                        />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel htmlFor="line2">Address line 2 (optional)</FieldLabel>
                        <TextField
                          id="line2"
                          value={address.line2}
                          onChange={(e) => setAddress((p) => ({ ...p, line2: e.target.value }))}
                        />
                      </FieldGroup>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <FieldGroup>
                          <FieldLabel htmlFor="city">City</FieldLabel>
                          <TextField
                            id="city"
                            required
                            value={address.city}
                            onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                          />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
                          <TextField
                            id="postalCode"
                            required
                            value={address.postalCode}
                            onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
                          />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel htmlFor="country">Country</FieldLabel>
                          <TextField
                            id="country"
                            required
                            value={address.country}
                            onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                          />
                        </FieldGroup>
                      </div>
                      {error && <ErrorText>{error}</ErrorText>}
                      <Button type="submit" size="lg" className="w-full" disabled={pending}>
                        {pending ? "Starting order…" : "Continue to payment"}
                      </Button>
                    </form>
                  </Panel>
                )}
              </div>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
                {planSummary}
                <div className="rounded-2xl border border-surface-border bg-white/60 p-5 text-[13.5px] text-content-muted">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-content-subtle">Why onboarding works this way</p>
                  <ul className="mt-3 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                      <span>We verify your phone so masked calls work from day one.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                      <span>Payment is one-time. No subscriptions, no surprise renewals.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                      <span>Your details are stored encrypted, under a versioned consent record.</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>
    </div>
  );
};

const Panel = ({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-3xl border border-surface-border bg-surface-soft p-7">
    <h2 className="font-display text-xl text-content">{title}</h2>
    {description && <p className="mt-1.5 text-[13.5px] text-content-muted">{description}</p>}
    <div className="mt-6">{children}</div>
  </section>
);

const ErrorText = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">{children}</p>
);
