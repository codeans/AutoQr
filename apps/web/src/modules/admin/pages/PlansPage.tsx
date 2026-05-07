import { FormEvent, useEffect, useMemo, useState } from "react";
import { CATALOG_PLAN_SLUGS } from "@autoqr/shared";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  LoadingState,
  PageHeader,
  SecondaryButton,
  Select,
  StatusBadge,
  Textarea
} from "../../../components/ui";
import { adminPlatformService } from "../services/platform.service";

const catalogSlugSet = new Set<string>(CATALOG_PLAN_SLUGS as unknown as string[]);

const EMPTY = {
  _id: "",
  slug: "",
  code: "",
  tier: "car_basic",
  name: "",
  nameDe: "",
  tagline: "",
  taglineDe: "",
  description: "",
  descriptionDe: "",
  priceCents: 2499,
  compareAtCents: 0,
  currency: "EUR",
  billingCycle: "one_time",
  tagsIncluded: 1,
  carLimit: 1,
  emergencyContactLimit: 3,
  supportTier: "standard",
  status: "active",
  isFeatured: false,
  isBestValue: false,
  displayOrder: 0,
  highlights: [] as string[],
  includes: [] as string[],
  highlightsDe: [] as string[]
};

const splitLines = (val: string) => val.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

export const PlansPage = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({ ...EMPTY });
  const [highlightsText, setHighlightsText] = useState("");
  const [highlightsDeText, setHighlightsDeText] = useState("");
  const [includesText, setIncludesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [priceEuroDraft, setPriceEuroDraft] = useState<Record<string, string>>({});
  const [compareEuroDraft, setCompareEuroDraft] = useState<Record<string, string>>({});
  const [pricingError, setPricingError] = useState("");
  const [pricingSavingId, setPricingSavingId] = useState<string | null>(null);

  const refresh = () => adminPlatformService.listPlans().then(setPlans);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const planPriceSig = useMemo(
    () =>
      plans
        .filter((p) => catalogSlugSet.has(p.slug))
        .map((p) => `${p._id}:${p.priceCents}:${p.compareAtCents}`)
        .join("|"),
    [plans]
  );

  useEffect(() => {
    const euro: Record<string, string> = {};
    const cmp: Record<string, string> = {};
    for (const p of plans) {
      if (!catalogSlugSet.has(p.slug)) continue;
      euro[p._id] = (p.priceCents / 100).toFixed(2);
      cmp[p._id] = (p.compareAtCents / 100).toFixed(2);
    }
    setPriceEuroDraft(euro);
    setCompareEuroDraft(cmp);
  }, [planPriceSig]);

  const catalogRows = useMemo(
    () =>
      [...plans]
        .filter((p) => catalogSlugSet.has(p.slug) && p.status === "active")
        .sort(
          (a, b) =>
            (CATALOG_PLAN_SLUGS as readonly string[]).indexOf(a.slug) -
            (CATALOG_PLAN_SLUGS as readonly string[]).indexOf(b.slug)
        ),
    [plans]
  );

  const edit = (p: any) => {
    setEditing({ ...EMPTY, ...p });
    setHighlightsText((p.highlights ?? []).join("\n"));
    setHighlightsDeText((p.highlightsDe ?? []).join("\n"));
    setIncludesText((p.includes ?? []).join("\n"));
  };

  const resetForm = () => {
    setEditing({ ...EMPTY });
    setHighlightsText("");
    setHighlightsDeText("");
    setIncludesText("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload: any = {
        ...editing,
        priceCents: Number(editing.priceCents),
        compareAtCents: Number(editing.compareAtCents),
        tagsIncluded: Number(editing.tagsIncluded),
        carLimit: Number(editing.carLimit),
        emergencyContactLimit: Number(editing.emergencyContactLimit),
        displayOrder: Number(editing.displayOrder),
        highlights: splitLines(highlightsText),
        highlightsDe: splitLines(highlightsDeText),
        includes: splitLines(includesText)
      };
      if (!payload._id) delete payload._id;
      await adminPlatformService.upsertPlan(payload);
      resetForm();
      await refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not save plan.");
    } finally {
      setSaving(false);
    }
  };

  const savePricing = async (planId: string) => {
    setPricingError("");
    const eur = parseFloat(priceEuroDraft[planId] ?? "0");
    const cmpEur = parseFloat(compareEuroDraft[planId] ?? "0");
    if (!Number.isFinite(eur) || eur < 0.5) {
      setPricingError("Price must be at least €0.50.");
      return;
    }
    const cents = Math.round(eur * 100);
    const compareCents = Number.isFinite(cmpEur) && cmpEur >= 0 ? Math.round(cmpEur * 100) : 0;
    if (compareCents > 0 && compareCents < cents) {
      setPricingError("Compare-at must be greater than or equal to price (or 0).");
      return;
    }
    setPricingSavingId(planId);
    try {
      await adminPlatformService.updatePlanPricing(planId, {
        priceCents: cents,
        compareAtCents: compareCents,
        currency: "EUR"
      });
      await refresh();
    } catch (err: any) {
      setPricingError(err?.response?.data?.message ?? "Could not save pricing.");
    } finally {
      setPricingSavingId(null);
    }
  };

  const archive = async (id: string) => {
    if (!confirm("Archive this plan? It will be hidden from the public plans page.")) return;
    await adminPlatformService.archivePlan(id);
    await refresh();
  };

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        subtitle="Shape the plan ladder customers pick from. Each plan defines tags included, limits, and the pricing shown on the public site."
      />

      {catalogRows.length > 0 && (
        <Card>
          <h3 className="text-base font-semibold text-slate-900">Catalog pricing (EUR)</h3>
          <p className="mt-1 text-sm text-slate-600">
            Quick edit for the four public catalog plans. Amounts are validated server-side (compare-at must not be below
            price when set).
          </p>
          {pricingError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pricingError}</p>}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 pr-4 font-medium">Plan</th>
                  <th className="py-2 pr-4 font-medium">Slug</th>
                  <th className="py-2 pr-4 font-medium">Price (€)</th>
                  <th className="py-2 pr-4 font-medium">Compare at (€)</th>
                  <th className="py-2 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {catalogRows.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{p.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{p.slug}</td>
                    <td className="py-3 pr-4">
                      <Input
                        className="max-w-[120px]"
                        type="number"
                        step="0.01"
                        min="0.5"
                        value={priceEuroDraft[p._id] ?? ""}
                        onChange={(e) =>
                          setPriceEuroDraft((prev) => ({ ...prev, [p._id]: e.target.value }))
                        }
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <Input
                        className="max-w-[120px]"
                        type="number"
                        step="0.01"
                        min="0"
                        value={compareEuroDraft[p._id] ?? ""}
                        onChange={(e) =>
                          setCompareEuroDraft((prev) => ({ ...prev, [p._id]: e.target.value }))
                        }
                      />
                    </td>
                    <td className="py-3">
                      <Button
                        type="button"
                        className="px-3 py-1.5 text-sm"
                        disabled={pricingSavingId === p._id}
                        onClick={() => savePricing(p._id)}
                      >
                        {pricingSavingId === p._id ? "Saving…" : "Save price"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-base font-semibold text-slate-900">{editing._id ? "Edit plan" : "New plan"}</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-sm font-medium text-slate-700">
            Name (EN)
            <Input required className="mt-1" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Name (DE)
            <Input className="mt-1" value={editing.nameDe} onChange={(e) => setEditing((p) => ({ ...p, nameDe: e.target.value }))} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Tier
            <Select className="mt-1" value={editing.tier} onChange={(e) => setEditing((p) => ({ ...p, tier: e.target.value }))}>
              <option value="car_basic">Car basic</option>
              <option value="smart_key">Smart key</option>
              <option value="premium_combo">Premium combo</option>
              <option value="fleet_pro">Fleet pro</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Slug
            <Input
              required
              className="mt-1"
              value={editing.slug}
              onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))}
              placeholder="car-basic"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Code
            <Input
              required
              className="mt-1"
              value={editing.code}
              onChange={(e) => setEditing((p) => ({ ...p, code: e.target.value }))}
              placeholder="AQR-CAR-BASIC"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Price (cents)
            <Input
              type="number"
              className="mt-1"
              value={editing.priceCents}
              onChange={(e) => setEditing((p) => ({ ...p, priceCents: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Compare at (cents)
            <Input
              type="number"
              className="mt-1"
              value={editing.compareAtCents}
              onChange={(e) => setEditing((p) => ({ ...p, compareAtCents: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Tags included
            <Input
              type="number"
              className="mt-1"
              value={editing.tagsIncluded}
              onChange={(e) => setEditing((p) => ({ ...p, tagsIncluded: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Car limit
            <Input
              type="number"
              className="mt-1"
              value={editing.carLimit}
              onChange={(e) => setEditing((p) => ({ ...p, carLimit: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Emergency contact limit
            <Input
              type="number"
              className="mt-1"
              value={editing.emergencyContactLimit}
              onChange={(e) => setEditing((p) => ({ ...p, emergencyContactLimit: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Support tier
            <Select
              className="mt-1"
              value={editing.supportTier}
              onChange={(e) => setEditing((p) => ({ ...p, supportTier: e.target.value }))}
            >
              <option value="standard">Standard</option>
              <option value="priority">Priority</option>
              <option value="dedicated">Dedicated</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Status
            <Select
              className="mt-1"
              value={editing.status}
              onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Display order
            <Input
              type="number"
              className="mt-1"
              value={editing.displayOrder}
              onChange={(e) => setEditing((p) => ({ ...p, displayOrder: Number(e.target.value) }))}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Tagline (EN)
            <Input
              className="mt-1"
              value={editing.tagline}
              onChange={(e) => setEditing((p) => ({ ...p, tagline: e.target.value }))}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Tagline (DE)
            <Input
              className="mt-1"
              value={editing.taglineDe}
              onChange={(e) => setEditing((p) => ({ ...p, taglineDe: e.target.value }))}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Description (EN)
            <Textarea
              className="mt-1"
              value={editing.description}
              onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Description (DE)
            <Textarea
              className="mt-1"
              value={editing.descriptionDe}
              onChange={(e) => setEditing((p) => ({ ...p, descriptionDe: e.target.value }))}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Highlights EN (one per line)
            <Textarea className="mt-1" value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Highlights DE (one per line)
            <Textarea className="mt-1" value={highlightsDeText} onChange={(e) => setHighlightsDeText(e.target.value)} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Includes (one per line)
            <Textarea className="mt-1" value={includesText} onChange={(e) => setIncludesText(e.target.value)} />
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={editing.isFeatured}
              onChange={(e) => setEditing((p) => ({ ...p, isFeatured: e.target.checked }))}
            />
            Featured on home page
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={editing.isBestValue}
              onChange={(e) => setEditing((p) => ({ ...p, isBestValue: e.target.checked }))}
            />
            Tag as &quot;Most popular&quot;
          </label>

          {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing._id ? "Update plan" : "Create plan"}
            </Button>
            {editing._id && (
              <SecondaryButton type="button" onClick={resetForm}>
                Cancel
              </SecondaryButton>
            )}
          </div>
        </form>
      </Card>

      {plans.length === 0 ? (
        <EmptyState title="No plans" message="Create your first plan to enable the public plans page." />
      ) : (
        <Card>
          <DataTable
            columns={["Name", "Tier", "Price", "Tags", "Status", "Popular", "Actions"]}
            rows={plans.map((p) => [
              <div key="n">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">{p.slug}</p>
              </div>,
              <span key="t" className="capitalize">
                {String(p.tier).replace(/_/g, " ")}
              </span>,
              (p.priceCents / 100).toFixed(2) + " " + p.currency,
              p.tagsIncluded,
              <StatusBadge
                key="st"
                label={p.status}
                tone={p.status === "active" ? "success" : p.status === "archived" ? "danger" : "neutral"}
              />,
              p.isBestValue ? <StatusBadge key="pop" label="popular" tone="info" /> : "—",
              <div key="a" className="flex gap-2">
                <SecondaryButton type="button" onClick={() => edit(p)}>
                  Edit
                </SecondaryButton>
                <SecondaryButton type="button" onClick={() => archive(p._id)} className="text-red-600">
                  Archive
                </SecondaryButton>
              </div>
            ])}
          />
        </Card>
      )}
    </div>
  );
};
