import { LinkButton } from "../shared/Button";
import { Container } from "../shared/Container";
import { GridBackdrop } from "../shared/GridBackdrop";
import { Reveal } from "../shared/Reveal";
import { SectionWrapper } from "../shared/SectionWrapper";

export const CTASection = () => (
  <SectionWrapper id="cta" spacing="loose" className="relative overflow-hidden">
    <GridBackdrop />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(233,199,154,0.08),transparent_55%)]"
    />
    <Container>
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-800 via-ink-900 to-ink-950 px-6 py-16 sm:px-12 sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[440px] w-[440px] rounded-full bg-accent/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.5),transparent)]"
          />

          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-fog-300">
              Secure your identity
            </span>
            <h2
              className="mt-8 font-display text-[44px] font-medium leading-[0.98] tracking-[-0.04em] text-fog-50 sm:text-[64px] lg:text-[84px]"
              style={{ textWrap: "balance" }}
            >
              Give every asset a private address.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-fog-300 sm:text-lg">
              One-time purchase, lifetime protection, real infrastructure behind every scan.
              Start with a single tag or deploy across a fleet.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <LinkButton to="/order" size="lg" showArrow>
                Order AutoQr — €49
              </LinkButton>
              <LinkButton to="/contact" variant="secondary" size="lg">
                Talk to us
              </LinkButton>
            </div>
            <p className="mt-6 text-xs text-fog-500">
              Free shipping across DE · activation within 24h of delivery
            </p>
          </div>
        </div>
      </Reveal>
    </Container>
  </SectionWrapper>
);
