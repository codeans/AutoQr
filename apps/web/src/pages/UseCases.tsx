import { useTranslation } from "react-i18next";
import { CTASection } from "../components/marketing/home/CTASection";
import { CarsKeys } from "../components/marketing/home/CarsKeys";
import { Privacy } from "../components/marketing/home/Privacy";
import { Workflow } from "../components/marketing/home/Workflow";
import { PageHero } from "../components/marketing/shared/PageHero";

export const UseCasesPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageHero
        eyebrow={t("useCasesPageExtra.eyebrow")}
        title={
          <>
            {t("useCasesPageExtra.heroTitle1")}{" "}
            <span className="text-brand-700">{t("useCasesPageExtra.heroTitleBrand")}</span>
          </>
        }
        subtitle={t("useCasesPageExtra.heroSubtitle")}
      />
      <CarsKeys />
      <Workflow />
      <Privacy />
      <CTASection />
    </>
  );
};
