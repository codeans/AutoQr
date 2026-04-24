import { Clock, Mail, MapPin, ShieldAlert, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";

const CHANNEL_ICONS: LucideIcon[] = [Mail, ShieldAlert, Clock, MapPin];
const CHANNEL_HREFS: (string | undefined)[] = [
  "mailto:support@autoqr.de",
  "mailto:safety@autoqr.de",
  undefined,
  undefined
];

type Channel = { label: string; value: string; hint: string };

export const ContactPage = () => {
  const { t } = useTranslation();
  const channels = t("contactExtra.channels", { returnObjects: true }) as Channel[];

  return (
    <>
      <PageHero
        eyebrow={t("contactExtra.eyebrow")}
        title={
          <>
            {t("contactExtra.heroTitle1")}{" "}
            <span className="text-brand-700">{t("contactExtra.heroTitleBrand")}</span>
          </>
        }
        subtitle={t("contactExtra.heroSubtitle")}
      />

      <section className="pb-24 pt-4 sm:pb-32">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {channels.map((c, idx) => {
              const Icon = CHANNEL_ICONS[idx] ?? Mail;
              const href = CHANNEL_HREFS[idx];
              const Card = (
                <div className="group flex h-full flex-col rounded-2xl border border-surface-border bg-white p-7 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-content-subtle">
                    {c.label}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold tracking-tight text-content">
                    {c.value}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-content-muted">
                    {c.hint}
                  </p>
                </div>
              );
              return href ? (
                <a key={c.label} href={href} className="block h-full">
                  {Card}
                </a>
              ) : (
                <div key={c.label}>{Card}</div>
              );
            })}
          </div>

          <div className="mt-16 overflow-hidden rounded-3xl border border-surface-border bg-surface-soft p-10 sm:p-14">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-700">
                  {t("contactExtra.activeIncident")}
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-4xl">
                  {t("contactExtra.incidentTitle")}
                </h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-content-muted">
                  {t("contactExtra.incidentBody")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <LinkButton to="/how-it-works" variant="secondary" size="lg">
                  {t("contactExtra.ctaFlow")}
                </LinkButton>
                <LinkButton to="/order" size="lg" showArrow>
                  {t("contactExtra.ctaOrder")}
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};
