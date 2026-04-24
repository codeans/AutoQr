import { useTranslation } from "react-i18next";
import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";
import { LinkButton } from "../components/marketing/shared/Button";

const SECTION_LINKS: string[][] = [
  ["/order", "/dashboard/activate", "/dashboard/cars"],
  ["/how-it-works", "/use-cases", "/privacy"],
  ["/dashboard/tags", "/dashboard/profile", "/contact"]
];

type SectionItem = { title: string };
type Section = { title: string; items: SectionItem[] };

export const HelpCenterPage = () => {
  const { t } = useTranslation();
  const sections = t("helpCenterExtra.sections", { returnObjects: true }) as Section[];

  return (
    <>
      <PageHero
        eyebrow={t("helpCenterExtra.eyebrow")}
        title={t("helpCenterExtra.heroTitle")}
        subtitle={t("helpCenterExtra.heroSubtitle")}
      />
      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {sections.map((s, sIdx) => (
              <div key={s.title} className="rounded-2xl border border-surface-border bg-white p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-content">{s.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-content-muted">
                  {s.items.map((it, iIdx) => {
                    const to = SECTION_LINKS[sIdx]?.[iIdx] ?? "#";
                    return (
                      <li key={to}>
                        <a className="transition hover:text-brand-700" href={to}>
                          {it.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-start gap-4 rounded-3xl border border-surface-border bg-surface-soft p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-content">
                {t("helpCenterExtra.supportTitle")}
              </h3>
              <p className="mt-2 text-sm text-content-muted">
                {t("helpCenterExtra.supportHours")}
              </p>
            </div>
            <LinkButton to="/contact" size="lg" showArrow>
              {t("helpCenterExtra.contactSupport")}
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
};
