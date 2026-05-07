/**
 * Canonical catalog: exactly four plans. Slugs are stable API/public identifiers.
 * syncCatalogPlans() applies copy & limits; preserves priceCents/compareAtCents on existing docs.
 */

export const CATALOG_PLAN_SLUGS = ["car-basic", "smart-key", "premium-combo", "fleet-pro"] as const;
export type CatalogPlanSlug = (typeof CATALOG_PLAN_SLUGS)[number];

export type CatalogPlanSeed = {
  slug: CatalogPlanSlug;
  code: string;
  tier: "car_basic" | "smart_key" | "premium_combo" | "fleet_pro";
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  includes: string[];
  nameDe: string;
  taglineDe: string;
  descriptionDe: string;
  highlightsDe: string[];
  priceCents: number;
  compareAtCents: number;
  currency: "EUR";
  billingCycle: "one_time";
  tagsIncluded: number;
  carLimit: number;
  emergencyContactLimit: number;
  supportTier: "standard" | "priority" | "dedicated";
  displayOrder: number;
  status: "active";
  isFeatured: boolean;
  isBestValue: boolean;
};

export const CATALOG_PLANS: CatalogPlanSeed[] = [
  {
    slug: "car-basic",
    code: "AQR-CAR-BASIC",
    tier: "car_basic",
    name: "Car-Basic",
    tagline: "Complete protection for your vehicle.",
    description:
      "Two premium QR tags for one vehicle — anonymous calling, smart notifications, and up to three emergency contacts.",
    highlights: [
      "Set of 2 QR tags for one vehicle",
      "One-time payment of only €24.99",
      "Premium weather-resistant quality",
      "Anonymised calling to protect your privacy",
      "Smart, reason-based vehicle notifications",
      "Store up to 3 emergency contacts",
      "Flexible: lifetime transfer between vehicles"
    ],
    includes: ["2 QR tags", "Activation guide", "Standard email support"],
    nameDe: "Car-Basic",
    taglineDe: "Rundum-Schutz für Ihr Fahrzeug",
    descriptionDe:
      "Zwei Premium-QR-Tags für ein Fahrzeug — anonyme Anrufweiterleitung, intelligente Benachrichtigungen und bis zu drei Notfallkontakte.",
    highlightsDe: [
      "Set aus 2 QR-Tags für 1 Fahrzeug.",
      "Einmalige Zahlung von nur 24,99 €.",
      "Hochwertige, wetterfeste Premium-Qualität.",
      "Anonymisierte Anruffunktion zum Schutz Ihrer Daten.",
      "Intelligente, grundbasierte Fahrzeugbenachrichtigungen.",
      "Hinterlegen Sie bis zu 3 Notfallkontakte.",
      "Flexibel: Lebenslange Übertragung zwischen Fahrzeugen möglich."
    ],
    priceCents: 2499,
    compareAtCents: 0,
    currency: "EUR",
    billingCycle: "one_time",
    tagsIncluded: 2,
    carLimit: 1,
    emergencyContactLimit: 3,
    supportTier: "standard",
    displayOrder: 1,
    status: "active",
    isFeatured: false,
    isBestValue: false
  },
  {
    slug: "smart-key",
    code: "AQR-SMART-KEY",
    tier: "smart_key",
    name: "Smart-Key",
    tagline: "The digital companion for your keychain.",
    description:
      "One exclusive QR tag for your keyring — rugged build, masked calling, and real-time alerts when someone finds your keys.",
    highlights: [
      "1 exclusive QR tag for your keyring",
      "One-time purchase: €19.99",
      "Rugged, weatherproof design",
      "Secure communication via masked calling",
      "Real-time alerts when found or needed",
      "Up to 3 emergency contacts",
      "Lifetime pairing with your personal keyring"
    ],
    includes: ["1 QR tag", "Activation guide", "Standard email support"],
    nameDe: "Smart-Key",
    taglineDe: "Der digitale Begleiter für Ihren Schlüssel",
    descriptionDe:
      "Ein exklusiver QR-Tag für Ihren Schlüsselbund — robust, mit Masked-Calling und Echtzeit-Hinweisen, wenn jemand Ihre Schlüssel findet.",
    highlightsDe: [
      "1 exklusiver QR-Tag für Ihren Schlüsselbund.",
      "Einmalige Investition: 19,99 €.",
      "Robustes und wetterfestes Design.",
      "Sichere Kommunikation über Masked-Calling.",
      "Echtzeit-Meldungen bei Fund oder Bedarf.",
      "Bis zu 3 Notfallkontakte hinterlegbar.",
      "Lebenslange Verknüpfung mit Ihrem persönlichen Keyring."
    ],
    priceCents: 1999,
    compareAtCents: 0,
    currency: "EUR",
    billingCycle: "one_time",
    tagsIncluded: 1,
    carLimit: 1,
    emergencyContactLimit: 3,
    supportTier: "standard",
    displayOrder: 2,
    status: "active",
    isFeatured: false,
    isBestValue: false
  },
  {
    slug: "premium-combo",
    code: "AQR-PREMIUM-COMBO",
    tier: "premium_combo",
    name: "Premium-Combo",
    tagline: "Maximum security for car & keys.",
    description:
      "Our bestseller: two vehicle tags plus a premium key fob tag — priority routing and automatic emergency escalation.",
    highlights: [
      "Our bestseller: 2 QR tags for the car + 1 premium key fob tag",
      "Complete bundle at the special price of €39.99",
      "Weatherproof premium build for maximum durability",
      "Up to 2 priority emergency contacts",
      "Fast-track notification routing for quicker response",
      "Automatic emergency escalation"
    ],
    includes: ["3 QR tags", "Activation guide", "Priority notification routing"],
    nameDe: "Premium-Combo",
    taglineDe: "Maximale Sicherheit für Auto & Schlüssel",
    descriptionDe:
      "Unser Bestseller: zwei Fahrzeug-Tags plus ein hochwertiger Schlüsselanhänger — priorisiertes Routing und automatische Notfall-Eskalation.",
    highlightsDe: [
      "Unser Bestseller! 2 QR-Tags für das Auto + 1 hochwertiger Schlüsselanhänger.",
      "Komplettpaket zum Sonderpreis von 39.99 €.",
      "Wetterfeste Premium-Ausführung für höchste Langlebigkeit.",
      "Bis zu 2 priorisierte Notfallkontakte.",
      "Eilmeldung-Routing für schnellste Reaktion.",
      "Automatisches Notfall-Eskalationssystem."
    ],
    priceCents: 3999,
    compareAtCents: 0,
    currency: "EUR",
    billingCycle: "one_time",
    tagsIncluded: 3,
    carLimit: 1,
    emergencyContactLimit: 2,
    supportTier: "priority",
    displayOrder: 3,
    status: "active",
    isFeatured: true,
    isBestValue: true
  },
  {
    slug: "fleet-pro",
    code: "AQR-FLEET-PRO",
    tier: "fleet_pro",
    name: "Fleet-Pro",
    tagline: "The professional solution for vehicle fleets.",
    description:
      "Ten weatherproof tags for up to five vehicles — fleet dashboard, bulk activation, and 24/7 priority support.",
    highlights: [
      "Comprehensive set: 10 QR tags for up to 5 vehicles",
      "Exclusive price: €119.99",
      "Central fleet dashboard for easy management",
      "Includes bulk activation for fast rollout",
      "Unlimited emergency contacts",
      "24/7 priority support for your business",
      "Weatherproof premium quality for demanding operations"
    ],
    includes: ["10 QR tags", "Fleet onboarding kit", "Priority support channel"],
    nameDe: "Fleet-Pro",
    taglineDe: "Die professionelle Lösung für Fahrzeugflotten",
    descriptionDe:
      "Zehn wetterfeste Tags für bis zu fünf Fahrzeuge — Fleet-Dashboard, Sammelaktivierung und 24/7-Priority-Support.",
    highlightsDe: [
      "Umfassendes Set: 10 QR-Tags für bis zu 5 Fahrzeuge.",
      "Exklusiver Preis: 119,99 €.",
      "Zentrales Fleet-Dashboard zur einfachen Verwaltung.",
      "Inklusive Sammelaktivierung für schnellen Einsatz.",
      "Unbegrenzte Anzahl an Notfallkontakten.",
      "24/7 Priority-Support für Ihr Unternehmen.",
      "Wetterfeste Premium-Qualität für den harten Arbeitseinsatz"
    ],
    priceCents: 11999,
    compareAtCents: 0,
    currency: "EUR",
    billingCycle: "one_time",
    tagsIncluded: 10,
    carLimit: 5,
    emergencyContactLimit: 999,
    supportTier: "priority",
    displayOrder: 4,
    status: "active",
    isFeatured: false,
    isBestValue: false
  }
];
