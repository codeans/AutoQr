import { useEffect, useState } from "react";
import { Container } from "../../../components/marketing/shared/Container";
import { HeadingBlock } from "../../../components/marketing/shared/HeadingBlock";
import { PageHero } from "../../../components/marketing/shared/PageHero";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchPlans } from "../services/plans.service";
import type { Plan } from "../types";
import { PlanCard } from "../components/PlanCard";

export const PlansScreen = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(() => setError("We couldn't load plans just now. Please refresh in a moment."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Plans"
        title="Pick a plan — start in under 3 minutes."
        subtitle="One-time payment. No subscriptions. No hidden fees. Each plan includes tags, emergency routing, and lifetime reassignment."
      />
      <SectionWrapper spacing="default">
        <Container>
          <HeadingBlock
            eyebrow="Transparent pricing"
            title="Built for one vehicle, a family, or a fleet."
            subtitle="Plans differ in how many tags and contacts you get, plus support level. Privacy features are identical across tiers."
            align="center"
          />
          <Reveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {loading && <p className="text-fog-300">Loading…</p>}
              {error && <p className="text-red-300">{error}</p>}
              {plans.map((p) => (
                <PlanCard key={p._id} plan={p} />
              ))}
            </div>
          </Reveal>
          <Reveal>
            <p className="mt-10 text-center text-[12.5px] text-fog-500">
              Need more than Business? <a href="/partner" className="text-fog-200 underline-offset-4 hover:underline">Talk to sales</a> for volume pricing.
            </p>
          </Reveal>
        </Container>
      </SectionWrapper>
    </>
  );
};
