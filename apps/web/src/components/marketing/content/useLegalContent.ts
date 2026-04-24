import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import { currentLocale } from "../../../i18n";
import type { Locale } from "@autoqr/shared";

export type LegalContent = {
  title: string;
  updatedLabel: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

type Bundle = Record<Locale, Record<string, LegalContent>>;

const defaultLegalContentByLocale: Bundle = {
  de: {
    "privacy-policy": {
      title: "Datenschutzerklärung",
      updatedLabel: "Zuletzt aktualisiert: April 2026",
      intro:
        "AutoQr ist auf Datenschutz ausgelegt. Diese Richtlinie erklärt, welche Daten wir erheben, warum und wie wir sie gemäß DSGVO und deutschem Datenschutzrecht schützen.",
      sections: [
        {
          heading: "Welche Daten wir erheben",
          body: "Wir erheben nur Daten, die zur Bereitstellung des AutoQr-Dienstes erforderlich sind: Kontodaten (Name, E-Mail, Telefonnummer), Ihre QR-Codes, Fahrzeug- und Schlüsselprofile sowie Vorfalldaten beim Scannen Ihres QR-Codes."
        },
        {
          heading: "Wie wir Ihre Daten verwenden",
          body: "Ihre Daten werden verwendet, um Ihren QR-Code zu aktivieren, Anrufe sicher zu vermitteln, Bestellungen und Zahlungen abzuwickeln und Support zu leisten. Wir verkaufen Ihre Daten nicht."
        },
        {
          heading: "Aufbewahrung",
          body: "Wir bewahren Vorfalldaten nur so lange auf, wie es zur Abwicklung und zur Erfüllung gesetzlicher Pflichten notwendig ist. Sie können jederzeit eine Löschung verlangen."
        },
        {
          heading: "Ihre Rechte",
          body: "Sie haben das Recht auf Auskunft, Berichtigung, Datenübertragbarkeit und Löschung. Schreiben Sie uns an privacy@autoqr.de."
        }
      ]
    },
    terms: {
      title: "Allgemeine Geschäftsbedingungen",
      updatedLabel: "Zuletzt aktualisiert: April 2026",
      intro: "Diese AGB regeln die Nutzung von AutoQr. Mit der Nutzung stimmen Sie ihnen zu.",
      sections: [
        {
          heading: "Leistungsbeschreibung",
          body: "AutoQr ist ein datenschutzkonformer QR-Kontaktdienst für Fahrzeuge und Schlüssel, betrieben in Deutschland."
        },
        {
          heading: "Ihr Konto",
          body: "Sie sind für die Richtigkeit Ihrer Kontodaten und die Sicherheit Ihrer Zugangsdaten verantwortlich."
        },
        {
          heading: "Nutzungsregeln",
          body: "Sie verpflichten sich, den Dienst nicht zu missbrauchen, keine andere Identität vorzutäuschen und AutoQr nicht für rechtswidrige Zwecke zu nutzen."
        },
        {
          heading: "Haftung",
          body: "AutoQr wird wie besehen bereitgestellt. Wir bemühen uns um höchste Verfügbarkeit, können sie jedoch nicht ununterbrochen garantieren."
        }
      ]
    },
    "refund-policy": {
      title: "Rückerstattungsrichtlinie",
      updatedLabel: "Zuletzt aktualisiert: April 2026",
      intro: "Wenn Ihr AutoQr-Produkt fehlerhaft oder nicht wie beschrieben ist, helfen wir gerne weiter.",
      sections: [
        {
          heading: "14-tägiges Rückgaberecht",
          body: "Gemäß deutschem Verbraucherrecht können Sie unbenutzte AutoQr-Produkte innerhalb von 14 Tagen nach Erhalt zurücksenden und erhalten den vollen Kaufpreis zurück."
        },
        {
          heading: "Defekte Produkte",
          body: "Sollte Ihr QR beschädigt ankommen oder ausfallen, kontaktieren Sie uns – wir senden kostenlosen Ersatz."
        },
        {
          heading: "Rückerstattung beantragen",
          body: "Schreiben Sie uns an support@autoqr.de mit Ihrer Bestellnummer. Wir antworten innerhalb von 2 Werktagen."
        }
      ]
    },
    "shipping-policy": {
      title: "Versandrichtlinie",
      updatedLabel: "Zuletzt aktualisiert: April 2026",
      intro: "AutoQr versendet deutschlandweit mit Sendungsverfolgung.",
      sections: [
        {
          heading: "Lieferzeit",
          body: "Bestellungen werden innerhalb von 1–2 Werktagen versendet. Die Lieferung innerhalb Deutschlands dauert 2–4 Werktage."
        },
        {
          heading: "Versandkosten",
          body: "Der Versand ist im Produktpreis enthalten. Keine versteckten Kosten."
        },
        {
          heading: "Sendungsverfolgung",
          body: "Sie erhalten den Tracking-Link per E-Mail, sobald die Bestellung versandt wird."
        }
      ]
    },
    about: {
      title: "Über AutoQr",
      updatedLabel: "",
      intro:
        "AutoQr ist ein kleines deutsches Team mit einer klaren Idee: Sie sollen für Ihr Fahrzeug und Ihre Schlüssel erreichbar bleiben, ohne je Ihre Telefonnummer preiszugeben.",
      sections: [
        {
          heading: "Warum wir das bauen",
          body: "Wir sehen täglich, wie Fahrer Ihre Telefonnummern hinter der Windschutzscheibe hinterlassen. Das geht auch sicherer – mit AutoQr."
        },
        {
          heading: "Für Deutschland gebaut",
          body: "AutoQr wird in Deutschland gehostet, folgt deutschen und EU-Datenschutzregeln und ist für echte Fahrer im ganzen Land gedacht."
        },
        {
          heading: "Unser Versprechen",
          body: "Wir verkaufen Ihre Daten niemals. Ihre Telefonnummer bleibt immer privat. AutoQr bleibt einfach, schnell und ehrlich."
        }
      ]
    }
  },
  en: {
    "privacy-policy": {
      title: "Privacy Policy",
      updatedLabel: "Last updated: April 2026",
      intro:
        "AutoQr is built around privacy. This policy explains what we collect, why, and how we protect your information in line with the GDPR and German data protection law.",
      sections: [
        {
          heading: "Information we collect",
          body: "We collect only what is necessary to deliver the AutoQr service: your account details (name, email, phone), your QR codes, your car and key profiles, and incident data when someone scans your QR."
        },
        {
          heading: "How we use your information",
          body: "Your information is used to activate your QR, connect incident calls securely, process orders and payments, and provide support. We do not sell your data."
        },
        {
          heading: "Data retention",
          body: "We keep incident data only as long as needed to complete the incident and meet legal obligations. You can request deletion at any time."
        },
        {
          heading: "Your rights",
          body: "You have the right to access, correct, export, and delete your data. You can exercise these rights by emailing privacy@autoqr.de."
        }
      ]
    },
    terms: {
      title: "Terms & Conditions",
      updatedLabel: "Last updated: April 2026",
      intro: "These Terms govern your use of AutoQr. By using our service you agree to them.",
      sections: [
        {
          heading: "Service description",
          body: "AutoQr is a privacy-first QR contact service for vehicles and keys, operated in Germany."
        },
        {
          heading: "Your account",
          body: "You are responsible for the information on your account and keeping your credentials secure."
        },
        {
          heading: "Acceptable use",
          body: "You agree not to misuse the service, not to impersonate others, and not to use AutoQr for any unlawful purpose."
        },
        {
          heading: "Liability",
          body: "AutoQr is provided as-is. We do our best to keep the service reliable but cannot guarantee uninterrupted availability."
        }
      ]
    },
    "refund-policy": {
      title: "Refund Policy",
      updatedLabel: "Last updated: April 2026",
      intro: "If your AutoQr product is faulty or not as described, we're happy to help.",
      sections: [
        {
          heading: "14-day return window",
          body: "In line with German consumer law, you may return unused AutoQr products within 14 days of delivery for a full refund."
        },
        {
          heading: "Faulty products",
          body: "If your QR arrives damaged or stops working, contact us and we'll send a free replacement."
        },
        {
          heading: "How to request a refund",
          body: "Email support@autoqr.de with your order number. We respond within 2 business days."
        }
      ]
    },
    "shipping-policy": {
      title: "Shipping Policy",
      updatedLabel: "Last updated: April 2026",
      intro: "AutoQr ships across Germany with tracked delivery.",
      sections: [
        {
          heading: "Delivery time",
          body: "Orders are dispatched within 1–2 business days. Standard delivery in Germany takes 2–4 business days."
        },
        {
          heading: "Shipping costs",
          body: "Shipping is included in the product price. There are no hidden costs at checkout."
        },
        {
          heading: "Tracking",
          body: "You will receive a tracking link by email as soon as your order is dispatched."
        }
      ]
    },
    about: {
      title: "About AutoQr",
      updatedLabel: "",
      intro:
        "AutoQr is a small German team building a simple idea: you should stay reachable for your car and keys, without ever giving away your phone number.",
      sections: [
        {
          heading: "Why we built this",
          body: "We kept seeing drivers leaving their phone numbers on dashboards — and keys with no safe way home. So we built the privacy-first alternative."
        },
        {
          heading: "Built for Germany",
          body: "AutoQr is hosted in Germany, follows German and EU privacy rules, and is designed for real drivers across the country."
        },
        {
          heading: "Our promise",
          body: "We will never sell your data. Your phone number will never be exposed. AutoQr will always be simple, fast, and honest."
        }
      ]
    }
  }
};

type CmsResponse = {
  content?: {
    slug: string;
    locale?: Locale;
    title?: string;
    title_de?: string;
    title_en?: string;
    sections?: unknown[];
    sections_de?: unknown[];
    sections_en?: unknown[];
  };
};

export const useLegalContent = (slug: string): LegalContent => {
  const { i18n } = useTranslation();
  const locale = currentLocale();
  const { data } = useQuery({
    queryKey: ["public-content", slug, locale],
    queryFn: async () => {
      const res = await api.get<CmsResponse>(`/public/content/${slug}`, {
        params: { lang: locale }
      });
      return res.data;
    },
    staleTime: 60_000,
    retry: false
  });

  const langBundle = defaultLegalContentByLocale[locale] ?? defaultLegalContentByLocale.de;
  const fallback = langBundle[slug] ?? {
    title: slug,
    updatedLabel: "",
    intro: "",
    sections: []
  };

  void i18n.language;

  const cms = data?.content;
  if (!cms) return fallback;

  const sectionsSource =
    locale === "de"
      ? cms.sections_de ?? cms.sections
      : cms.sections_en ?? cms.sections;

  const legal = (sectionsSource ?? []).find(
    (s: unknown) => typeof s === "object" && s && (s as { type?: string }).type === "legal"
  ) as { data?: Partial<LegalContent> } | undefined;

  const titleSource =
    locale === "de" ? cms.title_de || cms.title : cms.title_en || cms.title;

  if (!legal?.data) {
    return {
      ...fallback,
      title: titleSource || fallback.title
    };
  }

  return {
    title: legal.data.title ?? titleSource ?? fallback.title,
    updatedLabel: legal.data.updatedLabel ?? fallback.updatedLabel,
    intro: legal.data.intro ?? fallback.intro,
    sections: legal.data.sections?.length ? legal.data.sections : fallback.sections
  };
};

export const defaultLegalContent = defaultLegalContentByLocale.de;
export const defaultLegalContentLocales = defaultLegalContentByLocale;
