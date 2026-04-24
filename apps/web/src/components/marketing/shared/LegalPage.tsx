import { useTranslation } from "react-i18next";
import { Container } from "./Container";
import { PageHero } from "./PageHero";
import { useLegalContent } from "../content/useLegalContent";

type LegalPageProps = {
  slug: string;
  eyebrowKey?: string;
  eyebrow?: string;
};

export const LegalPage = ({ slug, eyebrowKey, eyebrow }: LegalPageProps) => {
  const { t } = useTranslation();
  const content = useLegalContent(slug);
  const resolvedEyebrow = eyebrowKey
    ? (t(eyebrowKey) as string)
    : eyebrow ?? (t("footer.legal") as string);

  return (
    <>
      <PageHero eyebrow={resolvedEyebrow} title={content.title} subtitle={content.intro}>
        {content.updatedLabel && (
          <p className="text-sm text-content-subtle">{content.updatedLabel}</p>
        )}
      </PageHero>

      <section className="pb-24 pt-8 sm:pb-32">
        <Container>
          <div className="mx-auto max-w-3xl space-y-10">
            {content.sections.map((section) => (
              <article
                key={section.heading}
                className="rounded-2xl border border-surface-border bg-white p-8 shadow-soft"
              >
                <h2 className="text-xl font-semibold tracking-tight text-content sm:text-2xl">
                  {section.heading}
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-content-muted">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
};
