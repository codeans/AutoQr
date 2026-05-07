import { CATALOG_PLAN_SLUGS } from "@autoqr/shared";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "../../../components/marketing/shared/Container";
import { HeadingBlock } from "../../../components/marketing/shared/HeadingBlock";
import { PageHero } from "../../../components/marketing/shared/PageHero";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchPlans } from "../services/plans.service";
import type { Plan } from "../types";
import { PlanCard } from "../components/PlanCard";

const slugOrder = new Map(CATALOG_PLAN_SLUGS.map((s, i) => [s, i]));

export const PlansScreen = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlans()
      .then((list) => {
        const sorted = [...list].sort((a, b) => {
          const ia = slugOrder.get(a.slug as (typeof CATALOG_PLAN_SLUGS)[number]) ?? 99;
          const ib = slugOrder.get(b.slug as (typeof CATALOG_PLAN_SLUGS)[number]) ?? 99;
          return ia - ib;
        });
        setPlans(sorted);
      })
      .catch(() => setError(t("plans.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <>
      <PageHero eyebrow={t("plans.eyebrow")} title={t("plans.pageTitle")} subtitle={t("plans.pageSubtitle")} />
      <SectionWrapper spacing="default">
        <Container>
          <HeadingBlock
            eyebrow={t("plans.sectionEyebrow")}
            title={t("plans.sectionTitle")}
            subtitle={t("plans.sectionSubtitle")}
            align="center"
          />
          <Reveal>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {loading && <p className="text-content-muted">{t("plans.loadingPlans")}</p>}
              {error && <p className="text-red-600">{error}</p>}
              {plans.map((p) => (
                <PlanCard key={p._id} plan={p} />
              ))}
            </div>
          </Reveal>
          <Reveal>
            <p className="mt-10 text-center text-[12.5px] text-content-subtle">
              {t("plans.needMoreThanBusiness")}{" "}
              <a href="/partner" className="text-brand-700 underline-offset-4 hover:underline">
                {t("plans.talkToSales")}
              </a>{" "}
              {t("plans.talkToSalesSuffix")}
            </p>
          </Reveal>
        </Container>
      </SectionWrapper>
    </>
  );
};
