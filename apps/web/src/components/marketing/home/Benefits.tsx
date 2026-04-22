import { Container } from "../shared/Container";
import { HeadingBlock } from "../shared/HeadingBlock";
import { Stagger, StaggerItem } from "../shared/Reveal";
import { SectionWrapper } from "../shared/SectionWrapper";

const benefits = [
  {
    index: "01",
    title: "One purchase. Lifetime car coverage.",
    body:
      "No subscriptions, no renewal fees, no surprise invoices. Buy once and keep the tag operational for the life of your car — move it between cars you own whenever you want."
  },
  {
    index: "02",
    title: "Your number stays invisible.",
    body:
      "We never print a phone number on your car sticker. Every public scan routes through a verified privacy bridge with abuse protections and rate-limits."
  },
  {
    index: "03",
    title: "Real-time car scan alerts.",
    body:
      "The moment someone scans your car and picks a reason — wrong parking, headlights on, towing, emergency — you get a signed push with evidence and timestamp."
  },
  {
    index: "04",
    title: "Secure in-browser calls.",
    body:
      "WebRTC audio between the reporter and the car owner — no app installs, no exposed numbers, and full call records retained for review."
  },
  {
    index: "05",
    title: "Built for serious car operators.",
    body:
      "Audit trails, content moderation, and admin review for every car incident. Suitable for private car owners, households, and small car fleets."
  },
  {
    index: "06",
    title: "Physical car stickers from Germany.",
    body:
      "Premium weather-proof car stickers dispatched from Germany. Every tag is serialized, activation-gated, and traceable end-to-end to a registered car."
  }
];

export const Benefits = () => (
  <SectionWrapper id="benefits" divider>
    <Container>
      <HeadingBlock
        eyebrow="Why car owners choose us"
        title={
          <>
            Premium infrastructure<br className="hidden sm:block" />{" "}
            <span className="text-fog-400">for a quietly critical car-owner problem.</span>
          </>
        }
        subtitle="We built AutoQR for people who care about how their personal data moves through the world when their car is parked — and for car operators who need a serious system of record for every scan and incident."
      />

      <Stagger className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <StaggerItem key={benefit.index}>
            <article className="group relative flex h-full flex-col bg-ink-900 p-8 transition-colors duration-300 hover:bg-ink-800">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fog-500">
                  {benefit.index}
                </span>
                <span
                  className="h-px w-10 bg-white/10 transition-all group-hover:w-16 group-hover:bg-accent/50"
                  aria-hidden
                />
              </div>
              <h3 className="mt-10 font-display text-2xl font-medium leading-tight tracking-tight text-fog-50 sm:text-[26px]">
                {benefit.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-fog-300">
                {benefit.body}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  </SectionWrapper>
);
