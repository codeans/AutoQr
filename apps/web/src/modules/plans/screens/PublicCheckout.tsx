import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../../../components/marketing/shared/Field";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchPlan, publicCheckout } from "../services/plans.service";
import type { Plan } from "../types";
import { formatCurrency } from "../types";
import { localizePlan } from "../planDisplay";

type AddressForm = {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export const PublicCheckoutScreen = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadError, setLoadError] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => ({
    fullName: "",
    phone: "",
    email: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: t("plans.checkoutDefaultCountry")
    } as AddressForm,
    note: ""
  }));

  useEffect(() => {
    if (!slug) return;
    fetchPlan(slug)
      .then(setPlan)
      .catch(() => setLoadError(t("plans.planNotFound")));
  }, [slug, t]);

  const summary = useMemo(() => {
    if (!plan) return null;
    const copy = localizePlan(plan, i18n.language);
    const tierLabel = t(`home.planTier.${plan.tier}`, { defaultValue: plan.tier });
    const tagsTitle =
      plan.tagsIncluded === 1
        ? t("plans.checkoutTagsLine", { count: plan.tagsIncluded })
        : t("plans.checkoutTagsLine_plural", { count: plan.tagsIncluded });
    return (
      <div className="rounded-3xl border border-surface-border bg-surface-soft p-8">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-content-subtle">
          <span className="h-px w-6 bg-fog-400/40" />
          {tierLabel}
        </div>
        <h1 className="mt-4 font-display text-4xl text-content">{copy.name}</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-content-muted">{copy.description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-surface-border bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-content-subtle">{t("plans.checkoutYouPay")}</p>
            <p className="mt-1 font-display text-3xl text-content">{formatCurrency(plan.priceCents, plan.currency, i18n.language)}</p>
            <p className="mt-1 text-[12.5px] text-content0">
              {plan.billingCycle === "one_time" ? t("plans.oneTimePayment") : t("plans.billedYearly")}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-border bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-content-subtle">{t("plans.checkoutIncludes")}</p>
            <p className="mt-1 font-display text-3xl text-content">{tagsTitle}</p>
            <p className="mt-1 text-[12.5px] text-content0">{t("plans.checkoutActivationNote")}</p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/60 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-700" />
          <p className="text-[13.5px] text-content-muted">{t("plans.checkoutFootnote")}</p>
        </div>
      </div>
    );
  }, [plan, t, i18n.language]);

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
      else setError(t("plans.checkoutStripeFailed"));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("plans.checkoutGenericFailed"));
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
            {t("plans.backToPlans")}
          </Link>
        </Container>
      </SectionWrapper>
    );
  }

  if (!plan) {
    return (
      <SectionWrapper>
        <Container>{t("plans.loading")}</Container>
      </SectionWrapper>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface-soft">
      <SectionWrapper spacing="default">
        <Container>
          <Reveal>
            <Link to="/plans" className="text-[13px] text-content-subtle hover:text-content">
              {t("plans.backToPlans")}
            </Link>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>{summary}</div>

              <div className="rounded-3xl border border-surface-border bg-white/60 p-8">
                <h2 className="font-display text-2xl text-content">{t("plans.checkoutTitle")}</h2>
                <p className="mt-2 text-[13.5px] text-content-muted">{t("plans.checkoutIntro")}</p>

                <form onSubmit={submit} className="mt-8 space-y-6">
                  {error && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{error}</p>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-content-subtle">{t("plans.checkoutSectionContact")}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldGroup>
                        <FieldLabel htmlFor="fullName">{t("plans.checkoutLabelFullName")}</FieldLabel>
                        <TextField id="fullName" required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel htmlFor="phone">{t("plans.checkoutLabelPhone")}</FieldLabel>
                        <TextField
                          id="phone"
                          required
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder={t("plans.checkoutPhonePlaceholder")}
                        />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel htmlFor="email">{t("plans.checkoutLabelEmail")}</FieldLabel>
                        <TextField id="email" required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                      </FieldGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-content-subtle">{t("plans.checkoutSectionShipping")}</h3>
                    <FieldGroup>
                      <FieldLabel htmlFor="line1">{t("plans.checkoutLabelAddressLine1")}</FieldLabel>
                      <TextField id="line1" required value={form.address.line1} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, line1: e.target.value } }))} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="line2">{t("plans.checkoutLabelAddressLine2")}</FieldLabel>
                      <TextField id="line2" value={form.address.line2 ?? ""} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, line2: e.target.value } }))} />
                    </FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldGroup>
                        <FieldLabel htmlFor="city">{t("plans.checkoutLabelCity")}</FieldLabel>
                        <TextField id="city" required value={form.address.city} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel htmlFor="postalCode">{t("plans.checkoutLabelPostalCode")}</FieldLabel>
                        <TextField
                          id="postalCode"
                          required
                          value={form.address.postalCode}
                          onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, postalCode: e.target.value } }))}
                        />
                      </FieldGroup>
                    </div>
                    <FieldGroup>
                      <FieldLabel htmlFor="country">{t("plans.checkoutLabelCountry")}</FieldLabel>
                      <TextField id="country" required value={form.address.country} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, country: e.target.value } }))} />
                    </FieldGroup>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-content-subtle">{t("plans.checkoutSectionNoteOptional")}</h3>
                    <FieldGroup>
                      <FieldLabel htmlFor="note">{t("plans.checkoutLabelDeliveryNote")}</FieldLabel>
                      <TextArea id="note" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                    </FieldGroup>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={pending}>
                    {pending
                      ? t("plans.checkoutRedirecting")
                      : t("plans.checkoutPayButton", { amount: formatCurrency(plan.priceCents, plan.currency, i18n.language) })}
                  </Button>

                  <p className="text-center text-[12.5px] text-content-subtle">{t("plans.checkoutLegalConsent")}</p>
                </form>
              </div>
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>
    </div>
  );
};

