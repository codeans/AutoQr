import { Container } from "../components/marketing/shared/Container";
import { HeadingBlock } from "../components/marketing/shared/HeadingBlock";
import { PageHero } from "../components/marketing/shared/PageHero";
import { Reveal } from "../components/marketing/shared/Reveal";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

const USE_CASES = [
  {
    title: "Daily parking",
    body: "Blocked driveway, restricted zone, tight spot. Reporter hits a reason, owner moves within minutes — no number ever exchanged.",
    metric: "Average owner response: 2m 14s"
  },
  {
    title: "Forgotten headlights",
    body: "Headlights left on in a supermarket car park. AutoQR alerts the owner before the battery is dead.",
    metric: "Prevents ~18% of dead-battery call-outs"
  },
  {
    title: "Towing & abandonment",
    body: "Officer or courier about to tow. One scan, one reason — owner gets push + SMS and can race to the spot.",
    metric: "Works offline for the reporter"
  },
  {
    title: "Accidents & emergencies",
    body: "An emergency scan escalates to all emergency contacts across SMS, WhatsApp, and email.",
    metric: "Up to 10 emergency contacts per account"
  },
  {
    title: "Fleet & business",
    body: "Deploy tags across a fleet and manage activations centrally. Disable and reassign tags as vehicles change hands.",
    metric: "Bulk activation, audit logged"
  },
  {
    title: "High-value assets",
    body: "Not just vehicles — scooters, e-bikes, motorbikes, and mobility aids. Same privacy, same relay.",
    metric: "6 asset types supported"
  }
];

export const UseCasesPage = () => (
  <>
    <PageHero
      eyebrow="Use cases"
      title="From parking to emergency — one private relay."
      subtitle="Every AutoQR interaction runs through the privacy relay. The owner's number is never shared. Here's how real situations play out."
    />
    <SectionWrapper>
      <Container>
        <HeadingBlock
          eyebrow="Six recurring scenarios"
          title="Designed for calm moments — and the loud ones."
          subtitle="Each use case is modelled on real reporter and owner flows. Reason selection drives severity, which drives channels."
        />
        <Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((u) => (
              <article
                key={u.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-white/20"
              >
                <h3 className="font-display text-2xl text-fog-50">{u.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">{u.body}</p>
                <p className="mt-auto pt-6 text-[12px] uppercase tracking-[0.2em] text-accent">{u.metric}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </Container>
    </SectionWrapper>
  </>
);
