import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

export const PrivacyPage = () => (
  <>
    <PageHero
      eyebrow="Privacy"
      title="Your number is the secret we protect."
      subtitle="AutoQR runs on the principle that no reporter should ever see an owner's phone number. This page summarises how we handle data."
    />
    <SectionWrapper>
      <Container size="narrow">
        <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-fog-300">
          <h2 className="font-display text-2xl text-fog-50">Data we collect</h2>
          <p>Name, email, phone number, shipping address, vehicle details you voluntarily enter, and scan events on tags you own.</p>
          <h2 className="mt-8 font-display text-2xl text-fog-50">How masked calling works</h2>
          <p>
            When a reporter requests a call, we generate a short-lived session through a privacy relay. Neither party sees the other
            number. Sessions expire automatically.
          </p>
          <h2 className="mt-8 font-display text-2xl text-fog-50">Consent and audit</h2>
          <p>
            Every acceptance of terms, privacy, or marketing is stored as a versioned consent record. You can request an export or
            deletion any time via support.
          </p>
          <h2 className="mt-8 font-display text-2xl text-fog-50">Data retention</h2>
          <p>
            We retain scan events for 12 months, order records for 7 years for accounting compliance, and delete access tokens
            immediately on logout.
          </p>
        </div>
      </Container>
    </SectionWrapper>
  </>
);
