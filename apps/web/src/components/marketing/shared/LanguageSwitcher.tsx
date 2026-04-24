import clsx from "clsx";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@autoqr/shared";
import { currentLocale, setLocale } from "../../../i18n";
import { localizePath, stripLocalePrefix } from "../../../i18n/routing";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  variant?: "navbar" | "compact" | "inline";
  className?: string;
  onChange?: (locale: Locale) => void;
};

export const LanguageSwitcher = ({ variant = "navbar", className, onChange }: Props) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const active = currentLocale();

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const onSelect = (locale: Locale) => {
    setLocale(locale);
    const nextPath = localizePath(stripLocalePrefix(location.pathname), locale);
    navigate(`${nextPath}${location.search}${location.hash}`, { replace: true });
    setOpen(false);
    onChange?.(locale);
  };

  const label = LOCALE_LABELS[active as Locale] ?? "Deutsch";

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.selectLanguage") as string}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border text-[13px] font-medium transition",
          variant === "navbar"
            ? "border-surface-border bg-white/60 px-3 py-2 text-content-muted hover:text-content"
            : variant === "compact"
            ? "border-transparent bg-transparent px-2 py-1 text-content-muted hover:text-content"
            : "border-surface-border bg-white px-3 py-2"
        )}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span>{label}</span>
        <ChevronDown className={clsx("h-3.5 w-3.5 transition", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-surface-border bg-white shadow-xl"
        >
          {SUPPORTED_LOCALES.map((loc) => {
            const selected = loc === active;
            return (
              <li key={loc}>
                <button
                  role="option"
                  aria-selected={selected}
                  type="button"
                  onClick={() => onSelect(loc)}
                  lang={loc}
                  className={clsx(
                    "flex w-full items-center justify-between gap-4 px-3.5 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-brand-50 text-brand-700"
                      : "text-content hover:bg-surface-sunken"
                  )}
                >
                  <span>{LOCALE_LABELS[loc]}</span>
                  {selected ? <Check className="h-4 w-4" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <span className="sr-only">{i18n.language}</span>
    </div>
  );
};
