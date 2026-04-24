import { Check, PackageCheck, Sparkles, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CTASection } from "../components/marketing/home/CTASection";
import { LinkButton } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";

const stepIcons = [Sparkles, Truck, PackageCheck];

export const OrderPage = () => {
  const { t } = useTranslation();
  const steps = t("orderPage.steps", { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;
  const included = t("orderPage.included", { returnObjects: true }) as string[];

  return (
    <>
      <PageHero
        eyebrow={t("orderPage.eyebrow")}
        title={
          <>
            {t("orderPage.titlePart1")}{" "}
            <span className="text-brand-700">{t("orderPage.titleHighlight")}</span>
          </>
        }
        subtitle={t("orderPage.subtitle")}
      >
        <div className="flex flex-wrap gap-3">
          <LinkButton to="/register" size="lg" showArrow>
            {t("orderPage.startRegistration")}
          </LinkButton>
          <LinkButton to="/how-it-works" variant="secondary" size="lg">
            {t("orderPage.seeFullProcess")}
          </LinkButton>
        </div>
      </PageHero>

      <section className="bg-white pb-24 pt-4 sm:pb-32">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-surface-border bg-white shadow-soft">
              {steps.map((s, i) => {
                const Icon = stepIcons[i] ?? Sparkles;
                return (
                  <div
                    key={s.title}
                    className="flex gap-6 border-b border-surface-border p-7 last:border-b-0 sm:gap-8 sm:p-9"
                  >
                    <div className="flex flex-col items-center">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-content-subtle">
                        0{i + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold tracking-tight text-content sm:text-[22px]">
                        {s.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-content-muted">
                        {s.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="flex h-full flex-col gap-6 rounded-3xl border border-surface-border bg-surface-soft p-8 shadow-soft">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-700">
                  {t("orderPage.whatYouGet")}
                </p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-semibold tracking-tight text-content">
                    €29
                  </span>
                  <span className="text-sm text-content-muted">{t("orderPage.priceCaption")}</span>
                </div>
              </div>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-content">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-3">
                <LinkButton to="/register" size="lg" showArrow className="w-full">
                  {t("orderPage.beginOrder")}
                </LinkButton>
                <p className="text-center text-[11.5px] text-content-subtle">
                  {t("orderPage.priceFooter")}
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
};
