import { Container } from "../components/marketing/shared/Container";
import { HeadingBlock } from "../components/marketing/shared/HeadingBlock";
import { PageHero } from "../components/marketing/shared/PageHero";
import { Reveal } from "../components/marketing/shared/Reveal";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";
import { LinkButton } from "../components/marketing/shared/Button";

const SECTIONS = [
  {
    title: "Getting started",
    items: [
      { title: "Pick your first plan", to: "/plans" },
      { title: "Activate a tag", to: "/dashboard/activate" },
      { title: "Add a vehicle", to: "/dashboard/vehicles" }
    ]
  },
  {
    title: "Privacy & masked calling",
    items: [
      { title: "How masked calling works", to: "/how-it-works" },
      { title: "What happens on a scan", to: "/use-cases" },
      { title: "Privacy policy", to: "/privacy" }
    ]
  },
  {
    title: "Account & billing",
    items: [
      { title: "Cancel or reassign a tag", to: "/dashboard/tags" },
      { title: "Update shipping address", to: "/dashboard/profile" },
      { title: "Contact support", to: "/contact" }
    ]
  }
];

export const HelpCenterPage = () => (
  <>
    <PageHero
      eyebrow="Help center"
      title="Guides, FAQs, and contact."
      subtitle="Everything you need to run AutoQR like a pro — for owners, partners, and emergency contacts."
    />
    <SectionWrapper>
      <Container>
        <HeadingBlock
          eyebrow="Browse topics"
          title="Short answers, clear steps."
          subtitle="Can't find what you need? Our team replies within one business day."
          align="left"
        />
        <Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {SECTIONS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h3 className="font-display text-xl text-fog-50">{s.title}</h3>
                <ul className="mt-4 space-y-2 text-[14px] text-fog-300">
                  {s.items.map((it) => (
                    <li key={it.to}>
                      <a className="hover:text-fog-50" href={it.to}>
                        {it.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="mt-16 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/[0.06] bg-ink-900/50 p-8">
          <div>
            <h3 className="font-display text-2xl text-fog-50">Still need a human?</h3>
            <p className="mt-2 text-[14px] text-fog-300">Our support team is available Mon-Sat 9:00-18:00 CET.</p>
          </div>
          <LinkButton to="/contact" size="lg" showArrow>
            Contact support
          </LinkButton>
        </div>
      </Container>
    </SectionWrapper>
  </>
);
