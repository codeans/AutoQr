import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Files, Headphones, Map, Shield } from "lucide-react";
import { useState } from "react";
import { Container } from "../shared/Container";
import { HeadingBlock } from "../shared/HeadingBlock";
import { Reveal } from "../shared/Reveal";
import { SectionWrapper } from "../shared/SectionWrapper";

type TabId = "incident" | "call" | "audit" | "ops";

const tabs: Array<{
  id: TabId;
  label: string;
  blurb: string;
  icon: typeof Shield;
}> = [
  {
    id: "incident",
    label: "Incident intake",
    blurb: "Structured reporter submissions with evidence, consent and signed timestamps.",
    icon: Files
  },
  {
    id: "call",
    label: "Secure bridge",
    blurb: "Owner gets a signed push. Accept a WebRTC call — no numbers shared.",
    icon: Headphones
  },
  {
    id: "audit",
    label: "Audit log",
    blurb: "Every action against a tag recorded, indexed, exportable.",
    icon: Shield
  },
  {
    id: "ops",
    label: "Fleet operations",
    blurb: "Lifecycle, shipping, activation and incident triage for teams.",
    icon: Map
  }
];

export const PlatformShowcase = () => {
  const [active, setActive] = useState<TabId>("incident");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <SectionWrapper id="platform" divider>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,1.4fr)] lg:gap-20">
          <div>
            <HeadingBlock
              eyebrow="The platform"
              title={
                <>
                  One console for tags, incidents and<br className="hidden sm:block" />{" "}
                  <span className="text-fog-400">the conversations in between.</span>
                </>
              }
              subtitle="AutoQr is not just a sticker. It's the operating surface for every identity you issue — with the tooling you'd expect from an enterprise-grade platform."
            />

            <div className="mt-10 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = active === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={clsx(
                      "group flex w-full items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200",
                      isActive
                        ? "border-white/15 bg-white/[0.04]"
                        : "border-white/[0.06] bg-transparent hover:border-white/10 hover:bg-white/[0.02]"
                    )}
                  >
                    <span
                      className={clsx(
                        "mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
                        isActive
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-white/10 bg-ink-900 text-fog-300"
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <span className="flex-1">
                      <span
                        className={clsx(
                          "block font-display text-[17px] font-medium tracking-tight",
                          isActive ? "text-fog-50" : "text-fog-200"
                        )}
                      >
                        {tab.label}
                      </span>
                      <span className="mt-1 block text-[13.5px] leading-relaxed text-fog-400">
                        {tab.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-elevate">
                <div className="flex items-center justify-between border-b border-white/10 bg-ink-800/60 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog-400">
                    autoqr.de / {current.label.toLowerCase()}
                  </span>
                  <BellRing className="h-3.5 w-3.5 text-fog-400" />
                </div>
                <div className="relative min-h-[420px] p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {active === "incident" && <IncidentPanel />}
                      {active === "call" && <CallPanel />}
                      {active === "audit" && <AuditPanel />}
                      {active === "ops" && <OpsPanel />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-white/5 py-3 last:border-0">
    <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-fog-500">
      {label}
    </span>
    <span className="text-[13.5px] text-fog-100">{value}</span>
  </div>
);

const IncidentPanel = () => (
  <div className="grid gap-6 sm:grid-cols-[1fr_1fr]">
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-200">
        Open incident
      </span>
      <h4 className="mt-5 font-display text-xl font-medium tracking-tight text-fog-50">
        INC-04821
      </h4>
      <p className="mt-1 text-[13px] text-fog-400">
        Submitted 03:42 PM · Berlin-Mitte
      </p>
      <div className="mt-5 space-y-1">
        <Field label="Tag" value="AQR-DE-003-ABCD" />
        <Field label="Reporter" value="Anna M. · +49 •• ••• 84" />
        <Field label="Evidence" value="3 images · 1.8 MB" />
        <Field label="Consent" value="Confirmed" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="rounded-xl border border-white/10 bg-ink-950 p-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-fog-400">
          Reporter message
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-fog-200">
          Light contact while parallel parking. No injuries. Left a note and
          submitted pictures of both bumpers.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-lg border border-white/10 bg-gradient-to-br from-ink-700 to-ink-900"
          />
        ))}
      </div>
    </div>
  </div>
);

const CallPanel = () => (
  <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
    <div className="relative">
      <div className="absolute inset-0 -m-6 rounded-full bg-accent/10 blur-2xl" aria-hidden />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
        <Headphones className="h-8 w-8" strokeWidth={1.5} />
      </div>
    </div>
    <h4 className="mt-8 font-display text-2xl font-medium tracking-tight text-fog-50">
      Incoming bridge call
    </h4>
    <p className="mt-2 max-w-sm text-[13.5px] text-fog-400">
      AutoQr is routing a verified reporter to you through an encrypted
      WebRTC channel. Your number is never revealed.
    </p>
    <div className="mt-8 flex gap-3">
      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-[12px] font-medium text-emerald-200">
        Accept
      </span>
      <span className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-[12px] font-medium text-fog-200">
        Decline
      </span>
    </div>
    <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fog-500">
      RTP · SRTP · DTLS 1.2
    </p>
  </div>
);

const AuditPanel = () => {
  const rows = [
    ["14:02", "tag.scan", "AQR-DE-003-ABCD", "Public IP anonymised"],
    ["14:02", "incident.create", "INC-04821", "3 files attached"],
    ["14:03", "call.request", "INC-04821", "TTL 180s"],
    ["14:03", "call.accept", "INC-04821", "Duration 02:41"],
    ["14:06", "incident.close", "INC-04821", "Reporter thanked"]
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="font-display text-lg font-medium tracking-tight text-fog-50">
          Event timeline
        </h4>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog-400">
          Signed · SHA-256
        </span>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left font-mono text-[12px]">
          <thead className="bg-white/[0.03] text-[10.5px] uppercase tracking-[0.18em] text-fog-400">
            <tr>
              <th className="px-3 py-2.5 font-medium">Time</th>
              <th className="px-3 py-2.5 font-medium">Event</th>
              <th className="px-3 py-2.5 font-medium">Reference</th>
              <th className="px-3 py-2.5 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-fog-200">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={clsx("px-3 py-2.5", j === 1 && "text-accent")}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OpsPanel = () => (
  <div>
    <div className="grid grid-cols-3 gap-3">
      {[
        ["Issued", "1,248"],
        ["Active", "1,206"],
        ["Incidents (30d)", "42"]
      ].map(([l, v]) => (
        <div key={l} className="rounded-xl border border-white/10 bg-ink-950 p-4">
          <div className="text-[10.5px] uppercase tracking-[0.2em] text-fog-400">
            {l}
          </div>
          <div className="mt-2 font-display text-2xl font-medium tracking-tight text-fog-50">
            {v}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-5 space-y-2">
      {[
        ["AQR-DE-0482", "Dispatched", "In transit · DHL"],
        ["AQR-DE-0481", "Printed", "Queued for pickup"],
        ["AQR-DE-0480", "Delivered", "Awaiting activation"]
      ].map(([id, status, detail]) => (
        <div
          key={id}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-950/70 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-accent/70" />
            <span className="font-mono text-[12.5px] text-fog-100">{id}</span>
          </div>
          <div className="flex items-center gap-3 text-right">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-fog-200">
              {status}
            </span>
            <span className="hidden text-[12px] text-fog-400 sm:inline">
              {detail}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
