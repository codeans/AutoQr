import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../../../components/marketing/shared/Field";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchPlan, publicCheckout } from "../services/plans.service";
import type { Plan } from "../types";
import { formatCurrency } from "../types";

type AddressForm = {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export const PublicCheckoutScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadError, setLoadError] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: "Germany"
    } as AddressForm,
    note: ""
  });

  useEffect(() => {
    if (!slug) return;
    fetchPlan(slug)
      .then(setPlan)
      .catch(() => setLoadError("Plan not found."));
  }, [slug]);

  const summary = useMemo(() => {
    if (!plan) return null;
    return (
      <div className="rounded-3xl border border-surface-border bg-surface-soft p-8">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-content-subtle">
          <span className="h-px w-6 bg-fog-400/40" />
          {plan.tier}
        </div>
        <h1 className="mt-4 font-display text-4xl text-content">{plan.name}</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-content-muted">{plan.description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-surface-border bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-content-subtle">You pay</p>
            <p className="mt-1 font-display text-3xl text-content">{formatCurrency(plan.priceCents, plan.currency)}</p>
            <p className="mt-1 text-[12.5px] text-content0">{plan.billingCycle === "one_time" ? "One-time payment" : "Yearly"}</p>
          </div>
          <div className="rounded-2xl border border-surface-border bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-content-subtle">Includes</p>
            <p className="mt-1 font-display text-3xl text-content">{plan.tagsIncluded} QR tag{plan.tagsIncluded > 1 ? "s" : ""}</p>
            <p className="mt-1 text-[12.5px] text-content0">Activation happens after delivery</p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/60 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-700" />
          <p className="text-[13.5px] text-content-muted">
            Your QR becomes active only after you create an account and activate it with the activation code you receive with your QR.
          </p>
        </div>
      </div>
    );
  }, [plan]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!plan) return;
    const payload = {
      planId: plan._id,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      shippingAddress: {
        line1: form.address.line1.trim(),
        line2: (form.address.line2 ?? "").trim() || undefined,
        city: form.address.city.trim(),
        postalCode: form.address.postalCode.trim(),
        country: form.address.country.trim()
      },
      note: form.note.trim() || undefined
    };

    setPending(true);
    try {
      const pay = await publicCheckout(payload);
      if (pay.url) window.location.href = pay.url;
      else setError("Stripe checkout failed. Please try again.");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Checkout failed.");
    } finally {
      setPending(false);
    }
  };

  if (loadError) {
    return (
      <SectionWrapper>
        <Container>
          <p className="text-red-600">{loadError}</p>
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

  return (
    <div className="relative min-h-screen bg-surface-soft">
      <SectionWrapper spacing="default">
        <Container size="narrow">
          <Reveal>
            <Link to="/plans" className="text-[13px] text-content-subtle hover:text-content">
              ← Plans
            </Link>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>{summary}</div>

              <div className="rounded-3xl border border-surface-border bg-white/60 p-8">
                <h2 className="font-display text-2xl text-content">Checkout</h2>
                <p className="mt-2 text-[13.5px] text-content-muted">
                  Your order/shipping details are used for dispatch. The QR is linked to your account only after activation.
                </p>

                <form onSubmit={submit} className="mt-8 space-y-6">
                  {error && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{error}</p>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-content-subtle">Contact</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldGroup>
                        <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                        <TextField id="fullName" required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                        <TextField id="phone" required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+49 …" />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <TextField id="email" required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                      </FieldGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-content-subtle">Shipping address</h3>
                    <FieldGroup>
                      <FieldLabel htmlFor="line1">Address line</FieldLabel>
                      <TextField id="line1" required value={form.address.line1} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, line1: e.target.value } }))} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="line2">Address line 2 (optional)</FieldLabel>
                      <TextField id="line2" value={form.address.line2 ?? ""} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, line2: e.target.value } }))} />
                    </FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldGroup>
                        <FieldLabel htmlFor="city">City</FieldLabel>
                        <TextField id="city" required value={form.address.city} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
                        <TextField
                          id="postalCode"
                          required
                          value={form.address.postalCode}
                          onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, postalCode: e.target.value } }))}
                        />
                      </FieldGroup>
                    </div>
                    <FieldGroup>
                      <FieldLabel htmlFor="country">Country</FieldLabel>
                      <TextField id="country" required value={form.address.country} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, country: e.target.value } }))} />
                    </FieldGroup>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-content-subtle">Optional note</h3>
                    <FieldGroup>
                      <FieldLabel htmlFor="note">Delivery note</FieldLabel>
                      <TextArea id="note" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                    </FieldGroup>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={pending}>
                    {pending ? "Redirecting to payment…" : `Pay ${formatCurrency(plan.priceCents, plan.currency)}`}
                  </Button>

                  <p className="text-center text-[12.5px] text-content-subtle">
                    By paying, you agree that your QR becomes active only after account creation and activation.
                  </p>
                </form>
              </div>
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>
    </div>
  );
};

