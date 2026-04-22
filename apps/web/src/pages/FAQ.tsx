import { CTASection } from "../components/marketing/home/CTASection";
import { FAQSection } from "../components/marketing/home/FAQSection";
import { PageHero } from "../components/marketing/shared/PageHero";

export const FaqPage = () => (
  <>
    <PageHero
      eyebrow="Frequently asked"
      title={
        <>
          Answers on trust, policy,<br className="hidden sm:block" />{" "}
          <span className="text-fog-400">and incident handling.</span>
        </>
      }
      subtitle="If your question isn't covered below, contact us directly. We answer every message from a real human within one business day."
    />
    <FAQSection />
    <CTASection />
  </>
);
