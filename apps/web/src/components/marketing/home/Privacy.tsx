import { Lock, MapPin, Shield, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

const ICONS = [ShieldCheck, Lock, MapPin, Shield];

export const Privacy = () => {
  const { t } = useTranslation();
  const { privacy } = useMarketingContent();
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
              {privacy.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
              {privacy.headline}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-content-muted sm:text-lg">
              {privacy.description}
            </p>
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-medium text-brand-700">
              <ShieldCheck className="h-4 w-4" />
              {t("home.privacyBadge")}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {privacy.pillars.map((pillar, idx) => {
                const Icon = ICONS[idx % ICONS.length];
                return (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-surface-border bg-surface-soft p-6 transition hover:border-brand-200 hover:bg-white hover:shadow-card"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-content">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-content-muted">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
