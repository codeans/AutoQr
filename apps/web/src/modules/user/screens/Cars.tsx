import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Input, LoadingState, SecondaryButton, SectionTitle, Select, StatusBadge } from "../../../components/ui";
import { ownerService } from "../services/owner.service";
import type { OwnerCar } from "../services/owner.service";
import { VEHICLE_COMPANIES, VEHICLE_MODELS, VEHICLE_YEARS } from "./vehicleOptions";

const EMPTY = {
  registrationNumber: "",
  make: "",
  model: "",
  color: "",
  year: "" as string | number,
  nickname: "",
  displayMessage: ""
};

export const CarsScreen = () => {
  const [cars, setCars] = useState<OwnerCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [makeSelection, setMakeSelection] = useState<string>("");
  const [modelSelection, setModelSelection] = useState<string>("");
  const [yearSelection, setYearSelection] = useState<string>("");

  const refresh = async () => {
    const list = await ownerService.listCars();
    setCars(list);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const startEdit = (car: OwnerCar) => {
    const nextMake = car.make ?? "";
    const nextModel = car.model ?? "";
    const nextYear = car.year ? String(car.year) : "";
    setEditingId(car._id);
    setForm({
      registrationNumber: car.registrationNumber,
      make: nextMake,
      model: nextModel,
      color: car.color ?? "",
      year: nextYear,
      nickname: car.nickname ?? "",
      displayMessage: car.displayMessage ?? ""
    });
    setMakeSelection(nextMake && VEHICLE_COMPANIES.includes(nextMake as (typeof VEHICLE_COMPANIES)[number]) ? nextMake : nextMake ? "__other__" : "");
    setModelSelection(nextModel && VEHICLE_MODELS.includes(nextModel as (typeof VEHICLE_MODELS)[number]) ? nextModel : nextModel ? "__other__" : "");
    setYearSelection(nextYear && VEHICLE_YEARS.includes(nextYear) ? nextYear : nextYear ? "__other__" : "");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: form.year === "" ? undefined : Number(form.year)
      };
      if (editingId) {
        await ownerService.updateCar(editingId, payload);
      } else {
        await ownerService.createCar(payload);
      }
      setForm(EMPTY);
      setEditingId(null);
      setMakeSelection("");
      setModelSelection("");
      setYearSelection("");
      await refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not save car.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this car?")) return;
    try {
      await ownerService.deleteCar(id);
      await refresh();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Could not delete.");
    }
  };

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="My cars"
        subtitle="Add every car you want to link to an AutoQR tag. Each car can hold one active tag for scans and alerts."
      />
      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
          <label className="text-sm font-medium text-slate-700">
            Registration number
            <Input required className="mt-1" value={form.registrationNumber} onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value }))} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Make
            <Select
              className="mt-1"
              value={makeSelection}
              onChange={(e) => {
                const value = e.target.value;
                setMakeSelection(value);
                if (value && value !== "__other__") {
                  setForm((p) => ({ ...p, make: value }));
                } else if (value === "") {
                  setForm((p) => ({ ...p, make: "" }));
                }
              }}
            >
              <option value="">Select company</option>
              {VEHICLE_COMPANIES.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
              <option value="__other__">Other</option>
            </Select>
            {makeSelection === "__other__" && (
              <Input className="mt-2" placeholder="Write company name" value={form.make} onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))} />
            )}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Model
            <Select
              className="mt-1"
              value={modelSelection}
              onChange={(e) => {
                const value = e.target.value;
                setModelSelection(value);
                if (value && value !== "__other__") {
                  setForm((p) => ({ ...p, model: value }));
                } else if (value === "") {
                  setForm((p) => ({ ...p, model: "" }));
                }
              }}
            >
              <option value="">Select model</option>
              {VEHICLE_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
              <option value="__other__">Other</option>
            </Select>
            {modelSelection === "__other__" && (
              <Input className="mt-2" placeholder="Write model name" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} />
            )}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Colour
            <Input className="mt-1" placeholder="e.g. Pearl white" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Year
            <Select
              className="mt-1"
              value={yearSelection}
              onChange={(e) => {
                const value = e.target.value;
                setYearSelection(value);
                if (value && value !== "__other__") {
                  setForm((p) => ({ ...p, year: value }));
                } else if (value === "") {
                  setForm((p) => ({ ...p, year: "" }));
                }
              }}
            >
              <option value="">Select model year</option>
              {VEHICLE_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
              <option value="__other__">Other</option>
            </Select>
            {yearSelection === "__other__" && (
              <Input className="mt-2" type="number" placeholder="Write model year" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} />
            )}
          </label>
          <label className="text-sm font-medium text-slate-700">
            Nickname
            <Input className="mt-1" placeholder="e.g. Family car" value={form.nickname} onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Public display message (shown on the scan page)
            <Input
              className="mt-1"
              value={form.displayMessage}
              onChange={(e) => setForm((p) => ({ ...p, displayMessage: e.target.value }))}
              placeholder="Example: Thanks for the heads-up about my car — tap a reason below."
            />
          </label>
          {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update car" : "Add car"}
            </Button>
            {editingId && (
              <SecondaryButton
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                  setMakeSelection("");
                  setModelSelection("");
                  setYearSelection("");
                }}
              >
                Cancel
              </SecondaryButton>
            )}
          </div>
        </form>
      </Card>

      {cars.length === 0 ? (
        <EmptyState title="No cars yet" message="Add your first car above to link it with a QR tag." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cars.map((car) => (
            <Card key={car._id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {car.nickname || car.registrationNumber}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {[car.make, car.model, car.color].filter(Boolean).join(" · ")}
                    {car.year ? ` · ${car.year}` : ""}
                  </p>
                </div>
                {car.isPrimary && <StatusBadge label="primary car" tone="success" />}
              </div>
              <p className="font-mono text-sm text-slate-700">{car.registrationNumber}</p>
              <p className="text-xs text-slate-500">
                Linked tags: {car.tags?.length ?? 0}{" "}
                {car.activeTagId && <span>· active</span>}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <SecondaryButton type="button" onClick={() => startEdit(car)}>
                  Edit
                </SecondaryButton>
                {!car.isPrimary && (
                  <SecondaryButton
                    type="button"
                    onClick={async () => {
                      await ownerService.makePrimary(car._id);
                      await refresh();
                    }}
                  >
                    Set as primary car
                  </SecondaryButton>
                )}
                <SecondaryButton type="button" onClick={() => remove(car._id)} className="text-red-600">
                  Remove
                </SecondaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
