import { EyeOff, Radio, ShieldCheck } from "lucide-react";
import { Container } from "../shared/Container";
import { HeadingBlock } from "../shared/HeadingBlock";
import { Reveal, Stagger, StaggerItem } from "../shared/Reveal";
import { SectionWrapper } from "../shared/SectionWrapper";

const pillars = [
  {
    icon: EyeOff,
    title: "Your number stays yours",
    body:
      "Stickers printed with public phone numbers are a privacy leak. AutoQr replaces them with a signed identifier that never reveals you."
  },
  {
    icon: Radio,
    title: "Reachable through a secure bridge",
    body:
      "When someone scans your tag, they reach a trusted incident page with evidence capture and request a call — routed through us, never direct."
  },
  {
    icon: ShieldCheck,
    title: "Auditable, end to end",
    body:
      "Every scan, submission, and call outcome is logged with timestamps — so you know exactly what happened and when."
  }
];

export const ValueProposition = () => (
  <SectionWrapper id="value" divider>
    <Container>
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-5">
          <HeadingBlock
            eyebrow="The problem with stickers"
            title={
              <>
                A phone number on a dashboard is not a safety feature.{" "}
                <span className="text-fog-400">It's an exposure.</span>
              </>
            }
            subtitle="Parking tags and owner-contact stickers made sense a decade ago. Today they leak personal data to anyone with a camera — and still fail when a real incident happens."
            size="lg"
          />
          <Reveal delay={0.2}>
            <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:grid-cols-2">
              {[
                ["10.2k+", "tags issued"],
                ["0", "numbers exposed"]
              ].map(([v, l]) => (
                <div key={l} className="bg-ink-900 p-5">
                  <dt className="font-display text-3xl font-medium tracking-tight text-fog-50">
                    {v}
                  </dt>
                  <dd className="mt-1 text-xs uppercase tracking-[0.18em] text-fog-400">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Stagger className="space-y-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <StaggerItem key={pillar.title}>
                  <div className="group relative grid gap-6 bg-ink-900 p-8 transition-colors duration-300 hover:bg-ink-800 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-10">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog-500">
                        0{idx + 1}
                      </span>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-ink-950/60 text-accent transition group-hover:border-accent/40">
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.6} />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-medium tracking-tight text-fog-50 sm:text-2xl">
                        {pillar.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-fog-300">
                        {pillar.body}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </Container>
  </SectionWrapper>
);
