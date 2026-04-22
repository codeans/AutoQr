import { Car, ShieldCheck, Timer, Zap } from "lucide-react";
import { CTASection } from "../components/marketing/home/CTASection";
import { LinkButton } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { HeadingBlock } from "../components/marketing/shared/HeadingBlock";
import { PageHero } from "../components/marketing/shared/PageHero";
import { Reveal, Stagger, StaggerItem } from "../components/marketing/shared/Reveal";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

const points = [
  {
    icon: ShieldCheck,
    title: "Your mobile number is never on the windshield.",
    body: "The tag is a signed identifier only. No printed phone number means no cold calls, no spam, no stalkers."
  },
  {
    icon: Zap,
    title: "Reporters reach you in under two minutes.",
    body: "A scan → submission → signed push lands on your device with full context and evidence already attached."
  },
  {
    icon: Timer,
    title: "You decide whether to take the call.",
    body: "Accept a secure in-browser WebRTC call, or reply later. Either way, the incident stays logged and trackable."
  }
];

export const ForCarOwnersPage = () => (
  <>
    <PageHero
      eyebrow="For vehicle owners"
      title={
        <>
          Your car, your privacy.<br className="hidden sm:block" />{" "}
          <span className="text-fog-400">Still reachable when it matters.</span>
        </>
      }
      subtitle="Leave parking-note anxiety behind. Every incident — a bump, a blocked driveway, a witness call — lands in a private, auditable channel instead of on a sticker."
    >
      <div className="flex flex-wrap gap-3">
        <LinkButton to="/order" size="lg" showArrow>
          Order for my car
        </LinkButton>
        <LinkButton to="/how-it-works" variant="secondary" size="lg">
          See the flow
        </LinkButton>
      </div>
    </PageHero>

    <SectionWrapper spacing="tight" divider>
      <Container>
        <HeadingBlock
          eyebrow="Why vehicle owners pick AutoQr"
          title={
            <>
              Stop leaking your number<br className="hidden sm:block" />{" "}
              <span className="text-fog-400">to every stranger with a phone.</span>
            </>
          }
        />
        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:grid-cols-3">
          {points.map((p) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title}>
                <div className="h-full bg-ink-900 p-8">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-950 text-accent">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-8 font-display text-xl font-medium tracking-tight text-fog-50 sm:text-[22px]">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-fog-300">
                    {p.body}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </SectionWrapper>

    <SectionWrapper spacing="tight" divider>
      <Container>
        <Reveal>
          <div className="grid gap-10 rounded-2xl border border-white/10 bg-ink-900 p-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16 lg:p-14">
            <Car className="h-16 w-16 text-accent" strokeWidth={1.3} />
            <div>
              <h2 className="font-display text-3xl font-medium tracking-tight text-fog-50 sm:text-4xl">
                One tag per vehicle. Registered, activated, private.
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-fog-300">
                Add your vehicle details, pay once, and we dispatch a premium
                sticker to your door. Activation is gated by your account, so
                the tag only becomes live when you confirm receipt.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton to="/order" size="md" showArrow>
                  Order a tag
                </LinkButton>
                <LinkButton to="/pricing" variant="secondary" size="md">
                  See pricing
                </LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </SectionWrapper>

    <CTASection />
  </>
);
