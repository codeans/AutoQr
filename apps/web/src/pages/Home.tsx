import { CTASection } from "../components/marketing/home/CTASection";
import { CarsKeys } from "../components/marketing/home/CarsKeys";
import { FAQSection } from "../components/marketing/home/FAQSection";
import { Hero } from "../components/marketing/home/Hero";
import { Pricing } from "../components/marketing/home/Pricing";
import { Privacy } from "../components/marketing/home/Privacy";
import { Problem } from "../components/marketing/home/Problem";
import { Solution } from "../components/marketing/home/Solution";
import { Testimonials } from "../components/marketing/home/Testimonials";
import { Workflow } from "../components/marketing/home/Workflow";

export const HomePage = () => (
  <>
    <Hero />
    <Problem />
    <Solution />
    <CarsKeys />
    <Workflow />
    <Privacy />
    <Pricing />
    <Testimonials />
    <FAQSection />
    <CTASection />
  </>
);
