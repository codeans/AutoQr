import { ArrowRight, Cpu, MailCheck, PhoneCall, Scan, ShieldCheck } from "lucide-react";
import { Container } from "../shared/Container";
import { HeadingBlock } from "../shared/HeadingBlock";
import { Stagger, StaggerItem } from "../shared/Reveal";
import { SectionWrapper } from "../shared/SectionWrapper";

const steps = [
  {
    idx: "01",
    icon: ShieldCheck,
    title: "Order a car QR sticker",
    body:
      "Pick a plan and complete a single payment. We dispatch a pre-printed QR sticker from our physical inventory — no waiting on manufacturing after your order."
  },
  {
    idx: "02",
    icon: MailCheck,
    title: "Your QR sticker arrives with a one-time code",
    body:
      "Every sticker ships with its own one-time activation code. The QR is already printed and tamper-proof — only the activation step binds it to you."
  },
  {
    idx: "03",
    icon: Cpu,
    title: "Activate it and link your car",
    body:
      "Sign in, enter the activation code, and add your car details. The QR becomes permanently bound to your account and that specific car. The code can never be reused."
  },
  {
    idx: "04",
    icon: Scan,
    title: "Someone scans your parked car",
    body:
      "When wrong parking, headlights on, towing or another car incident happens, the scanner lands on a trusted page — pick a reason, leave a note, request a call."
  },
  {
    idx: "05",
    icon: PhoneCall,
    title: "You respond in-browser",
    body:
      "Get a push with the full car incident context. Accept a WebRTC call and speak to the reporter — your phone number is never shared."
  }
];

export const HowItWorksSection = () => (
  <SectionWrapper id="how-it-works" divider>
    <Container>
      <HeadingBlock
        eyebrow="How it works"
        title={
          <>
            Five steps from car sticker to resolution.<br className="hidden sm:block" />{" "}
            <span className="text-fog-400">Every one of them private.</span>
          </>
        }
        subtitle="A flow designed so that car-owner privacy never becomes a friction point — for you, for the person reporting about your car, or for the teams managing car fleets at scale."
      />

      <div className="relative mt-20">
        <div
          aria-hidden
          className="absolute left-[23px] top-4 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent sm:block"
        />
        <Stagger className="relative space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const last = i === steps.length - 1;
            return (
              <StaggerItem key={step.idx}>
                <div className="group relative grid gap-6 rounded-2xl border border-white/[0.06] bg-ink-900/60 p-6 transition-all duration-300 hover:border-white/15 hover:bg-ink-800/70 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:gap-10 sm:p-8">
                  <div className="relative z-10 flex items-center gap-3 sm:block">
                    <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-ink-950 text-accent transition group-hover:border-accent/40 group-hover:shadow-glow">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fog-500 sm:hidden">
                      STEP {step.idx}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-fog-500 sm:inline">
                        STEP {step.idx}
                      </span>
                      <h3 className="font-display text-xl font-medium tracking-tight text-fog-50 sm:text-2xl">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fog-300">
                      {step.body}
                    </p>
                  </div>
                  {!last && (
                    <ArrowRight className="hidden h-4 w-4 text-fog-500 transition group-hover:translate-x-1 group-hover:text-accent sm:inline" />
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Container>
  </SectionWrapper>
);
