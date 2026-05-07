import { Car, KeyRound } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "../shared/Container";
import type { UseCaseFeature, UseCaseSide } from "../content/defaults";
import { useMarketingContent } from "../content/useMarketingContent";
import type { CarsKeysColumn } from "./carsKeysSectionImages";
import { sectionImageForFeature } from "./carsKeysSectionImages";

function resolveFeatures(side: UseCaseSide): UseCaseFeature[] {
  if (side.features?.length) return side.features;
  return (side.bullets ?? []).map((text) => {
    const colon = text.indexOf(": ");
    if (colon > 0) {
      return { title: text.slice(0, colon), description: text.slice(colon + 2) };
    }
    return { title: "", description: text };
  });
}

export const CarsKeys = () => {
  const { useCases } = useMarketingContent();
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {useCases.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {useCases.description}
          </p>
        </div>

        <div className="mt-16 border-t border-surface-border pt-16 sm:pt-20">
          <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-14">
            <FeaturesColumn column="car" side={useCases.car} pillarIcon={<Car className="h-6 w-6" />} />
            <FeaturesColumn column="key" side={useCases.key} pillarIcon={<KeyRound className="h-6 w-6" />} />
          </div>
        </div>
      </Container>
    </section>
  );
};

type FeaturesColumnProps = {
  column: CarsKeysColumn;
  side: UseCaseSide;
  pillarIcon: ReactNode;
};

const FeaturesColumn = ({ column, side, pillarIcon }: FeaturesColumnProps) => {
  const features = resolveFeatures(side);
  return (
    <div>
      <div className="flex flex-nowrap items-start gap-x-3 border-b border-surface-border pb-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)]">
          {pillarIcon}
        </span>
        <div className="min-w-0 flex-1">
          {side.tagline ? (
            <p className="text-xs font-semibold uppercase leading-none tracking-wider text-brand-700">{side.tagline}</p>
          ) : null}
          <h3
            className={
              side.tagline
                ? "mt-2 font-display text-xl font-semibold leading-tight tracking-tight text-content sm:text-2xl"
                : "font-display text-xl font-semibold leading-tight tracking-tight text-content sm:text-2xl"
            }
          >
            {side.title}
          </h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-content-muted sm:text-base">{side.description}</p>
      <ul className="mt-8 space-y-8">
        {features.map((f, i) => {
          const imageSrc = sectionImageForFeature(column, i);
          return (
            <li key={`${f.title}-${i}`}>
              <FeatureRow feature={f} imageSrc={imageSrc} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

type FeatureRowProps = {
  feature: UseCaseFeature;
  imageSrc?: string;
};

const FeatureRow = ({ feature, imageSrc }: FeatureRowProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
    {imageSrc ? (
      <div className="mx-auto flex aspect-square w-[min(100%,10.5rem)] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/80 p-3 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.18)] sm:mx-0 sm:w-40 sm:max-w-none sm:basis-40 sm:p-3.5">
        <img
          src={imageSrc}
          alt=""
          className="max-h-full max-w-full object-contain object-center"
          loading="lazy"
          decoding="async"
        />
      </div>
    ) : (
      <FeatureImagePlaceholder />
    )}
    <div className="min-w-0 flex-1">
      {feature.title ? (
        <h4 className="text-base font-semibold tracking-tight text-content">{feature.title}</h4>
      ) : null}
      <p
        className={
          feature.title
            ? "mt-1.5 text-sm leading-relaxed text-content-muted sm:text-[15px]"
            : "mt-2 text-sm leading-relaxed text-content-muted sm:text-[15px]"
        }
      >
        {feature.description}
      </p>
    </div>
  </div>
);

const FeatureImagePlaceholder = () => (
  <div
    className="mx-auto aspect-square w-[min(100%,10.5rem)] shrink-0 rounded-2xl border border-dashed border-surface-border bg-surface-soft sm:mx-0 sm:w-40 sm:max-w-none sm:basis-40"
    aria-hidden
  >
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_right,rgb(15_23_42/6%)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42/6%)_1px,transparent_1px)] bg-[length:14px_14px] p-3">
      <div className="h-10 w-10 rounded-md border border-surface-border/80 bg-white/80 shadow-sm" />
    </div>
  </div>
);
