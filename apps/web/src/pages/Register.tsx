import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextField } from "../components/marketing/shared/Field";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const { t } = useTranslation();
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
      setError(err?.response?.data?.message ?? t("auth.errorCouldNotSendCodeGeneric"));
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
      setError(err?.response?.data?.message ?? t("auth.errorVerificationFailed"));
    } finally {
      setPending(false);
    }
  };

  const errorBox = (msg: string, full = false) => (
    <p
      className={`${full ? "sm:col-span-2 " : ""}rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700`}
    >
      {msg}
    </p>
  );

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-soft" />
      <Container size="narrow">
        <div className="mx-auto max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {t("auth.registerEyebrow")}
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-content sm:text-5xl">
            {t("auth.registerHeadline")}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-content-muted">
            {t("auth.registerIntro")}
          </p>

          {step === "details" ? (
            <form onSubmit={sendCode} className="mt-10 grid gap-5 sm:grid-cols-2">
              <FieldGroup>
                <FieldLabel htmlFor="name">{t("auth.nameLabel")}</FieldLabel>
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
                <FieldLabel htmlFor="email">{t("auth.emailLabel")}</FieldLabel>
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
                <FieldLabel htmlFor="phone">{t("auth.mobileNumberLabel")}</FieldLabel>
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
                <FieldLabel htmlFor="address">{t("auth.shippingAddressLabel")}</FieldLabel>
                <TextField
                  id="address"
                  required
                  minLength={4}
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                />
              </FieldGroup>
              {error && errorBox(error, true)}
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending ? t("auth.sendingCode") : t("auth.sendVerificationCode")}
                </Button>
              </div>
              <p className="sm:col-span-2 text-[12px] text-content-subtle">
                {t("auth.termsAgreementNotice")}
              </p>
            </form>
          ) : (
            <form onSubmit={submit} className="mt-10 space-y-5">
              <FieldGroup>
                <FieldLabel htmlFor="code">{t("auth.oneTimeCodeLabel")}</FieldLabel>
                <TextField
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("auth.oneTimeCodePlaceholder")}
                  autoComplete="one-time-code"
                  maxLength={8}
                />
              </FieldGroup>
              {devCode && (
                <p className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-[12.5px] text-brand-700">
                  {t("auth.devCodePrefix")} <strong>{devCode}</strong>
                </p>
              )}
              {error && errorBox(error)}
              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? t("auth.verifying") : t("auth.verifyAndCreateAccount")}
              </Button>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full text-[13px] text-content-subtle hover:text-content"
              >
                {t("auth.editDetails")}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[13.5px] text-content-subtle">
            {t("auth.alreadyRegistered")}{" "}
            <Link to="/login" className="text-brand-700 underline-offset-4 hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
};
