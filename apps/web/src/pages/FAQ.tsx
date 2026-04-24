import { useTranslation } from "react-i18next";
import { CTASection } from "../components/marketing/home/CTASection";
import { FAQSection } from "../components/marketing/home/FAQSection";
import { PageHero } from "../components/marketing/shared/PageHero";

export const FaqPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageHero
        eyebrow={t("faqPageExtra.eyebrow")}
        title={
          <>
            {t("faqPageExtra.heroTitle1")}{" "}
            <span className="text-brand-700">{t("faqPageExtra.heroTitleBrand")}</span>
          </>
        }
        subtitle={t("faqPageExtra.heroSubtitle")}
      />
      <FAQSection />
      <CTASection />
    </>
  );
};
