import { useTranslation } from "react-i18next";
import { CTASection } from "../components/marketing/home/CTASection";
import { FAQSection } from "../components/marketing/home/FAQSection";
import { Pricing as PricingBlock } from "../components/marketing/home/Pricing";
import { Privacy } from "../components/marketing/home/Privacy";
import { PageHero } from "../components/marketing/shared/PageHero";

export const PricingPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageHero
        eyebrow={t("pricingPageExtra.eyebrow")}
        title={
          <>
            {t("pricingPageExtra.heroTitle1")}{" "}
            <span className="text-brand-700">{t("pricingPageExtra.heroTitleBrand")}</span>
          </>
        }
        subtitle={t("pricingPageExtra.heroSubtitle")}
      />
      <PricingBlock />
      <Privacy />
      <FAQSection />
      <CTASection />
    </>
  );
};
