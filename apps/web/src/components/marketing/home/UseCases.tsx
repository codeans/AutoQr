import { ArrowRight, Car, Home, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../shared/Container";
import { HeadingBlock } from "../shared/HeadingBlock";
import { Stagger, StaggerItem } from "../shared/Reveal";
import { SectionWrapper } from "../shared/SectionWrapper";

const cases = [
  {
    icon: Car,
    title: "Everyday car owners",
    body: "Park anywhere in Germany without leaving your number on the dashboard. Reporters contact you through the privacy bridge in seconds.",
    tag: "Most popular",
    to: "/for-car-owners"
  },
  {
    icon: Home,
    title: "Households with multiple cars",
    body: "One account, up to three cars on a family plan — plus one shared set of emergency contacts. Tag every car the same way.",
    tag: "Family",
    to: "/pricing"
  },
  {
    icon: Truck,
    title: "Small car fleets",
    body: "For rental operators and small mobility companies running cars only. Centralised activation, audit logs per car, fleet dashboard.",
    tag: "Business",
    to: "/partner"
  },
  {
    icon: Users,
    title: "People who share parking",
    body: "Shared driveways, garages, street spots — the scan flow covers wrong parking, blocking, headlights on, flat tyre and emergency contact in one place.",
    tag: "Urban",
    to: "/how-it-works"
  }
];

export const UseCases = () => (
  <SectionWrapper id="use-cases" divider>
    <Container>
      <HeadingBlock
        eyebrow="Who it's for"
        title={
          <>
            Built for car owners.<br className="hidden sm:block" />{" "}
            <span className="text-fog-400">From one car to a fleet of cars.</span>
          </>
        }
        subtitle="AutoQR is specialised for cars only — private car owners, households with multiple cars, and small car fleets. The primitives stay identical: car stickers, privacy bridge, audit log per scan."
      />

      <Stagger className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => {
          const Icon = c.icon;
          const wide = i === 0;
          return (
            <StaggerItem
              key={c.title}
              className={wide ? "lg:col-span-2" : ""}
            >
              <Link
                to={c.to}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900 p-8 transition-all duration-300 hover:border-white/20 hover:bg-ink-800"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 80% 0%, rgba(233,199,154,0.12), transparent 55%)"
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-950 text-accent">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-fog-300">
                    {c.tag}
                  </span>
                </div>
                <h3 className="relative mt-10 font-display text-2xl font-medium tracking-tight text-fog-50 sm:text-[26px]">
                  {c.title}
                </h3>
                <p className="relative mt-3 max-w-md text-[15px] leading-relaxed text-fog-300">
                  {c.body}
                </p>
                <div className="relative mt-auto flex items-center gap-2 pt-10 text-[13px] font-medium text-fog-200 group-hover:text-accent">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Container>
  </SectionWrapper>
);
