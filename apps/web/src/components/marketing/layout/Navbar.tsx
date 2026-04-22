import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Container } from "../shared/Container";
import { LinkButton } from "../shared/Button";
import { Logo } from "../shared/Logo";

const navLinks = [
  { to: "/plans", label: "Plans" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/use-cases", label: "Use cases" },
  { to: "/help", label: "Help" },
  { to: "/contact", label: "Contact" }
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
          ? "border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl"
          : "border-b border-transparent"
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
                  to={link.to}
                  className={({ isActive }) =>
                    clsx(
                      "relative rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                      isActive
                        ? "text-fog-50"
                        : "text-fog-300 hover:text-fog-50"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-[13.5px] font-medium text-fog-300 transition-colors hover:text-fog-50"
            >
              Sign in
            </Link>
            <LinkButton to="/plans" size="sm" showArrow>
              Choose a plan
            </LinkButton>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-fog-100 transition hover:bg-white/[0.06] lg:hidden"
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-ink-950/95 backdrop-blur-xl lg:hidden sm:top-[72px]"
          >
            <motion.nav
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-10 sm:px-8"
            >
              <ul className="flex flex-col divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center justify-between py-5 text-2xl font-medium tracking-tight transition-colors",
                          isActive ? "text-fog-50" : "text-fog-200 hover:text-fog-50"
                        )
                      }
                    >
                      {link.label}
                      <span aria-hidden className="text-fog-500">
                        →
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-3">
                <LinkButton to="/plans" size="lg" showArrow>
                  Choose a plan
                </LinkButton>
                <LinkButton to="/login" variant="secondary" size="lg">
                  Sign in
                </LinkButton>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
