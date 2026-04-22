import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextField } from "../components/marketing/shared/Field";
import { Eyebrow } from "../components/marketing/shared/HeadingBlock";
import { Reveal } from "../components/marketing/shared/Reveal";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await requestOtp(form.phone, "signup");
      setDevCode(res.devCode);
      setStep("verify");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not send a code.");
    } finally {
      setPending(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await verifyOtp({
        phone: form.phone,
        code,
        purpose: "signup",
        signup: { name: form.name, email: form.email, address: form.address }
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Verification failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <Container size="narrow">
        <Reveal>
          <div className="mx-auto max-w-xl">
            <Eyebrow>Create account</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight text-fog-50 sm:text-5xl">
              Set up your AutoQR.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-fog-300">
              We'll verify your mobile with a one-time code. No password needed — your number is your identity.
            </p>

            {step === "details" ? (
              <form onSubmit={sendCode} className="mt-10 grid gap-5 sm:grid-cols-2">
                <FieldGroup>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <TextField
                    id="name"
                    required
                    minLength={2}
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <TextField
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="phone">Mobile number</FieldLabel>
                  <TextField
                    id="phone"
                    type="tel"
                    required
                    minLength={7}
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="address">Shipping address</FieldLabel>
                  <TextField
                    id="address"
                    required
                    minLength={4}
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  />
                </FieldGroup>
                {error && (
                  <div className="sm:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
                    {error}
                  </div>
                )}
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full" disabled={pending}>
                    {pending ? "Sending code…" : "Send verification code"}
                  </Button>
                </div>
                <p className="sm:col-span-2 text-[12px] text-fog-500">
                  By continuing you agree to our terms and privacy policy.
                </p>
              </form>
            ) : (
              <form onSubmit={submit} className="mt-10 space-y-5">
                <FieldGroup>
                  <FieldLabel htmlFor="code">One-time code</FieldLabel>
                  <TextField
                    id="code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    autoComplete="one-time-code"
                    maxLength={8}
                  />
                </FieldGroup>
                {devCode && (
                  <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[12.5px] text-accent">
                    Dev code: <strong>{devCode}</strong>
                  </p>
                )}
                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">{error}</p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending ? "Verifying…" : "Verify & create account"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="w-full text-[13px] text-fog-400 hover:text-fog-100"
                >
                  Edit details
                </button>
              </form>
            )}

            <p className="mt-8 text-center text-[13.5px] text-fog-400">
              Already registered?{" "}
              <Link to="/login" className="text-fog-100 underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
