import { PlanModel } from "../../models/Plan.js";
import { ApiError } from "../../utils/apiError.js";
import { CATALOG_PLANS, CATALOG_PLAN_SLUGS, type CatalogPlanSlug } from "./catalogPlanDefs.js";
import type { PlanPricingPatch } from "./planPricing.schema.js";

const catalogSlugSet = new Set<string>(CATALOG_PLAN_SLUGS);
const catalogBySlug = new Map(CATALOG_PLANS.map((p) => [p.slug, p]));
const catalogSlugOrder = new Map(CATALOG_PLAN_SLUGS.map((s, i) => [s, i]));

/** Public marketing + checkout: only the four catalog slugs are exposed. */
export const isCatalogPlanSlug = (slug: string): slug is CatalogPlanSlug =>
  catalogSlugSet.has(slug);

/**
 * Overlays canonical catalog copy and default EUR pricing onto the Mongo row
 * so legacy DB fields (e.g. old tier names/prices) never leak to `/plans`.
 */
export const mergePublicPlanFromCatalog = <T extends { slug?: string; _id?: unknown }>(doc: T): T => {
  const slug = doc.slug as CatalogPlanSlug | undefined;
  if (!slug || !isCatalogPlanSlug(slug)) return doc;
  const seed = catalogBySlug.get(slug);
  if (!seed) return doc;
  return { ...doc, ...seed, _id: doc._id } as T;
};

export const listActivePlans = async () => {
  const query = () =>
    PlanModel.find({
      status: "active",
      slug: { $in: [...CATALOG_PLAN_SLUGS] }
    })
      .sort({ displayOrder: 1, priceCents: 1 })
      .lean();

  let plans = await query();
  if (plans.length < CATALOG_PLAN_SLUGS.length) {
    await syncCatalogPlans();
    plans = await query();
  }

  const sorted = [...plans].sort(
    (a, b) =>
      (catalogSlugOrder.get(a.slug as CatalogPlanSlug) ?? 99) - (catalogSlugOrder.get(b.slug as CatalogPlanSlug) ?? 99)
  );
  return sorted.map((p) => mergePublicPlanFromCatalog(p));
};

export const getPlanBySlug = async (slug: string) => {
  if (!isCatalogPlanSlug(slug)) throw new ApiError(404, "Plan not found");
  const plan = await PlanModel.findOne({ slug, status: "active" }).lean();
  if (!plan) throw new ApiError(404, "Plan not found");
  return mergePublicPlanFromCatalog(plan);
};

export const getPlanById = async (id: string) => {
  const plan = await PlanModel.findById(id);
  if (!plan) throw new ApiError(404, "Plan not found");
  return plan;
};

export const adminListPlans = async () => {
  return PlanModel.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
};

export const adminUpsertPlan = async (payload: any) => {
  const { _id, ...rest } = payload;
  if (_id) {
    const updated = await PlanModel.findByIdAndUpdate(_id, rest, { new: true });
    if (!updated) throw new ApiError(404, "Plan not found");
    return updated;
  }
  return PlanModel.create(rest);
};

export const adminArchivePlan = async (id: string) => {
  const updated = await PlanModel.findByIdAndUpdate(id, { status: "archived" }, { new: true });
  if (!updated) throw new ApiError(404, "Plan not found");
  return updated;
};

/** Archives any plan whose slug is not in the catalog, then upserts the four catalog plans. Preserves priceCents/compareAtCents on existing rows. */
export const syncCatalogPlans = async () => {
  const slugList = [...CATALOG_PLAN_SLUGS];
  await PlanModel.updateMany({ slug: { $nin: slugList } }, { $set: { status: "archived" } });

  for (const seed of CATALOG_PLANS) {
    const existing = await PlanModel.findOne({ slug: seed.slug }).lean();
    const { priceCents: defaultPrice, compareAtCents: defaultCompare, ...rest } = seed;
    if (!existing) {
      await PlanModel.create(seed);
      continue;
    }
    await PlanModel.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...rest,
          priceCents: typeof existing.priceCents === "number" ? existing.priceCents : defaultPrice,
          compareAtCents: typeof existing.compareAtCents === "number" ? existing.compareAtCents : defaultCompare
        }
      }
    );
  }
};

/**
 * Runs on API boot: always syncs the four catalog plans into Mongo and archives any
 * non-catalog slug. Without this, a DB that only had legacy plans (Solo/Family/…)
 * would match zero rows for `GET /plans` after the catalog filter — empty pricing UI.
 */
export const ensureSeedPlans = async () => {
  await syncCatalogPlans();
};

export const adminSetPlanPricing = async (id: string, body: PlanPricingPatch) => {
  const plan = await PlanModel.findByIdAndUpdate(
    id,
    {
      $set: {
        priceCents: body.priceCents,
        compareAtCents: body.compareAtCents,
        currency: body.currency
      }
    },
    { new: true, runValidators: true }
  );
  if (!plan) throw new ApiError(404, "Plan not found");
  return plan;
};
