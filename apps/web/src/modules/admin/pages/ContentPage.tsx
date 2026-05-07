import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, SecondaryButton, Textarea } from "../../../components/ui";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { adminService } from "../services/admin.service";
import { AdminContentItem } from "../types/admin.types";
import {
  MarketingContent,
  defaultMarketingContent,
  defaultMarketingContentByLocale
} from "../../../components/marketing/content/defaults";
import {
  LegalContent,
  defaultLegalContent,
  defaultLegalContentLocales
} from "../../../components/marketing/content/useLegalContent";
import type { Locale } from "@autoqr/shared";

type MarketingKey = keyof MarketingContent;

const MARKETING_TABS: { key: MarketingKey; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "useCases", label: "Cars & Keys" },
  { key: "workflow", label: "Workflow" },
  { key: "privacy", label: "Privacy" },
  { key: "pricing", label: "Pricing" },
  { key: "testimonials", label: "Testimonials" },
  { key: "faq", label: "FAQ" },
  { key: "cta", label: "CTA" }
];

const LEGAL_TABS = [
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms" },
  { slug: "refund-policy", label: "Refund Policy" },
  { slug: "shipping-policy", label: "Shipping Policy" },
  { slug: "about", label: "About" }
];

const marketingSections = (content: MarketingContent) =>
  MARKETING_TABS.map(({ key }) => ({ type: key, data: content[key] }));

const pickLocalizedSections = (record: AdminContentItem | undefined, locale: Locale) => {
  if (!record) return [];
  if (locale === "de") {
    return record.sections_de?.length ? record.sections_de : record.sections ?? [];
  }
  return record.sections_en?.length ? record.sections_en : record.sections ?? [];
};

const marketingFromRecord = (record: AdminContentItem | undefined, locale: Locale): MarketingContent => {
  if (!record) return defaultMarketingContentByLocale[locale];
  const map: Record<string, unknown> = {};
  for (const s of pickLocalizedSections(record, locale)) {
    const section = s as { type?: string; data?: unknown };
    if (section?.type) map[section.type] = section.data ?? section;
  }
  const merged: MarketingContent = { ...defaultMarketingContent };
  for (const tab of MARKETING_TABS) {
    if (map[tab.key] && typeof map[tab.key] === "object") {
      (merged as Record<string, unknown>)[tab.key] = {
        ...(defaultMarketingContent[tab.key] as object),
        ...(map[tab.key] as object)
      };
    }
  }
  return merged;
};

const legalFromRecord = (
  record: AdminContentItem | undefined,
  slug: string,
  locale: Locale
): LegalContent => {
  const fallback =
    defaultLegalContentLocales[locale][slug] ??
    defaultLegalContent[slug] ??
    { title: slug, updatedLabel: "", intro: "", sections: [] };
  if (!record) return fallback;
  const sections = pickLocalizedSections(record, locale);
  const legal = sections.find(
    (s: unknown) => typeof s === "object" && s && (s as { type?: string }).type === "legal"
  ) as { data?: Partial<LegalContent> } | undefined;
  if (!legal?.data) return fallback;
  return {
    title:
      legal.data.title ??
      (locale === "de" ? record.title_de : record.title_en) ??
      record.title ??
      fallback.title,
    updatedLabel: legal.data.updatedLabel ?? fallback.updatedLabel,
    intro: legal.data.intro ?? fallback.intro,
    sections: legal.data.sections?.length ? legal.data.sections : fallback.sections
  };
};

export const ContentPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: adminService.getContent
  });

  const records: AdminContentItem[] = data?.content ?? [];
  const byslug: Record<string, AdminContentItem> = useMemo(() => {
    const out: Record<string, AdminContentItem> = {};
    for (const r of records) out[r.slug] = r;
    return out;
  }, [records]);

  const [tab, setTab] = useState<"marketing" | "legal">("marketing");

  if (isLoading) return <LoadingState rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing content"
        subtitle="Edit the copy shown on the public site. Changes go live immediately on save."
      />

      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm">
        {[
          { key: "marketing", label: "Homepage" },
          { key: "legal", label: "Legal & pages" }
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as "marketing" | "legal")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              tab === t.key ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "marketing" ? (
        <MarketingEditor
          record={byslug["marketing"]}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin-content"] })}
        />
      ) : (
        <LegalEditor
          records={byslug}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin-content"] })}
        />
      )}
    </div>
  );
};

/* =========================================================================
 * Marketing editor
 * ========================================================================= */

const MarketingEditor = ({
  record,
  onSaved
}: {
  record?: AdminContentItem;
  onSaved: () => void;
}) => {
  const [editorLocale, setEditorLocale] = useState<Locale>("de");
  const [state, setState] = useState<Record<Locale, MarketingContent>>(() => ({
    de: marketingFromRecord(record, "de"),
    en: marketingFromRecord(record, "en")
  }));
  const [section, setSection] = useState<MarketingKey>("hero");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setState({
      de: marketingFromRecord(record, "de"),
      en: marketingFromRecord(record, "en")
    });
  }, [record]);

  const mutation = useMutation({
    mutationFn: () =>
      adminService.saveContent({
        slug: "marketing",
        title: record?.title ?? "Marketing",
        title_de: record?.title_de ?? "Marketing",
        title_en: record?.title_en ?? "Marketing",
        sections_de: marketingSections(state.de) as Array<Record<string, unknown>>,
        sections_en: marketingSections(state.en) as Array<Record<string, unknown>>
      }),
    onSuccess: () => {
      setStatus("saved");
      onSaved();
      setTimeout(() => setStatus("idle"), 2000);
    },
    onError: () => {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  });

  const update = (partial: Partial<MarketingContent[MarketingKey]>) => {
    setState((prev) => ({
      ...prev,
      [editorLocale]: {
        ...prev[editorLocale],
        [section]: {
          ...(prev[editorLocale][section] as object),
          ...(partial as object)
        }
      }
    }));
  };

  const save = () => {
    setStatus("saving");
    mutation.mutate();
  };

  return (
    <SectionCard
      title="Homepage editor"
      actions={
        <div className="flex items-center gap-3">
          {status === "saved" && <span className="text-xs text-emerald-600">Saved</span>}
          {status === "error" && <span className="text-xs text-red-600">Save failed</span>}
          <Button onClick={save} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {(["de", "en"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setEditorLocale(locale)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              editorLocale === locale
                ? "bg-brand-700 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {locale === "de" ? "Deutsch" : "English"}
          </button>
        ))}
        {MARKETING_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSection(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              section === t.key
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-6">
        <SectionEditor sectionKey={section} data={state[editorLocale][section]} onChange={update} />
      </div>
    </SectionCard>
  );
};

const SectionEditor = ({
  sectionKey,
  data,
  onChange
}: {
  sectionKey: MarketingKey;
  data: MarketingContent[MarketingKey];
  onChange: (partial: any) => void;
}) => {
  switch (sectionKey) {
    case "hero": {
      const d = data as MarketingContent["hero"];
      return (
        <FieldStack>
          <Row>
            <LabelledInput label="Eyebrow" value={d.eyebrow} onChange={(v) => onChange({ eyebrow: v })} />
          </Row>
          <Row>
            <LabelledInput label="Headline" value={d.headline} onChange={(v) => onChange({ headline: v })} />
            <LabelledInput label="Highlight" value={d.highlight} onChange={(v) => onChange({ highlight: v })} />
          </Row>
          <LabelledTextarea label="Description" value={d.description} onChange={(v) => onChange({ description: v })} />
          <Row>
            <LabelledInput label="Primary CTA label" value={d.primaryCta.label} onChange={(v) => onChange({ primaryCta: { ...d.primaryCta, label: v } })} />
            <LabelledInput label="Primary CTA link" value={d.primaryCta.to} onChange={(v) => onChange({ primaryCta: { ...d.primaryCta, to: v } })} />
          </Row>
          <Row>
            <LabelledInput label="Secondary CTA label" value={d.secondaryCta.label} onChange={(v) => onChange({ secondaryCta: { ...d.secondaryCta, label: v } })} />
            <LabelledInput label="Secondary CTA link" value={d.secondaryCta.to} onChange={(v) => onChange({ secondaryCta: { ...d.secondaryCta, to: v } })} />
          </Row>
          <LabelledInput label="Trust line" value={d.trustLine ?? ""} onChange={(v) => onChange({ trustLine: v })} />
        </FieldStack>
      );
    }
    case "problem": {
      const d = data as MarketingContent["problem"];
      return (
        <FieldStack>
          <HeaderFields eyebrow={d.eyebrow} headline={d.headline} description={d.description} onChange={onChange} />
          <ListEditor
            label="Items"
            items={d.items}
            onChange={(items) => onChange({ items })}
            fields={[
              { key: "icon", label: "Icon (car | key | eye | alert)" },
              { key: "title", label: "Title" },
              { key: "description", label: "Description", multiline: true }
            ]}
            template={{ icon: "car", title: "", description: "" }}
          />
        </FieldStack>
      );
    }
    case "solution": {
      const d = data as MarketingContent["solution"];
      return (
        <FieldStack>
          <HeaderFields eyebrow={d.eyebrow} headline={d.headline} description={d.description} onChange={onChange} />
          <ListEditor
            label="Steps"
            items={d.steps}
            onChange={(steps) => onChange({ steps })}
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", multiline: true }
            ]}
            template={{ title: "", description: "" }}
          />
        </FieldStack>
      );
    }
    case "useCases": {
      const d = data as MarketingContent["useCases"];
      const carFeatures = d.car.features ?? [];
      const keyFeatures = d.key.features ?? [];
      return (
        <FieldStack>
          <LabelledInput label="Headline" value={d.headline} onChange={(v) => onChange({ headline: v })} />
          <LabelledTextarea label="Description" value={d.description} onChange={(v) => onChange({ description: v })} />
          <h4 className="mt-4 text-sm font-semibold text-slate-700">Car use case</h4>
          <Row>
            <LabelledInput label="Title" value={d.car.title} onChange={(v) => onChange({ car: { ...d.car, title: v } })} />
          </Row>
          <LabelledInput
            label="Tagline"
            value={d.car.tagline ?? ""}
            onChange={(v) => onChange({ car: { ...d.car, tagline: v } })}
          />
          <LabelledTextarea label="Description" value={d.car.description} onChange={(v) => onChange({ car: { ...d.car, description: v } })} />
          <ListEditor
            label="Features"
            items={carFeatures}
            onChange={(features) => onChange({ car: { ...d.car, features } })}
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", multiline: true }
            ]}
            template={{ title: "", description: "" }}
          />

          <h4 className="mt-6 text-sm font-semibold text-slate-700">Key use case</h4>
          <Row>
            <LabelledInput label="Title" value={d.key.title} onChange={(v) => onChange({ key: { ...d.key, title: v } })} />
          </Row>
          <LabelledInput
            label="Tagline"
            value={d.key.tagline ?? ""}
            onChange={(v) => onChange({ key: { ...d.key, tagline: v } })}
          />
          <LabelledTextarea label="Description" value={d.key.description} onChange={(v) => onChange({ key: { ...d.key, description: v } })} />
          <ListEditor
            label="Features"
            items={keyFeatures}
            onChange={(features) => onChange({ key: { ...d.key, features } })}
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", multiline: true }
            ]}
            template={{ title: "", description: "" }}
          />
        </FieldStack>
      );
    }
    case "workflow": {
      const d = data as MarketingContent["workflow"];
      return (
        <FieldStack>
          <HeaderFields eyebrow={d.eyebrow} headline={d.headline} description={d.description} onChange={onChange} />
          <ListEditor
            label="Workflow steps"
            items={d.steps}
            onChange={(steps) => onChange({ steps })}
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", multiline: true }
            ]}
            template={{ title: "", description: "" }}
          />
        </FieldStack>
      );
    }
    case "privacy": {
      const d = data as MarketingContent["privacy"];
      return (
        <FieldStack>
          <HeaderFields eyebrow={d.eyebrow} headline={d.headline} description={d.description} onChange={onChange} />
          <ListEditor
            label="Privacy pillars"
            items={d.pillars}
            onChange={(pillars) => onChange({ pillars })}
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", multiline: true }
            ]}
            template={{ title: "", description: "" }}
          />
        </FieldStack>
      );
    }
    case "pricing": {
      const d = data as MarketingContent["pricing"];
      return (
        <FieldStack>
          <HeaderFields eyebrow={d.eyebrow} headline={d.headline} description={d.description} onChange={onChange} />
          <Row>
            <LabelledInput label="Price" value={d.price} onChange={(v) => onChange({ price: v })} />
            <LabelledInput label="Price caption" value={d.priceCaption} onChange={(v) => onChange({ priceCaption: v })} />
          </Row>
          <StringListEditor label="Features" items={d.features} onChange={(features) => onChange({ features })} />
          <Row>
            <LabelledInput label="CTA label" value={d.cta.label} onChange={(v) => onChange({ cta: { ...d.cta, label: v } })} />
            <LabelledInput label="CTA link" value={d.cta.to} onChange={(v) => onChange({ cta: { ...d.cta, to: v } })} />
          </Row>
        </FieldStack>
      );
    }
    case "testimonials": {
      const d = data as MarketingContent["testimonials"];
      return (
        <FieldStack>
          <LabelledInput label="Headline" value={d.headline} onChange={(v) => onChange({ headline: v })} />
          <LabelledTextarea label="Description" value={d.description} onChange={(v) => onChange({ description: v })} />
          <ListEditor
            label="Testimonials"
            items={d.items}
            onChange={(items) => onChange({ items })}
            fields={[
              { key: "quote", label: "Quote", multiline: true },
              { key: "author", label: "Author" },
              { key: "role", label: "Role / city" }
            ]}
            template={{ quote: "", author: "", role: "" }}
          />
        </FieldStack>
      );
    }
    case "faq": {
      const d = data as MarketingContent["faq"];
      return (
        <FieldStack>
          <HeaderFields eyebrow={d.eyebrow} headline={d.headline} description={d.description} onChange={onChange} />
          <ListEditor
            label="Questions"
            items={d.items}
            onChange={(items) => onChange({ items })}
            fields={[
              { key: "question", label: "Question" },
              { key: "answer", label: "Answer", multiline: true }
            ]}
            template={{ question: "", answer: "" }}
          />
        </FieldStack>
      );
    }
    case "cta": {
      const d = data as MarketingContent["cta"];
      return (
        <FieldStack>
          <LabelledInput label="Headline" value={d.headline} onChange={(v) => onChange({ headline: v })} />
          <LabelledTextarea label="Description" value={d.description} onChange={(v) => onChange({ description: v })} />
          <Row>
            <LabelledInput label="Primary CTA label" value={d.primaryCta.label} onChange={(v) => onChange({ primaryCta: { ...d.primaryCta, label: v } })} />
            <LabelledInput label="Primary CTA link" value={d.primaryCta.to} onChange={(v) => onChange({ primaryCta: { ...d.primaryCta, to: v } })} />
          </Row>
          <Row>
            <LabelledInput label="Secondary CTA label" value={d.secondaryCta.label} onChange={(v) => onChange({ secondaryCta: { ...d.secondaryCta, label: v } })} />
            <LabelledInput label="Secondary CTA link" value={d.secondaryCta.to} onChange={(v) => onChange({ secondaryCta: { ...d.secondaryCta, to: v } })} />
          </Row>
        </FieldStack>
      );
    }
    default:
      return null;
  }
};

/* =========================================================================
 * Legal editor
 * ========================================================================= */

const LegalEditor = ({
  records,
  onSaved
}: {
  records: Record<string, AdminContentItem>;
  onSaved: () => void;
}) => {
  const [slug, setSlug] = useState(LEGAL_TABS[0].slug);
  const [editorLocale, setEditorLocale] = useState<Locale>("de");
  const [content, setContent] = useState<Record<Locale, LegalContent>>(() => ({
    de: legalFromRecord(records[slug], slug, "de"),
    en: legalFromRecord(records[slug], slug, "en")
  }));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setContent({
      de: legalFromRecord(records[slug], slug, "de"),
      en: legalFromRecord(records[slug], slug, "en")
    });
  }, [slug, records]);

  const mutation = useMutation({
    mutationFn: () =>
      adminService.saveContent({
        slug,
        title: records[slug]?.title || slug,
        title_de: content.de.title || slug,
        title_en: content.en.title || slug,
        sections_de: [{ type: "legal", data: content.de }] as Array<Record<string, unknown>>,
        sections_en: [{ type: "legal", data: content.en }] as Array<Record<string, unknown>>
      }),
    onSuccess: () => {
      setStatus("saved");
      onSaved();
      setTimeout(() => setStatus("idle"), 2000);
    },
    onError: () => {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  });

  const save = () => {
    setStatus("saving");
    mutation.mutate();
  };

  return (
    <SectionCard
      title="Legal & content pages"
      actions={
        <div className="flex items-center gap-3">
          {status === "saved" && <span className="text-xs text-emerald-600">Saved</span>}
          {status === "error" && <span className="text-xs text-red-600">Save failed</span>}
          <Button onClick={save} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {LEGAL_TABS.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => setSlug(t.slug)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              slug === t.slug
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
        {(["de", "en"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setEditorLocale(locale)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              editorLocale === locale
                ? "bg-brand-700 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {locale === "de" ? "Deutsch" : "English"}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-6">
        <Row>
          <LabelledInput
            label="Title"
            value={content[editorLocale].title}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                [editorLocale]: { ...c[editorLocale], title: v }
              }))
            }
          />
          <LabelledInput
            label="Last updated label"
            value={content[editorLocale].updatedLabel}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                [editorLocale]: { ...c[editorLocale], updatedLabel: v }
              }))
            }
          />
        </Row>
        <LabelledTextarea
          label="Intro"
          value={content[editorLocale].intro}
          onChange={(v) =>
            setContent((c) => ({
              ...c,
              [editorLocale]: { ...c[editorLocale], intro: v }
            }))
          }
        />

        <ListEditor
          label="Sections"
          items={content[editorLocale].sections}
          onChange={(sections) =>
            setContent((c) => ({
              ...c,
              [editorLocale]: { ...c[editorLocale], sections }
            }))
          }
          fields={[
            { key: "heading", label: "Heading" },
            { key: "body", label: "Body", multiline: true }
          ]}
          template={{ heading: "", body: "" }}
        />
      </div>
    </SectionCard>
  );
};

/* =========================================================================
 * Small building blocks
 * ========================================================================= */

const FieldStack = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-4">{children}</div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-3 md:grid-cols-2">{children}</div>
);

const HeaderFields = ({
  eyebrow,
  headline,
  description,
  onChange
}: {
  eyebrow: string;
  headline: string;
  description: string;
  onChange: (partial: { eyebrow?: string; headline?: string; description?: string }) => void;
}) => (
  <>
    <Row>
      <LabelledInput label="Eyebrow" value={eyebrow} onChange={(v) => onChange({ eyebrow: v })} />
      <LabelledInput label="Headline" value={headline} onChange={(v) => onChange({ headline: v })} />
    </Row>
    <LabelledTextarea label="Description" value={description} onChange={(v) => onChange({ description: v })} />
  </>
);

const LabelledInput = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="block text-sm">
    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
    <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
  </label>
);

const LabelledTextarea = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="block text-sm">
    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
    <Textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
  </label>
);

type FieldSpec = { key: string; label: string; multiline?: boolean };

const ListEditor = <T extends Record<string, unknown>>({
  label,
  items,
  onChange,
  fields,
  template
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldSpec[];
  template: T;
}) => {
  const update = (idx: number, key: string, value: string) => {
    const next = items.slice();
    next[idx] = { ...next[idx], [key]: value } as T;
    onChange(next);
  };
  const add = () => onChange([...(items ?? []), { ...template }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <Button type="button" onClick={add} className="px-3 py-1.5 text-xs">
          Add
        </Button>
      </div>
      {(items ?? []).map((item, idx) => (
        <div key={idx} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
          {fields.map((field) =>
            field.multiline ? (
              <LabelledTextarea
                key={field.key}
                label={field.label}
                value={String(item[field.key] ?? "")}
                onChange={(v) => update(idx, field.key, v)}
              />
            ) : (
              <LabelledInput
                key={field.key}
                label={field.label}
                value={String(item[field.key] ?? "")}
                onChange={(v) => update(idx, field.key, v)}
              />
            )
          )}
          <div className="flex justify-end">
            <SecondaryButton type="button" className="px-3 py-1.5 text-xs" onClick={() => remove(idx)}>
              Remove
            </SecondaryButton>
          </div>
        </div>
      ))}
    </div>
  );
};

const StringListEditor = ({
  label,
  items,
  onChange
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) => {
  const update = (idx: number, value: string) => {
    const next = items.slice();
    next[idx] = value;
    onChange(next);
  };
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => onChange([...(items ?? []), ""])}>
          Add
        </Button>
      </div>
      {(items ?? []).map((value, idx) => (
        <div key={idx} className="flex gap-2">
          <Input value={value} onChange={(e) => update(idx, e.target.value)} />
          <SecondaryButton
            type="button"
            className="px-3 py-1.5 text-xs"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
          >
            Remove
          </SecondaryButton>
        </div>
      ))}
    </div>
  );
};
