import { Check } from "lucide-react";
import { CTASection } from "../components/marketing/home/CTASection";
import { FAQSection } from "../components/marketing/home/FAQSection";
import { LinkButton } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";
import { Reveal } from "../components/marketing/shared/Reveal";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

const included = [
  "Premium physical sticker (weather-grade)",
  "Signed, serialized tag identity",
  "Private incident bridge with evidence capture",
  "In-browser WebRTC call routing",
  "Signed audit log of every event",
  "Owner dashboard with incident timeline",
  "Admin-managed printing and shipping",
  "Lifetime tag operation — no renewals"
];

const extras = [
  { title: "Fleet volume", body: "Custom pricing from 50 tags. Centralised console, role-based access, exportable audit log." },
  { title: "Co-branding", body: "White-label reporter page and custom tag artwork for teams operating at scale." },
  { title: "Replacement tags", body: "Replace lost or damaged tags at a reduced rate — the identity migrates seamlessly." }
];

export const PricingPage = () => (
  <>
    <PageHero
      eyebrow="Pricing"
      title={
        <>
          One price. One purchase.<br className="hidden sm:block" />{" "}
          <span className="text-fog-400">Lifetime protection.</span>
        </>
      }
      subtitle="We think recurring fees for hardware-backed identity are wrong. You pay once — the tag keeps working as long as the asset exists."
    />

    <SectionWrapper spacing="tight" divider>
      <Container>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-800 to-ink-900 p-8 sm:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-fog-300">
                  AutoQr · Single tag
                </span>
                <div className="mt-8 flex items-baseline gap-3">
                  <span className="font-display text-7xl font-medium tracking-tight text-fog-50 sm:text-[96px]">
                    €49
                  </span>
                  <span className="text-sm text-fog-400">once · VAT incl.</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-fog-300">
                  Covers a single registered vehicle or asset with lifetime
                  access to the incident bridge and all platform features.
                </p>
                <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] text-fog-200">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <LinkButton to="/order" size="lg" showArrow>
                    Order now
                  </LinkButton>
                  <LinkButton to="/how-it-works" variant="secondary" size="lg">
                    See process
                  </LinkButton>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-6">
              {extras.map((extra) => (
                <div
                  key={extra.title}
                  className="rounded-2xl border border-white/10 bg-ink-900 p-7 transition hover:border-white/20"
                >
                  <h3 className="font-display text-lg font-medium tracking-tight text-fog-50">
                    {extra.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-fog-300">
                    {extra.body}
                  </p>
                </div>
              ))}
              <div className="mt-auto rounded-2xl border border-dashed border-white/10 p-7">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fog-400">
                  Talk to operations
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-fog-200">
                  For fleets, leasing companies or any deployment over 50
                  units, our team will scope a program with you.
                </p>
                <LinkButton to="/contact" variant="secondary" size="sm" className="mt-5">
                  Contact sales
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </SectionWrapper>

    <FAQSection />
    <CTASection />
  </>
);
