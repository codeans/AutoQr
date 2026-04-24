import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../components/marketing/shared/Field";
import { PageHero } from "../components/marketing/shared/PageHero";

export const PartnerPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", volume: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const benefits = t("partnerPageExtra.benefits", { returnObjects: true }) as string[];

  return (
    <>
      <PageHero
        eyebrow={t("partnerPageExtra.eyebrow")}
        title={t("partnerPageExtra.heroTitle")}
        subtitle={t("partnerPageExtra.heroSubtitle")}
      />
      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-content">
                {t("partnerPageExtra.benefitsTitle")}
              </h2>
              <ul className="mt-6 space-y-4 text-base text-content-muted">
                {benefits.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-700" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {submitted ? (
              <div className="rounded-3xl border border-brand-100 bg-brand-50 p-8 text-center">
                <h3 className="font-display text-2xl font-semibold text-content">
                  {t("partnerPageExtra.thanksTitle")}
                </h3>
                <p className="mt-3 text-base text-content-muted">
                  {t("partnerPageExtra.thanksBody")}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl border border-surface-border bg-white p-8 shadow-soft">
                <h3 className="font-display text-xl font-semibold text-content">
                  {t("partnerPageExtra.formTitle")}
                </h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <FieldLabel htmlFor="company">{t("partnerPageExtra.companyLabel")}</FieldLabel>
                    <TextField id="company" required value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="name">{t("partnerPageExtra.nameLabel")}</FieldLabel>
                    <TextField id="name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="email">{t("partnerPageExtra.emailLabel")}</FieldLabel>
                    <TextField id="email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="phone">{t("partnerPageExtra.phoneLabel")}</FieldLabel>
                    <TextField id="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="volume">{t("partnerPageExtra.volumeLabel")}</FieldLabel>
                    <TextField id="volume" placeholder={t("partnerPageExtra.volumePlaceholder")} value={form.volume} onChange={(e) => setForm((p) => ({ ...p, volume: e.target.value }))} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="notes">{t("partnerPageExtra.notesLabel")}</FieldLabel>
                    <TextArea id="notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
                  </FieldGroup>
                </div>
                <Button size="lg" type="submit" className="mt-6 w-full">
                  {t("partnerPageExtra.submit")}
                </Button>
              </form>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};
