import { FormEvent, useEffect, useState } from "react";
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

const EMPTY = {
  _id: "",
  slug: "",
  code: "",
  tier: "solo",
  name: "",
  tagline: "",
  description: "",
  priceCents: 1499,
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
  includes: [] as string[]
};

const splitLines = (val: string) => val.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

export const PlansPage = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({ ...EMPTY });
  const [highlightsText, setHighlightsText] = useState("");
  const [includesText, setIncludesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => adminPlatformService.listPlans().then(setPlans);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const edit = (p: any) => {
    setEditing({ ...EMPTY, ...p });
    setHighlightsText((p.highlights ?? []).join("\n"));
    setIncludesText((p.includes ?? []).join("\n"));
  };

  const resetForm = () => {
    setEditing({ ...EMPTY });
    setHighlightsText("");
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
      <Card>
        <h3 className="text-base font-semibold text-slate-900">{editing._id ? "Edit plan" : "New plan"}</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-sm font-medium text-slate-700">
            Name
            <Input required className="mt-1" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Tier
            <Select className="mt-1" value={editing.tier} onChange={(e) => setEditing((p) => ({ ...p, tier: e.target.value }))}>
              <option value="solo">Solo</option>
              <option value="family">Family</option>
              <option value="business">Business</option>
            </Select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Slug
            <Input
              required
              className="mt-1"
              value={editing.slug}
              onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))}
              placeholder="family"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Code
            <Input
              required
              className="mt-1"
              value={editing.code}
              onChange={(e) => setEditing((p) => ({ ...p, code: e.target.value }))}
              placeholder="AQR-FAMILY"
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
            Tagline
            <Input
              className="mt-1"
              value={editing.tagline}
              onChange={(e) => setEditing((p) => ({ ...p, tagline: e.target.value }))}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Description
            <Textarea
              className="mt-1"
              value={editing.description}
              onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Highlights (one per line)
            <Textarea className="mt-1" value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} />
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
            Tag as "Most popular"
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
              <span key="t" className="capitalize">{p.tier}</span>,
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
