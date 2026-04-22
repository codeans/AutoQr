import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Container } from "../shared/Container";
import { HeadingBlock } from "../shared/HeadingBlock";
import { SectionWrapper } from "../shared/SectionWrapper";

const faqs = [
  {
    q: "Can someone look up my phone number from the car QR?",
    a: "No. The car sticker carries a signed public identifier only. The person who scans your car lands on a trusted AutoQR page where they submit details and request a bridge call. Your number is never exposed."
  },
  {
    q: "Is AutoQR only for cars?",
    a: "Yes. AutoQR is specialised for cars only — private cars, household cars, and small car fleets. The reasons, the scan page, the dashboard, and the audit trail are all built around real car-owner situations."
  },
  {
    q: "How is this different from a generic QR sticker?",
    a: "Generic stickers route to a phone number or email you control, leaking personal data to anyone with a camera. AutoQR operates a private car-owner bridge — with evidence capture, consent, rate-limiting, and a full audit trail for every scan."
  },
  {
    q: "Is there a recurring fee?",
    a: "No. You pay once and the car tag stays operational for the life of the car. Replacement tags and additional cars can be added from your account at any time."
  },
  {
    q: "What car-owner situations does AutoQR cover?",
    a: "Wrong parking, blocking a driveway, headlights left on, flat tyre, car being towed, doors or windows left open, car damaged, and accident / emergency — plus a free-form 'other' reason."
  },
  {
    q: "Do calls require an app or account for the reporter?",
    a: "No. Calls run in-browser over WebRTC — the person who reports about your car only needs a modern browser and microphone permission. Everything is encrypted (DTLS + SRTP)."
  },
  {
    q: "Can I use AutoQR for a small car fleet?",
    a: "Yes. Small car fleet operators get a central console to issue car tags, track and resolve incidents across every car, with role-based access and export of the audit log."
  },
  {
    q: "What data do you store about reporters?",
    a: "Only what they consent to: name (optional), phone number (optional), message about your car, uploaded evidence, and call metadata. All of it is retention-governed and erasable on request."
  }
];

export const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionWrapper id="faq" divider>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <HeadingBlock
            eyebrow="Answers"
            title={
              <>
                Questions,<br /> answered.
              </>
            }
            subtitle="Straightforward answers to the questions car owners ask us most — how the privacy bridge works, what we store, and what you actually pay for."
            size="lg"
          />
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.q} className="group">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-10 py-6 text-left transition-colors hover:text-fog-50 sm:py-8"
                    aria-expanded={isOpen}
                  >
                    <span className="flex-1 font-display text-[17px] font-medium tracking-tight text-fog-100 sm:text-[19px]">
                      {faq.q}
                    </span>
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isOpen
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-white/10 bg-white/[0.02] text-fog-300 group-hover:border-white/20"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-3xl pb-8 pr-16 text-[15px] leading-relaxed text-fog-300">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
};
