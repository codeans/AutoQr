import { Car, Check, KeyRound } from "lucide-react";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

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
    <div className="mt-8 h-40 w-full overflow-hidden rounded-2xl border border-surface-border bg-white">
      {visual}
    </div>
  </div>
);

const CarVisual = () => (
  <div className="relative grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_center,rgba(219,234,254,0.6),transparent_70%)]">
    <svg viewBox="0 0 200 80" className="h-24 w-full" aria-hidden>
      <rect x="20" y="35" width="160" height="25" rx="8" fill="#DBEAFE" />
      <path
        d="M40 35 L55 18 L145 18 L160 35 Z"
        fill="#1D4ED8"
        opacity="0.9"
      />
      <rect x="60" y="22" width="30" height="13" rx="2" fill="#EFF4FF" />
      <rect x="110" y="22" width="30" height="13" rx="2" fill="#EFF4FF" />
      <circle cx="55" cy="62" r="8" fill="#111827" />
      <circle cx="55" cy="62" r="3" fill="#9CA3AF" />
      <circle cx="145" cy="62" r="8" fill="#111827" />
      <circle cx="145" cy="62" r="3" fill="#9CA3AF" />
      <rect x="85" y="25" width="30" height="8" rx="2" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="1" />
      <rect x="92" y="28" width="4" height="2" fill="#111827" />
      <rect x="100" y="28" width="2" height="2" fill="#111827" />
      <rect x="104" y="28" width="4" height="2" fill="#111827" />
    </svg>
  </div>
);

const KeyVisual = () => (
  <div className="relative grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_center,rgba(219,234,254,0.6),transparent_70%)]">
    <svg viewBox="0 0 200 80" className="h-28 w-full" aria-hidden>
      <circle cx="60" cy="40" r="22" fill="#1D4ED8" />
      <circle cx="60" cy="40" r="10" fill="#EFF4FF" />
      <rect x="80" y="35" width="80" height="10" fill="#111827" rx="1" />
      <rect x="130" y="32" width="4" height="16" fill="#111827" />
      <rect x="145" y="32" width="4" height="16" fill="#111827" />
      <rect x="155" y="32" width="4" height="16" fill="#111827" />
      <rect x="88" y="28" width="18" height="18" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="1" rx="2" />
      <rect x="91" y="31" width="3" height="3" fill="#111827" />
      <rect x="100" y="31" width="3" height="3" fill="#111827" />
      <rect x="91" y="40" width="3" height="3" fill="#111827" />
      <rect x="100" y="40" width="3" height="3" fill="#111827" />
    </svg>
  </div>
);
