import { Clock, Mail, MapPin, ShieldAlert } from "lucide-react";
import { LinkButton } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";
import { Reveal } from "../components/marketing/shared/Reveal";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

const channels = [
  {
    icon: Mail,
    label: "General",
    value: "support@autoqr.de",
    href: "mailto:support@autoqr.de",
    hint: "Product questions, orders, account help"
  },
  {
    icon: ShieldAlert,
    label: "Trust & safety",
    value: "safety@autoqr.de",
    href: "mailto:safety@autoqr.de",
    hint: "Abuse reports, takedown requests, policy"
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Fri · 09:00–18:00 CET",
    hint: "Most tickets answered within 4 hours"
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Berlin, Germany",
    hint: "EU data residency · hosted in DE"
  }
];

export const ContactPage = () => (
  <>
    <PageHero
      eyebrow="Get in touch"
      title={
        <>
          A real team,<br className="hidden sm:block" />{" "}
          <span className="text-fog-400">on the other side of the message.</span>
        </>
      }
      subtitle="Whether you're evaluating AutoQr for a fleet, handling an active incident, or just have a question — we're reachable and we reply."
    />

    <SectionWrapper spacing="tight" divider>
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => {
            const Icon = c.icon;
            const Card = (
              <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900 p-7 transition hover:border-white/20 hover:bg-ink-800">
                <Icon className="h-5 w-5 text-accent" strokeWidth={1.6} />
                <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-fog-400">
                  {c.label}
                </p>
                <p className="mt-2 font-display text-lg font-medium tracking-tight text-fog-50">
                  {c.value}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-fog-300">
                  {c.hint}
                </p>
              </div>
            );
            return (
              <Reveal key={c.label}>
                {c.href ? (
                  <a href={c.href} className="block h-full">
                    {Card}
                  </a>
                ) : (
                  Card
                )}
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-800 to-ink-900 p-10 sm:p-14">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fog-400">
                  Active incident?
                </p>
                <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-fog-50 sm:text-4xl">
                  Don't email us. Scan the tag.
                </h2>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fog-300">
                  The fastest way to reach an owner is through the AutoQr
                  sticker itself. Submit details and request a call — everything
                  is captured and logged for follow-up.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <LinkButton to="/how-it-works" variant="secondary" size="lg">
                  Read the flow
                </LinkButton>
                <LinkButton to="/order" size="lg" showArrow>
                  Order a tag
                </LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </SectionWrapper>
  </>
);
