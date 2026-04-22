import { Benefits } from "../components/marketing/home/Benefits";
import { CTASection } from "../components/marketing/home/CTASection";
import { FAQSection } from "../components/marketing/home/FAQSection";
import { Hero } from "../components/marketing/home/Hero";
import { HowItWorksSection } from "../components/marketing/home/HowItWorksSection";
import { PlatformShowcase } from "../components/marketing/home/PlatformShowcase";
import { TrustSection } from "../components/marketing/home/TrustSection";
import { UseCases } from "../components/marketing/home/UseCases";
import { ValueProposition } from "../components/marketing/home/ValueProposition";

export const HomePage = () => (
  <>
    <Hero />
    <ValueProposition />
    <Benefits />
    <HowItWorksSection />
    <TrustSection />
    <PlatformShowcase />
    <UseCases />
    <FAQSection />
    <CTASection />
  </>
);
