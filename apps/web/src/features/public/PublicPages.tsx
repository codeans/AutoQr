import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, Headset, PackageCheck, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Input, SectionTitle, SecondaryButton, Select, Textarea } from "../../components/ui";
import { api } from "../../lib/api";
import { CallReporterWidget } from "../calls/CallReporterWidget";
import { useAuth } from "../../context/AuthContext";

const pageMotion = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export const HomePage = () => (
  <div className="space-y-16 pb-12">
    <motion.section
      {...pageMotion}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-14 text-white shadow-premium sm:px-12"
    >
      <div className="absolute -right-16 -top-10 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
      <Badge label="Privacy-first incident communication for autoqr.de" tone="info" />
      <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Protect owner privacy while enabling instant incident contact.</h1>
      <p className="mt-5 max-w-2xl text-base text-slate-200">
        AutoQr provides one-time purchased physical QR stickers for cars and items. Reporters can submit evidence and request secure calls without exposing owner phone numbers publicly.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/order">
          <Button className="inline-flex items-center gap-2">
            Order AutoQr <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/how-it-works">
          <SecondaryButton>How it works</SecondaryButton>
        </Link>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          ["One-time payment", "Lifetime owner usage after purchase"],
          ["Admin-printed QR", "Raw QR remains admin-only"],
          ["Secure incident bridge", "Evidence + web call request flow"]
        ].map(([title, subtitle]) => (
          <div key={title} className="rounded-2xl border border-slate-600/60 bg-slate-800/70 p-4">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
          </div>
        ))}
      </div>
    </motion.section>

    <section className="space-y-5">
      <SectionTitle title="How incident recovery works" subtitle="A clear, responsible path from QR scan to owner conversation." />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          [ShieldCheck, "Scan sticker", "Reporter opens trusted AutoQr incident page."],
          [AlertTriangle, "Submit proof", "Phone number, message, and damage images are uploaded."],
          [PhoneCall, "Request call", "Owner receives real-time incoming call request in dashboard."],
          [Headset, "Resolve directly", "Both parties discuss incident details through browser audio call."]
        ].map(([Icon, title, desc]) => (
          <Card key={title as string}>
            <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2">
              <Icon className="h-5 w-5 text-slate-700" />
            </div>
            <h3 className="text-base font-semibold">{title as string}</h3>
            <p className="mt-1 text-sm text-slate-600">{desc as string}</p>
          </Card>
        ))}
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-2">
      <Card>
        <SectionTitle title="Why privacy-first QR is better" />
        <ul className="space-y-2 text-sm text-slate-700">
          {[
            "Owner phone number is never publicly visible on sticker.",
            "Reporter identity and evidence are captured with a reliable timeline.",
            "Admin can investigate incidents and call outcomes through audit logs.",
            "Works for cars, bikes, luggage, and personal items."
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> {line}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <SectionTitle title="Physical QR printing & delivery workflow" />
        <ol className="space-y-2 text-sm text-slate-700">
          {[
            "Owner account and vehicle/item registration submitted.",
            "One-time payment confirmed through Stripe webhook.",
            "System generates QR and keeps it admin-visible only.",
            "Admin prints, packs, dispatches, and marks delivered/activated."
          ].map((line, idx) => (
            <li key={line} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">{idx + 1}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </Card>
    </section>

    <section>
      <SectionTitle title="Use cases" subtitle="One platform for vehicles and high-value personal items." />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Cars", "Damage reports for parked cars with direct owner contact."],
          ["Bikes", "Accident or property damage reporting workflow."],
          ["Other tags", "Luggage and asset communication for private recovery."]
        ].map(([title, desc]) => (
          <Card key={title}>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{desc}</p>
          </Card>
        ))}
      </div>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-8">
      <SectionTitle title="Common questions" subtitle="Built for responsible reporting and fast owner response." />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Can the public see my number from QR?", "No. Reporter only interacts through the secure incident page."],
          ["Do I pay monthly?", "No. Single one-time payment with lifetime usage."],
          ["Can owner print QR directly?", "No. Printable QR access is restricted to admin by policy."],
          ["What if owner is unavailable?", "Reporter sees rejected/unavailable state and incident remains logged."]
        ].map(([q, a]) => (
          <Card key={q}>
            <p className="font-semibold">{q}</p>
            <p className="mt-1 text-sm text-slate-600">{a}</p>
          </Card>
        ))}
      </div>
    </section>

    <section className="rounded-3xl bg-slate-900 p-8 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300">Ready to secure your vehicle or item?</p>
          <h3 className="text-2xl font-bold">Get your AutoQr sticker with one-time purchase.</h3>
        </div>
        <Link to="/order">
          <Button>Start Order</Button>
        </Link>
      </div>
    </section>
  </div>
);

export const HowItWorksPage = () => (
  <div className="space-y-6">
    <SectionTitle title="How It Works" subtitle="From registration to incident resolution in clear operational steps." />
    <div className="grid gap-4 md:grid-cols-2">
      {[
        ["Owner onboarding", "Create account, register vehicle/item, upload front image."],
        ["One-time payment", "Complete payment; webhook verifies success."],
        ["QR fulfillment", "QR generated, printed, packed, shipped, delivered, activated by admin."],
        ["Incident handling", "Reporter submits details, uploads proof, requests call."],
        ["Owner response", "Owner sees incoming alert, accepts/rejects web call."],
        ["Audit trail", "Incidents, calls, and admin actions are tracked end-to-end."]
      ].map(([title, description]) => (
        <Card key={title}>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </Card>
      ))}
    </div>
  </div>
);

export const ForCarOwnersPage = () => (
  <div className="space-y-6">
    <SectionTitle title="For Car Owners" subtitle="Protect your privacy while staying reachable for genuine incident reports." />
    <Card>
      <ul className="space-y-2 text-sm text-slate-700">
        <li>One-time purchase with lifetime usage.</li>
        <li>QR is generated after payment and printed by admin.</li>
        <li>Owner sees status and incidents, not raw printable QR.</li>
      </ul>
    </Card>
  </div>
);

export const ForItemsPage = () => (
  <div className="space-y-6">
    <SectionTitle title="For Bikes & Items" subtitle="The same incident communication system can secure non-car assets too." />
    <Card>
      <ul className="space-y-2 text-sm text-slate-700">
        <li>Attach physical AutoQr tag to bikes, luggage, and high-value personal items.</li>
        <li>Reporters can send message, phone, and evidence on secure page.</li>
        <li>Owner receives call request and incident timeline inside dashboard.</li>
      </ul>
    </Card>
  </div>
);

export const PricingPage = () => (
  <div className="mx-auto max-w-4xl space-y-6">
    <SectionTitle title="Transparent pricing" subtitle="No recurring subscriptions. No hidden communication fees." />
    <Card className="border-slate-300 p-8">
      <p className="text-sm uppercase tracking-wide text-slate-500">AutoQr One-Time Plan</p>
      <p className="mt-2 text-4xl font-bold text-slate-900">49 EUR</p>
      <p className="mt-1 text-sm text-slate-600">Lifetime owner usage after purchase.</p>
      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {["Physical QR tag/sticker", "Incident reporting portal", "Evidence image uploads", "Web-based owner-reporter call flow", "Admin-managed fulfillment lifecycle"].map((line) => (
          <li key={line} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {line}
          </li>
        ))}
      </ul>
      <Link to="/order" className="mt-6 inline-block">
        <Button>Order Now</Button>
      </Link>
    </Card>
  </div>
);

export const FaqPage = () => (
  <div className="space-y-4">
    <SectionTitle title="FAQ" subtitle="Answers focused on trust, policy, and incident handling." />
    {[
      ["Can someone misuse my QR?", "The public route is rate-limited and logs reporter details. Admin can review suspicious activity."],
      ["Is my address public?", "No. Delivery details are internal and only visible in protected owner/admin areas."],
      ["Can I track shipment?", "Yes. Owner dashboard shows QR lifecycle and shipping/tracking details."],
      ["Can incident reporter call without app install?", "Yes. Calls run in the browser using WebRTC audio flow."]
    ].map(([q, a]) => (
      <Card key={q}>
        <h3 className="font-semibold">{q}</h3>
        <p className="mt-1 text-sm text-slate-600">{a}</p>
      </Card>
    ))}
  </div>
);

export const ContactPage = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <Card>
      <SectionTitle title="Contact AutoQr" subtitle="Trust and safety support for customers and incident reporters." />
      <p className="text-sm text-slate-700">Email: support@autoqr.de</p>
      <p className="text-sm text-slate-700">Business Hours: Mon-Fri, 09:00-18:00 CET</p>
    </Card>
    <Card>
      <p className="text-sm text-slate-600">Need immediate help for an active incident? Use the incident page on the QR tag and submit your report with evidence.</p>
      <Link to="/how-it-works" className="mt-4 inline-block">
        <SecondaryButton>Read Incident Process</SecondaryButton>
      </Link>
    </Card>
  </div>
);

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const role = JSON.parse(localStorage.getItem("autoqr_user") || "{}").role;
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form className="space-y-3" onSubmit={submit}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" type="email" autoComplete="email" required />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          aria-label="Password"
          autoComplete="current-password"
          minLength={8}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </Card>
  );
};

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const navigate = useNavigate();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/auth/register", form);
    navigate("/login");
  };
  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Register</h1>
      <form className="space-y-3" onSubmit={submit}>
        {Object.entries(form).map(([key, value]) => (
          <Input
            key={key}
            value={value}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={key}
            type={key === "password" ? "password" : key === "email" ? "email" : "text"}
            minLength={key === "password" ? 8 : key === "phone" ? 7 : 2}
            autoComplete={key === "password" ? "new-password" : key === "email" ? "email" : "off"}
            required
          />
        ))}
        <Button type="submit">Create account</Button>
      </form>
    </Card>
  );
};

export const OrderPage = () => (
  <Card className="mx-auto max-w-3xl">
    <SectionTitle title="Order AutoQr" subtitle="One-time purchase. Lifetime owner use. Admin-managed physical fulfillment." />
    <div className="grid gap-3 md:grid-cols-3">
      {[
        [Sparkles, "Create account"],
        [PackageCheck, "Register vehicle/item"],
        [ArrowRight, "Complete payment and await delivery"]
      ].map(([Icon, text]) => (
        <div key={text as string} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <Icon className="mb-2 h-4 w-4 text-action" />
          {text as string}
        </div>
      ))}
    </div>
    <p className="mt-4 text-sm text-slate-600">After payment success, the QR is generated for admin printing and shipping. Owners track status in dashboard.</p>
    <Link to="/register">
      <Button className="mt-4">Start registration</Button>
    </Link>
  </Card>
);

export const IncidentPage = () => {
  const { token = "" } = useParams();
  const [form, setForm] = useState({ reporterName: "", reporterPhone: "", message: "", consent: false });
  const [files, setFiles] = useState<File[]>([]);
  const [incidentId, setIncidentId] = useState("");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [qrInfo, setQrInfo] = useState<{ status: string; vehicleType: string } | null>(null);

  useEffect(() => {
    api
      .get(`/public/incident/${token}`)
      .then((res) => setQrInfo(res.data.qr))
      .catch(() => setQrInfo(null));
  }, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const payload = new FormData();
    payload.set("reporterName", form.reporterName);
    payload.set("reporterPhone", form.reporterPhone);
    payload.set("message", form.message);
    payload.set("consent", String(form.consent));
    files.forEach((file) => payload.append("images", file));
    try {
      const { data } = await api.post(`/public/incident/${token}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setIncidentId(data.incident.id);
      setOwnerUserId(data.incident.ownerUserId);
      setSubmitted(true);
    } catch {
      setSubmitError("Could not submit incident. Please check details and try again.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <Badge label="Secure incident channel" tone="info" />
        <h1 className="mt-2 text-2xl font-bold">Report incident responsibly</h1>
        <p className="text-slate-600">
          This QR belongs to a registered AutoQr owner. Share accurate details so the owner can review the incident and communicate quickly.
        </p>
        {qrInfo ? (
          <p className="mt-2 text-sm text-slate-500">
            Registered item type: <span className="font-semibold text-slate-700">{qrInfo.vehicleType}</span>
          </p>
        ) : null}
        {submitted ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Incident submitted successfully. You can now request a secure web call with the owner.
          </div>
        ) : null}
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input placeholder="Reporter name (optional)" onChange={(e) => setForm((p) => ({ ...p, reporterName: e.target.value }))} maxLength={120} />
          <Input
            placeholder="Phone number"
            type="tel"
            minLength={7}
            maxLength={30}
            required
            onChange={(e) => setForm((p) => ({ ...p, reporterPhone: e.target.value }))}
          />
          <Textarea placeholder="Describe what happened" required minLength={5} maxLength={2000} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Upload incident images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="text-sm"
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? []).slice(0, 5);
                const filtered = selected.filter((file) => file.type.startsWith("image/") && file.size <= 8 * 1024 * 1024);
                setFiles(filtered);
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.consent} required onChange={(e) => setForm((p) => ({ ...p, consent: e.target.checked }))} />
            I confirm the report is truthful.
          </label>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          <Button type="submit">Submit incident</Button>
        </form>
      </Card>
      {incidentId && ownerUserId ? <CallReporterWidget incidentId={incidentId} ownerUserId={ownerUserId} /> : <EmptyState title="Call request appears after submission" message="Submit incident details first, then request a secure web-based call." />}
    </div>
  );
};
