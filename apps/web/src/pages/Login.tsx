import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextField } from "../components/marketing/shared/Field";
import { Eyebrow } from "../components/marketing/shared/HeadingBlock";
import { Reveal } from "../components/marketing/shared/Reveal";
import { useAuth } from "../context/AuthContext";

type Mode = "otp" | "password";

export const LoginPage = () => {
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
      setError(err?.response?.data?.message ?? "Could not send code. Check your phone number.");
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
      setError(err?.response?.data?.message ?? "Invalid code.");
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
      setError("Invalid credentials. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(233,199,154,0.06),transparent_55%)]"
      />
      <Container size="narrow">
        <Reveal>
          <div className="mx-auto max-w-md">
            <Eyebrow>Sign in</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight text-fog-50 sm:text-5xl">
              Welcome back.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-fog-300">
              Sign in with your mobile number. We'll send you a one-time code.
            </p>

            <div className="mt-8 inline-flex rounded-full border border-white/10 bg-ink-900/60 p-1 text-[12.5px] text-fog-300">
              <button
                onClick={() => setMode("otp")}
                className={`rounded-full px-4 py-1.5 transition ${mode === "otp" ? "bg-fog-50 text-ink-950" : "hover:text-fog-100"}`}
              >
                Mobile OTP
              </button>
              <button
                onClick={() => setMode("password")}
                className={`rounded-full px-4 py-1.5 transition ${mode === "password" ? "bg-fog-50 text-ink-950" : "hover:text-fog-100"}`}
              >
                Email + password
              </button>
            </div>

            {mode === "otp" ? (
              codeRequested ? (
                <form onSubmit={submitCode} className="mt-10 space-y-5">
                  <FieldGroup>
                    <FieldLabel htmlFor="code">One-time code</FieldLabel>
                    <TextField
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="6-digit code"
                      autoComplete="one-time-code"
                      maxLength={8}
                      required
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
                    {pending ? "Verifying…" : "Verify & sign in"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setCodeRequested(false)}
                    className="w-full text-[13px] text-fog-400 hover:text-fog-100"
                  >
                    Use a different number
                  </button>
                </form>
              ) : (
                <form onSubmit={requestCode} className="mt-10 space-y-5">
                  <FieldGroup>
                    <FieldLabel htmlFor="phone">Mobile number</FieldLabel>
                    <TextField
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49 176 ..."
                      autoComplete="tel"
                      required
                    />
                  </FieldGroup>
                  {error && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">{error}</p>
                  )}
                  <Button type="submit" size="lg" className="w-full" disabled={pending}>
                    {pending ? "Sending code…" : "Send me a code"}
                  </Button>
                </form>
              )
            ) : (
              <form onSubmit={submitPassword} className="mt-10 space-y-5">
                <FieldGroup>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <TextField
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <TextField
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                    autoComplete="current-password"
                  />
                </FieldGroup>
                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">{error}</p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            )}

            <p className="mt-8 text-center text-[13.5px] text-fog-400">
              New to AutoQR?{" "}
              <Link to="/register" className="text-fog-100 underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
