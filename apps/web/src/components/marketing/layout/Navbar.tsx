import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../shared/Container";
import { LinkButton } from "../shared/Button";
import { Logo } from "../shared/Logo";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { localizePath } from "../../../i18n/routing";

export const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/how-it-works", label: t("nav.howItWorks") },
    { to: "/use-cases", label: t("nav.useCases") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/faq", label: t("nav.faq") },
    { to: "/contact", label: t("nav.contact") }
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-surface-border/80 bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-white/0"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between sm:h-[72px]">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={localizePath(link.to)}
                  className={({ isActive }) =>
                    clsx(
                      "relative rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                      isActive
                        ? "text-brand-700"
                        : "text-content-muted hover:text-content"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher variant="navbar" />
            <Link
              to={localizePath("/login")}
              className="rounded-full px-4 py-2 text-[13.5px] font-medium text-content-muted transition-colors hover:text-content"
            >
              {t("nav.signIn")}
            </Link>
            <LinkButton to="/order" size="sm" showArrow>
              {t("nav.orderQr")}
            </LinkButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              aria-label={open ? (t("common.close") as string) : "Menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-content transition hover:bg-surface-sunken"
            >
              {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-white/98 backdrop-blur-xl lg:hidden sm:top-[72px]"
          >
            <motion.nav
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-10 sm:px-8"
            >
              <ul className="flex flex-col divide-y divide-surface-border border-y border-surface-border">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={localizePath(link.to)}
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center justify-between py-5 text-2xl font-medium tracking-tight transition-colors",
                          isActive ? "text-brand-700" : "text-content hover:text-brand-700"
                        )
                      }
                    >
                      {link.label}
                      <span aria-hidden className="text-content-soft">→</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-3">
                <LinkButton to="/order" size="lg" showArrow>
                  {t("nav.orderQr")}
                </LinkButton>
                <LinkButton to="/login" variant="secondary" size="lg">
                  {t("nav.signIn")}
                </LinkButton>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
