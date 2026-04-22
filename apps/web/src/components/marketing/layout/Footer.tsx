import { Link } from "react-router-dom";
import { Container } from "../shared/Container";
import { Logo } from "../shared/Logo";

const groups = [
  {
    title: "Product",
    links: [
      { to: "/plans", label: "Plans" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/use-cases", label: "Use cases" },
      { to: "/pricing", label: "Pricing" },
      { to: "/for-car-owners", label: "For vehicles" },
      { to: "/for-items", label: "For assets" }
    ]
  },
  {
    title: "Company",
    links: [
      { to: "/partner", label: "Partners" },
      { to: "/contact", label: "Contact" },
      { to: "/help", label: "Help center" },
      { to: "/faq", label: "FAQ" }
    ]
  },
  {
    title: "Access",
    links: [
      { to: "/login", label: "Sign in" },
      { to: "/register", label: "Create account" },
      { to: "/dashboard", label: "My dashboard" }
    ]
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/contact", label: "Imprint" }
    ]
  }
];

export const Footer = () => (
  <footer className="relative overflow-hidden border-t border-white/[0.06] bg-ink-950">
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
    />
    <Container>
      <div className="grid gap-16 pb-16 pt-24 lg:grid-cols-[1.2fr_2fr] lg:pt-28">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-6 text-sm leading-relaxed text-fog-300">
            Privacy-first QR identity for vehicles and high-value assets. Never
            expose personal numbers, always stay reachable when it matters.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-fog-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live in DE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fog-400">
                {group.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <Link
                      to={link.to}
                      className="text-[14px] text-fog-200 transition-colors hover:text-fog-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 border-t border-white/[0.06] py-8 text-xs text-fog-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} AutoQr. All rights reserved.</p>
        <p className="font-mono tracking-tight text-fog-500">
          autoqr.de — privacy-first incident communication
        </p>
      </div>
    </Container>

    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-28 left-1/2 h-[260px] w-[900px] -translate-x-1/2 select-none text-[14vw] font-black leading-none tracking-tightest text-white/[0.025] mix-blend-screen sm:-bottom-40 sm:text-[16vw]"
    >
      AUTOQR
    </div>
  </footer>
);
