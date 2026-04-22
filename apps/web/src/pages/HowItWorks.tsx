import { CTASection } from "../components/marketing/home/CTASection";
import { HowItWorksSection } from "../components/marketing/home/HowItWorksSection";
import { TrustSection } from "../components/marketing/home/TrustSection";
import { LinkButton } from "../components/marketing/shared/Button";
import { PageHero } from "../components/marketing/shared/PageHero";

export const HowItWorksPage = () => (
  <>
    <PageHero
      eyebrow="Operations"
      title={
        <>
          From purchase to resolved incident,<br className="hidden sm:block" />{" "}
          <span className="text-fog-400">transparent end-to-end.</span>
        </>
      }
      subtitle="AutoQr runs a disciplined operational flow. Every tag is issued, shipped, activated and monitored with the same rigor — whether you buy one or a thousand."
    >
      <div className="flex flex-wrap items-center gap-3">
        <LinkButton to="/order" size="lg" showArrow>
          Order your tag
        </LinkButton>
        <LinkButton to="/pricing" variant="secondary" size="lg">
          See pricing
        </LinkButton>
      </div>
    </PageHero>
    <HowItWorksSection />
    <TrustSection />
    <CTASection />
  </>
);
