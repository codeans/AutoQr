import { FormEvent, useState } from "react";
import { Button } from "../components/marketing/shared/Button";
import { Container } from "../components/marketing/shared/Container";
import { FieldGroup, FieldLabel, TextArea, TextField } from "../components/marketing/shared/Field";
import { PageHero } from "../components/marketing/shared/PageHero";
import { Reveal } from "../components/marketing/shared/Reveal";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

export const PartnerPage = () => {
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", volume: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Partners & resellers"
        title="Distribute AutoQR at scale."
        subtitle="Fleet operators, insurance, and mobility resellers — get preferential pricing, co-branded tags, and volume activation tools."
      />
      <SectionWrapper>
        <Container>
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <h2 className="font-display text-3xl text-fog-50">What partners get</h2>
                <ul className="mt-6 space-y-4 text-[15px] text-fog-300">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    Dedicated tag batches, co-branded if desired.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    Bulk activation portal and fleet dashboard.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    Priority support SLAs and a named account manager.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    Revenue share for resellers, with transparent reporting.
                  </li>
                </ul>
              </div>

              {submitted ? (
                <div className="rounded-3xl border border-accent/20 bg-accent/5 p-8 text-center">
                  <h3 className="font-display text-2xl text-fog-50">Thanks — we'll be in touch.</h3>
                  <p className="mt-3 text-[15px] text-fog-300">
                    Our partnerships team replies within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
                  <h3 className="font-display text-xl text-fog-50">Request partner access</h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <FieldGroup>
                      <FieldLabel htmlFor="company">Company</FieldLabel>
                      <TextField id="company" required value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="name">Your name</FieldLabel>
                      <TextField id="name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <TextField id="email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>
                      <TextField id="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="volume">Anticipated volume</FieldLabel>
                      <TextField id="volume" placeholder="e.g. 500 tags / quarter" value={form.volume} onChange={(e) => setForm((p) => ({ ...p, volume: e.target.value }))} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="notes">Use case / notes</FieldLabel>
                      <TextArea id="notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
                    </FieldGroup>
                  </div>
                  <Button size="lg" type="submit" className="mt-6 w-full">
                    Submit partner request
                  </Button>
                </form>
              )}
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>
    </>
  );
};
