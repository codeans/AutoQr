import { useTranslation } from "react-i18next";
import { CTASection } from "../components/marketing/home/CTASection";
import { Privacy } from "../components/marketing/home/Privacy";
import { Solution } from "../components/marketing/home/Solution";
import { Workflow } from "../components/marketing/home/Workflow";
import { LinkButton } from "../components/marketing/shared/Button";
import { PageHero } from "../components/marketing/shared/PageHero";

export const HowItWorksPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageHero
        eyebrow={t("howItWorksPageExtra.eyebrow")}
        title={
          <>
            {t("howItWorksPageExtra.heroTitle1")}{" "}
            <span className="text-brand-700">{t("howItWorksPageExtra.heroTitleBrand")}</span>
          </>
        }
        subtitle={t("howItWorksPageExtra.heroSubtitle")}
      >
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton to="/order" size="lg" showArrow>
            {t("howItWorksPageExtra.ctaOrder")}
          </LinkButton>
          <LinkButton to="/pricing" variant="secondary" size="lg">
            {t("howItWorksPageExtra.ctaPricing")}
          </LinkButton>
        </div>
      </PageHero>
      <Solution />
      <Workflow />
      <Privacy />
      <CTASection />
    </>
  );
};
