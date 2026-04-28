import { Car, Check, KeyRound } from "lucide-react";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";
import carImage from "../../../assets/images/car.jpeg";
import keysImage from "../../../assets/images/keys.jpeg";

export const CarsKeys = () => {
  const { useCases } = useMarketingContent();
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {useCases.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {useCases.description}
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <UseCaseCard
            icon={<Car className="h-6 w-6" />}
            data={useCases.car}
            visual={<CarVisual />}
          />
          <UseCaseCard
            icon={<KeyRound className="h-6 w-6" />}
            data={useCases.key}
            visual={<KeyVisual />}
          />
        </div>
      </Container>
    </section>
  );
};

type UseCaseCardProps = {
  icon: React.ReactNode;
  data: { title: string; description: string; bullets: string[] };
  visual: React.ReactNode;
};

const UseCaseCard = ({ icon, data, visual }: UseCaseCardProps) => (
  <div className="group relative overflow-hidden rounded-3xl border border-surface-border bg-surface-soft p-8 transition hover:border-brand-200 hover:shadow-card sm:p-10">
    <div className="flex items-center gap-3">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)]">
        {icon}
      </span>
      <h3 className="text-2xl font-semibold tracking-tight text-content">{data.title}</h3>
    </div>
    <p className="mt-4 max-w-md text-base leading-relaxed text-content-muted">
      {data.description}
    </p>
    <ul className="mt-6 space-y-2.5">
      {data.bullets.map((b) => (
        <li key={b} className="flex items-start gap-2.5 text-sm text-content">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
            <Check className="h-3 w-3" />
          </span>
          {b}
        </li>
      ))}
    </ul>
    <div className="mt-8 w-full overflow-hidden rounded-2xl border border-surface-border bg-white">
      {visual}
    </div>
  </div>
);

const CarVisual = () => (
  <img
    src={carImage}
    alt="Car windshield with AutoQR code"
    className="block h-auto w-full"
    loading="lazy"
  />
);

const KeyVisual = () => (
  <img
    src={keysImage}
    alt="Car keychain with AutoQR code"
    className="block h-auto w-full"
    loading="lazy"
  />
);
