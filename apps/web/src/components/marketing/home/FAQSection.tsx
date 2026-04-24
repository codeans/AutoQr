import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const FAQSection = () => {
  const { faq } = useMarketingContent();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-surface-soft py-24 sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
              {faq.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
              {faq.headline}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-content-muted sm:text-lg">
              {faq.description}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="divide-y divide-surface-border overflow-hidden rounded-2xl border border-surface-border bg-white">
              {faq.items.map((item, idx) => {
                const isOpen = open === idx;
                return (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className="group flex w-full flex-col px-6 py-5 text-left transition hover:bg-brand-50/40 sm:px-8"
                  >
                    <span className="flex items-center justify-between gap-6">
                      <span className="text-base font-semibold text-content sm:text-lg">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-content-subtle transition-transform ${
                          isOpen ? "rotate-180 text-brand-700" : ""
                        }`}
                      />
                    </span>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-1 pt-3 text-sm leading-relaxed text-content-muted">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
