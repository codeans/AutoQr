import { FileCheck2, Lock, ScrollText, Server } from "lucide-react";
import { Container } from "../shared/Container";
import { HeadingBlock } from "../shared/HeadingBlock";
import { Reveal, Stagger, StaggerItem } from "../shared/Reveal";
import { SectionWrapper } from "../shared/SectionWrapper";

const pillars = [
  {
    icon: Lock,
    title: "Zero public exposure",
    body: "Car owner phone, email and address are never printed on the sticker, never broadcast."
  },
  {
    icon: Server,
    title: "EU-based infrastructure",
    body: "Car data hosted in Germany. Backups encrypted at rest with AES-256."
  },
  {
    icon: FileCheck2,
    title: "GDPR-aligned workflow",
    body: "Explicit reporter consent, data minimisation, erasure on request."
  },
  {
    icon: ScrollText,
    title: "Full audit trail",
    body: "Every car scan, submission and call event is signed and timestamped."
  }
];

const testimonial = {
  quote:
    "AutoQR replaced a fragile process where car drivers kept writing phone numbers on cardboard behind the windshield. Now every scan lands in a system — with proof, timestamps, and accountability.",
  name: "M. Brenner",
  role: "Car fleet operations, Berlin"
};

const stats = [
  { v: "10.2k+", l: "Car tags in the field" },
  { v: "99.98%", l: "Privacy bridge uptime" },
  { v: "<90s", l: "Scan → car owner latency" },
  { v: "0", l: "Numbers leaked" }
];

const logoWords = ["FLEETCO", "MOBILITAS", "PARKSAFE", "NORDVAG", "ADRIA", "URBANCARGO"];

export const TrustSection = () => (
  <SectionWrapper id="trust" divider>
    <Container>
      <HeadingBlock
        eyebrow="Trust & compliance"
        title={
          <>
            Built for operators who cannot afford<br className="hidden sm:block" />{" "}
            <span className="text-fog-400">privacy incidents.</span>
          </>
        }
        subtitle="We operate as the system of record between your asset and the public. That means engineering-grade reliability, compliance that stands up to scrutiny, and trust that's verifiable — not assumed."
      />

      <Reveal delay={0.1}>
        <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 px-6 py-8 sm:gap-x-16">
            {logoWords.map((word) => (
              <span
                key={word}
                className="font-mono text-[13px] font-medium tracking-[0.28em] text-fog-400/80 transition hover:text-fog-200"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <figure className="relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-ink-900 p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(233,199,154,0.08),transparent_60%)]"
              />
              <svg
                aria-hidden
                className="h-8 w-8 text-accent/80"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9.3 7C6.4 7 4 9.4 4 12.3c0 2 1.3 3.6 3.2 3.6.3 0 .6 0 .9-.1-.3 1.9-1.9 3.3-3.8 3.3V21c4.7 0 7.8-3.1 7.8-8.4C12.1 8.9 11 7 9.3 7Zm10 0c-2.9 0-5.3 2.4-5.3 5.3 0 2 1.3 3.6 3.2 3.6.3 0 .6 0 .9-.1-.3 1.9-1.9 3.3-3.8 3.3V21c4.7 0 7.8-3.1 7.8-8.4C22.1 8.9 21 7 19.3 7Z" />
              </svg>
              <blockquote className="mt-8 font-display text-xl font-medium leading-snug tracking-tight text-fog-50 sm:text-2xl">
                "{testimonial.quote}"
              </blockquote>
              <figcaption className="mt-10 border-t border-white/10 pt-6">
                <div className="text-sm font-semibold text-fog-100">{testimonial.name}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-fog-400">
                  {testimonial.role}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Stagger className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title}>
                  <div className="h-full bg-ink-900 p-7">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.6} />
                    <h4 className="mt-6 font-display text-lg font-medium tracking-tight text-fog-50">
                      {p.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-fog-300">{p.body}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal delay={0.2}>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.l} className="bg-ink-900 p-6">
                  <dt className="font-display text-[28px] font-medium tracking-tight text-fog-50">
                    {s.v}
                  </dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.2em] text-fog-400">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </Container>
  </SectionWrapper>
);
