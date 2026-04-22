import { Container } from "../components/marketing/shared/Container";
import { PageHero } from "../components/marketing/shared/PageHero";
import { SectionWrapper } from "../components/marketing/shared/SectionWrapper";

export const TermsPage = () => (
  <>
    <PageHero
      eyebrow="Terms"
      title="How AutoQR works, contractually."
      subtitle="Plain-English terms covering account use, tag ownership, privacy guarantees, refunds, and abuse."
    />
    <SectionWrapper>
      <Container size="narrow">
        <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-fog-300">
          <h2 className="font-display text-2xl text-fog-50">Account & eligibility</h2>
          <p>You must be 18 or older and able to enter a binding contract to use AutoQR.</p>
          <h2 className="mt-8 font-display text-2xl text-fog-50">Tags & ownership</h2>
          <p>
            Physical tags are sold outright. Activation links the digital identity to your account. You can reassign or disable tags
            you own at any time.
          </p>
          <h2 className="mt-8 font-display text-2xl text-fog-50">Acceptable use</h2>
          <p>
            The privacy relay is not a stalker tool. Abusive, harassing, or commercial-spam scan alerts will be rate-limited and
            owners can ban reporter phone numbers from their tags.
          </p>
          <h2 className="mt-8 font-display text-2xl text-fog-50">Refunds</h2>
          <p>Unopened packs can be returned within 14 days for a full refund.</p>
        </div>
      </Container>
    </SectionWrapper>
  </>
);
