import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../shared/Container";
import { Logo } from "../shared/Logo";
import { localizePath } from "../../../i18n/routing";

export const Footer = () => {
  const { t } = useTranslation();

  const groups = [
    {
      title: t("footer.product"),
      links: [
        { to: "/how-it-works", label: t("nav.howItWorks") },
        { to: "/use-cases", label: t("nav.useCases") },
        { to: "/pricing", label: t("nav.pricing") },
        { to: "/order", label: t("common.orderNow") }
      ]
    },
    {
      title: t("footer.company"),
      links: [
        { to: "/about", label: t("nav.about") },
        { to: "/contact", label: t("nav.contact") },
        { to: "/faq", label: t("nav.faq") },
        { to: "/help", label: t("footer.support") }
      ]
    },
    {
      title: t("dashboard.title"),
      links: [
        { to: "/login", label: t("common.signIn") },
        { to: "/register", label: t("common.signUp") },
        { to: "/dashboard", label: t("dashboard.title") }
      ]
    },
    {
      title: t("footer.legal"),
      links: [
        { to: "/privacy", label: t("footer.privacy") },
        { to: "/terms", label: t("footer.terms") },
        { to: "/refund-policy", label: t("footer.refund") },
        { to: "/shipping-policy", label: t("footer.shipping") }
      ]
    }
  ];

  return (
    <footer className="relative border-t border-surface-border bg-surface-soft">
      <Container>
        <div className="grid gap-16 pb-16 pt-20 lg:grid-cols-[1.2fr_2fr] lg:pt-24">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-sm leading-relaxed text-content-muted">{t("footer.tagline")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t("footer.madeIn")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-content-subtle">{group.title}</h4>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link
                        to={localizePath(link.to)}
                        className="text-[14px] text-content-muted transition-colors hover:text-brand-700"
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

        <div className="border-t border-surface-border py-8">
          <div className="flex flex-col gap-6 text-xs text-content-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} AutoQr. {t("footer.rights")}</p>
            <p className="font-mono tracking-tight text-content-soft">autoqr.de — {t("footer.tagline")}</p>
          </div>
          <p className="mt-6 text-center text-xs text-content-subtle">
            {t("footer.designedByPrefix")}{" "}
            <a
              href="https://codeans.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-content-muted transition-colors hover:text-brand-700"
            >
              CODEANS
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
};
