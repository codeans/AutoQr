import { Check, PackageCheck, Sparkles, Truck } from "lucide-react";
import { CTASection } from "../components/marketing/home/CTASection";
import { LinkButton } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";
import { Reveal } from "../components/marketing/shared/Reveal";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

const steps = [
  {
    icon: Sparkles,
    title: "Create your account & pay",
    body: "Name, email, shipping address, contact number, then a single payment. Your order is matched to a QR sticker from our pre-printed inventory."
  },
  {
    icon: Truck,
    title: "Your pre-printed QR sticker ships",
    body: "We dispatch a QR sticker from stock — already printed, serialized, and packaged with your one-time activation code."
  },
  {
    icon: PackageCheck,
    title: "Activate it and bind it to your car",
    body: "After delivery, sign in, enter the activation code on your sticker, and add your car details. That permanently binds the QR to your account."
  }
];

const included = [
  "Weather-grade printed tag",
  "Lifetime bridge access",
  "Signed audit log of every scan",
  "Owner dashboard with incidents & calls"
];

export const OrderPage = () => (
  <>
    <PageHero
      eyebrow="Order AutoQr"
      title={
        <>
          Three steps to a tag that<br className="hidden sm:block" />{" "}
          <span className="text-fog-400">protects without exposing.</span>
        </>
      }
      subtitle="A single purchase, a single piece of infrastructure, a lifetime of privacy-first incident handling."
    >
      <div className="flex flex-wrap gap-3">
        <LinkButton to="/register" size="lg" showArrow>
          Start registration
        </LinkButton>
        <LinkButton to="/how-it-works" variant="secondary" size="lg">
          See the full process
        </LinkButton>
      </div>
    </PageHero>

    <SectionWrapper spacing="tight" divider>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="flex gap-6 bg-ink-900 p-7 transition hover:bg-ink-800 sm:gap-8 sm:p-9">
                    <div className="flex flex-col items-center">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-950 text-accent">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-fog-500">
                        0{i + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-medium tracking-tight text-fog-50 sm:text-[22px]">
                        {s.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-fog-300">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.15}>
            <aside className="flex h-full flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-b from-ink-800 to-ink-900 p-8">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fog-400">
                  What you get
                </p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-medium tracking-tight text-fog-50">
                    €49
                  </span>
                  <span className="text-sm text-fog-400">one-time</span>
                </div>
              </div>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-fog-200">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-3">
                <LinkButton to="/register" size="lg" showArrow className="w-full">
                  Begin order
                </LinkButton>
                <p className="text-center text-[11.5px] text-fog-500">
                  Pre-printed from inventory and shipped with a one-time activation code.
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </Container>
    </SectionWrapper>

    <CTASection />
  </>
);
