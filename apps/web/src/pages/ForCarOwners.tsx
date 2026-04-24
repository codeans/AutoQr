import { Car, ShieldCheck, Timer, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CTASection } from "../components/marketing/home/CTASection";
import { LinkButton } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";

const POINT_ICONS = [ShieldCheck, Zap, Timer];

export const ForCarOwnersPage = () => {
  const { t } = useTranslation();
  const points = t("forCarOwnersPageExtra.points", { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;

  return (
    <>
      <PageHero
        eyebrow={t("forCarOwnersPageExtra.eyebrow")}
        title={
          <>
            {t("forCarOwnersPageExtra.heroTitle1")}{" "}
            <span className="text-brand-700">{t("forCarOwnersPageExtra.heroTitleBrand")}</span>
          </>
        }
        subtitle={t("forCarOwnersPageExtra.heroSubtitle")}
      >
        <div className="flex flex-wrap gap-3">
          <LinkButton to="/order" size="lg" showArrow>
            {t("forCarOwnersPageExtra.ctaOrder")}
          </LinkButton>
          <LinkButton to="/how-it-works" variant="secondary" size="lg">
            {t("forCarOwnersPageExtra.ctaFlow")}
          </LinkButton>
        </div>
      </PageHero>

      <section className="bg-white py-24 sm:py-32">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {points.map((p, idx) => {
              const Icon = POINT_ICONS[idx] ?? ShieldCheck;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-surface-border bg-surface-soft p-8 transition hover:border-brand-200 hover:bg-white hover:shadow-card"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-content">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-content-muted">{p.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid gap-10 rounded-3xl border border-surface-border bg-surface-soft p-10 shadow-soft lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16 lg:p-14">
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-700 text-white">
              <Car className="h-10 w-10" strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-content sm:text-4xl">
                {t("forCarOwnersPageExtra.featureTitle")}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-content-muted">
                {t("forCarOwnersPageExtra.featureBody")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton to="/order" size="md" showArrow>
                  {t("forCarOwnersPageExtra.ctaOrderShort")}
                </LinkButton>
                <LinkButton to="/pricing" variant="secondary" size="md">
                  {t("forCarOwnersPageExtra.ctaPricingShort")}
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
};
