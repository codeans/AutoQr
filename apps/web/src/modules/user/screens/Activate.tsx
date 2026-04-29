import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, SectionTitle, Select, StatusBadge } from "../../../components/ui";
import { ownerService } from "../services/owner.service";
import type { OwnerCar } from "../services/owner.service";

type Step = 1 | 2 | 3;

const StepDot = ({ step, active, done, label }: { step: number; active: boolean; done: boolean; label: string }) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
        done
          ? "border-emerald-500 bg-emerald-500 text-white"
          : active
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-slate-500"
      }`}
    >
      {done ? "✓" : step}
    </div>
    <p className={`text-sm font-medium ${active || done ? "text-slate-900" : "text-slate-500"}`}>{label}</p>
  </div>
);

export const ActivateScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [cars, setCars] = useState<OwnerCar[]>([]);
  const [mode, setMode] = useState<"existing" | "new">("new");
  const [assetType, setAssetType] = useState<"car" | "keys">("car");
  const [code, setCode] = useState("");
  const [carId, setCarId] = useState("");
  const [plateImage, setPlateImage] = useState<File | null>(null);
  const [keyLabel, setKeyLabel] = useState("");
  const [keyType, setKeyType] = useState("");
  const [keyDescription, setKeyDescription] = useState("");
  const [returnInstructions, setReturnInstructions] = useState("");
  const [form, setForm] = useState({
    registrationNumber: "",
    make: "",
    model: "",
    color: "",
    year: "" as string | number,
    nickname: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    ownerService.listCars().then((list) => {
      setCars(list);
      if (list.length > 0) {
        setCarId(list[0]._id);
        setMode("existing");
      } else {
        setMode("new");
      }
    });
  }, []);

  const codeIsValid = useMemo(() => /^[A-Z0-9-]{4,40}$/.test(code.trim().toUpperCase()), [code]);

  const goToStep2 = () => {
    setError("");
    if (!codeIsValid) {
      setError("Activation code looks invalid. Check the sticker — it should be 4–40 letters and digits.");
      return;
    }
    setStep(2);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (assetType === "car" && mode === "new" && !form.registrationNumber.trim()) {
      setError("Registration number is required.");
      return;
    }
    setPending(true);
    try {
      if (assetType === "car") {
        const carPayload =
          mode === "new"
            ? {
                ...form,
                year: form.year === "" ? undefined : Number(form.year)
              }
            : undefined;

        if (plateImage) {
          await ownerService.activateTagWithImage({
            activationCode: code.trim().toUpperCase(),
            carId: mode === "existing" ? carId : undefined,
            carPayload,
            plateImage
          });
        } else {
          await ownerService.activateTag({
            activationCode: code.trim().toUpperCase(),
            carId: mode === "existing" ? carId : undefined,
            carPayload
          });
        }

        setSuccess("Your car QR is now active and permanently linked to your car.");
        setStep(3);
        setTimeout(() => navigate("/dashboard/tags"), 1800);
      } else {
        if (!keyLabel.trim()) {
          setError("Key label is required.");
          return;
        }
        if (!keyType.trim()) {
          setError("Key type is required.");
          return;
        }

        await ownerService.activateTag({
          activationCode: code.trim().toUpperCase(),
          assetType: "keys",
          keyPayload: {
            label: keyLabel.trim(),
            keyType: keyType.trim(),
            description: keyDescription.trim() || undefined,
            returnInstructions: returnInstructions.trim() || undefined
          }
        });

        setSuccess("Your QR is now active and permanently linked to your keys.");
        setStep(3);
        setTimeout(() => navigate("/dashboard/tags"), 1800);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Activation failed. Check the code and try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Activate your QR"
        subtitle="Enter the one-time activation code printed on your physical QR sticker, then link it to a car or keys. Once activated, the code becomes unusable."
      />

      <Card className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <StepDot step={1} active={step === 1} done={step > 1} label="Enter activation code" />
          <StepDot step={2} active={step === 2} done={step > 2} label="Add details" />
          <StepDot step={3} active={false} done={step === 3} label="Activated" />
        </div>
      </Card>

      {step === 1 && (
        <Card className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700">One-time activation code</label>
            <Input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 4F9C2A1B"
              className="mt-1 font-mono tracking-[0.2em]"
              maxLength={40}
            />
            <p className="mt-2 text-xs text-slate-500">
              You'll find this code on the label alongside your physical QR sticker. Each code can be used only once.
            </p>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="button" onClick={goToStep2} disabled={!code}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <form className="space-y-6" onSubmit={submit}>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Activation code</p>
              <p className="mt-1 font-mono text-base font-semibold text-slate-900">{code}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                  assetType === "car" ? "border-slate-900 bg-white text-slate-900" : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
                onClick={() => setAssetType("car")}
              >
                Car
              </button>
              <button
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                  assetType === "keys" ? "border-slate-900 bg-white text-slate-900" : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
                onClick={() => setAssetType("keys")}
              >
                Keys
              </button>
            </div>

            {assetType === "car" && cars.length > 0 && (
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm">
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 ${mode === "existing" ? "bg-white shadow" : "text-slate-500"}`}
                  onClick={() => setMode("existing")}
                >
                  Link to existing car
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 ${mode === "new" ? "bg-white shadow" : "text-slate-500"}`}
                  onClick={() => setMode("new")}
                >
                  Add a new car
                </button>
              </div>
            )}

            {assetType === "car" && (
              <>
                {mode === "existing" ? (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Car</label>
                    <Select value={carId} onChange={(e) => setCarId(e.target.value)} className="mt-1">
                      {cars.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.nickname || c.registrationNumber} {c.make ? `— ${c.make} ${c.model ?? ""}` : ""}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">
                      Registration number *
                      <Input
                        required
                        className="mt-1"
                        placeholder="e.g. B-AQ 1234"
                        value={form.registrationNumber}
                        onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                      Make
                      <Input
                        className="mt-1"
                        placeholder="e.g. Volkswagen"
                        value={form.make}
                        onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                      Model
                      <Input
                        className="mt-1"
                        placeholder="e.g. Golf"
                        value={form.model}
                        onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                      Colour
                      <Input
                        className="mt-1"
                        value={form.color}
                        onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                      Year
                      <Input
                        className="mt-1"
                        type="number"
                        value={form.year}
                        onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                      Nickname
                      <Input
                        className="mt-1"
                        placeholder="e.g. Family car"
                        value={form.nickname}
                        onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
                      />
                    </label>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-700">Front image with number plate (optional)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={(e) => setPlateImage(e.target.files?.[0] ?? null)}
                  />
                  {plateImage && (
                    <p className="mt-1 text-xs text-slate-500">
                      {plateImage.name} · {(plateImage.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </>
            )}

            {assetType === "keys" && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Key label *
                  <Input
                    required
                    className="mt-1"
                    placeholder="e.g. Home keys"
                    value={keyLabel}
                    onChange={(e) => setKeyLabel(e.target.value)}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Key type *
                  <Input
                    required
                    className="mt-1"
                    placeholder="e.g. metal key / key fob"
                    value={keyType}
                    onChange={(e) => setKeyType(e.target.value)}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Description
                  <Input
                    className="mt-1"
                    placeholder="Optional details"
                    value={keyDescription}
                    onChange={(e) => setKeyDescription(e.target.value)}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Return instructions
                  <Input
                    className="mt-1"
                    placeholder="Optional return instructions"
                    value={returnInstructions}
                    onChange={(e) => setReturnInstructions(e.target.value)}
                  />
                </label>
              </div>
            )}

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Activating…" : assetType === "car" ? "Activate and bind to car" : "Activate and link keys"}
              </Button>
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </form>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-3 text-center">
          <StatusBadge label="activated" tone="success" />
          <h3 className="text-xl font-semibold text-slate-900">You're all set.</h3>
          <p className="text-sm text-slate-600">{success}</p>
        </Card>
      )}
    </div>
  );
};
