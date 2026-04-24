import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextField } from "../components/marketing/shared/Field";
import { useAuth } from "../context/AuthContext";

type Mode = "otp" | "password";

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login, requestOtp, verifyOtp } = useAuth();
  const [params] = useSearchParams();
  const redirect = params.get("redirect");
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("otp");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const afterLogin = (role: string) => {
    if (redirect) {
      navigate(redirect);
    } else if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const requestCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await requestOtp(phone, "login");
      setCodeRequested(true);
      setDevCode(res.devCode);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("auth.errorCouldNotSendCode"));
    } finally {
      setPending(false);
    }
  };

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const user = await verifyOtp({ phone, code, purpose: "login" });
      afterLogin(user?.role ?? "owner");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("auth.errorInvalidCode"));
    } finally {
      setPending(false);
    }
  };

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      const stored = JSON.parse(localStorage.getItem("autoqr_user") ?? "{}");
      afterLogin(stored.role ?? "owner");
    } catch {
      setError(t("auth.errorInvalidCredentials"));
    } finally {
      setPending(false);
    }
  };

  const errorBox = (msg: string) => (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
      {msg}
    </p>
  );

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-soft" />
      <Container size="narrow">
        <div className="mx-auto max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {t("auth.loginEyebrow")}
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-content sm:text-5xl">
            {t("auth.loginHeadline")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-content-muted">
            {t("auth.loginIntro")}
          </p>

          <div className="mt-8 inline-flex rounded-full border border-surface-border bg-white p-1 text-[12.5px] text-content-muted shadow-soft">
            <button
              onClick={() => setMode("otp")}
              className={`rounded-full px-4 py-1.5 transition ${
                mode === "otp" ? "bg-brand-700 text-white" : "hover:text-content"
              }`}
            >
              {t("auth.modeOtp")}
            </button>
            <button
              onClick={() => setMode("password")}
              className={`rounded-full px-4 py-1.5 transition ${
                mode === "password" ? "bg-brand-700 text-white" : "hover:text-content"
              }`}
            >
              {t("auth.modePassword")}
            </button>
          </div>

          {mode === "otp" ? (
            codeRequested ? (
              <form onSubmit={submitCode} className="mt-10 space-y-5">
                <FieldGroup>
                  <FieldLabel htmlFor="code">{t("auth.oneTimeCodeLabel")}</FieldLabel>
                  <TextField
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t("auth.oneTimeCodePlaceholder")}
                    autoComplete="one-time-code"
                    maxLength={8}
                    required
                  />
                </FieldGroup>
                {devCode && (
                  <p className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-[12.5px] text-brand-700">
                    {t("auth.devCodePrefix")} <strong>{devCode}</strong>
                  </p>
                )}
                {error && errorBox(error)}
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending ? t("auth.verifying") : t("auth.verifyAndSignIn")}
                </Button>
                <button
                  type="button"
                  onClick={() => setCodeRequested(false)}
                  className="w-full text-[13px] text-content-subtle hover:text-content"
                >
                  {t("auth.useDifferentNumber")}
                </button>
              </form>
            ) : (
              <form onSubmit={requestCode} className="mt-10 space-y-5">
                <FieldGroup>
                  <FieldLabel htmlFor="phone">{t("auth.mobileNumberLabel")}</FieldLabel>
                  <TextField
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("auth.mobileNumberPlaceholder")}
                    autoComplete="tel"
                    required
                  />
                </FieldGroup>
                {error && errorBox(error)}
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending ? t("auth.sendingCode") : t("auth.sendMeCode")}
                </Button>
              </form>
            )
          ) : (
            <form onSubmit={submitPassword} className="mt-10 space-y-5">
              <FieldGroup>
                <FieldLabel htmlFor="email">{t("auth.emailLabel")}</FieldLabel>
                <TextField
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  autoComplete="email"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="password">{t("auth.passwordLabel")}</FieldLabel>
                <TextField
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  minLength={8}
                  required
                  autoComplete="current-password"
                />
              </FieldGroup>
              {error && errorBox(error)}
              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-[13.5px] text-content-subtle">
            {t("auth.newToAutoqr")}{" "}
            <Link to="/register" className="text-brand-700 underline-offset-4 hover:underline">
              {t("auth.createAccountLink")}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
};
