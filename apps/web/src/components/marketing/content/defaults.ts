export type HeroContent = {
  eyebrow: string;
  headline: string;
  highlight: string;
  description: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
  trustLine: string;
};

export type ProblemItem = { title: string; description: string; icon: string };
export type ProblemContent = {
  eyebrow: string;
  headline: string;
  description: string;
  items: ProblemItem[];
};

export type SolutionStep = { title: string; description: string };
export type SolutionContent = {
  eyebrow: string;
  headline: string;
  description: string;
  steps: SolutionStep[];
};

export type UseCaseContent = {
  headline: string;
  description: string;
  car: { title: string; description: string; bullets: string[] };
  key: { title: string; description: string; bullets: string[] };
};

export type WorkflowStep = { title: string; description: string };
export type WorkflowContent = {
  eyebrow: string;
  headline: string;
  description: string;
  steps: WorkflowStep[];
};

export type PrivacyContent = {
  eyebrow: string;
  headline: string;
  description: string;
  pillars: { title: string; description: string }[];
};

export type PricingContent = {
  eyebrow: string;
  headline: string;
  description: string;
  price: string;
  priceCaption: string;
  features: string[];
  cta: { label: string; to: string };
};

export type TestimonialContent = {
  headline: string;
  description: string;
  items: { quote: string; author: string; role: string }[];
};

export type FAQContent = {
  eyebrow: string;
  headline: string;
  description: string;
  items: { question: string; answer: string }[];
};

export type CTAContent = {
  headline: string;
  description: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
};

export type MarketingContent = {
  hero: HeroContent;
  problem: ProblemContent;
  solution: SolutionContent;
  useCases: UseCaseContent;
  workflow: WorkflowContent;
  privacy: PrivacyContent;
  pricing: PricingContent;
  testimonials: TestimonialContent;
  faq: FAQContent;
  cta: CTAContent;
};

const englishMarketingContent: MarketingContent = {
  hero: {
    eyebrow: "Made in Germany",
    headline: "Protect your car and keys",
    highlight: "with a smart QR.",
    description:
      "If someone damages your parked car or finds your lost keys, they can reach you privately — without ever seeing your phone number.",
    primaryCta: { label: "Order Your QR", to: "/order" },
    secondaryCta: { label: "How it works", to: "/how-it-works" },
    trustLine: "GDPR-aligned. Your phone number is never exposed."
  },
  problem: {
    eyebrow: "The problem",
    headline: "Phone numbers on dashboards are a bad idea.",
    description: "Stay reachable for the moments that matter, without exposing personal information to strangers.",
    items: [
      {
        title: "Someone hits your parked car",
        description: "They leave, because there is no safe way to reach you.",
        icon: "car"
      },
      {
        title: "You lose your keys",
        description: "No one can return them — your address is nowhere on them.",
        icon: "key"
      },
      {
        title: "Your number becomes public",
        description: "A dashboard note leaks your number to anyone walking past.",
        icon: "eye"
      },
      {
        title: "Emergencies get delayed",
        description: "Tow, parking fines, headlights on — no easy way to alert you.",
        icon: "alert"
      }
    ]
  },
  solution: {
    eyebrow: "The solution",
    headline: "AutoQr in three simple steps.",
    description: "Built for people who want to stay reachable, but also want their privacy.",
    steps: [
      {
        title: "Order your QR",
        description: "Premium, weather-proof QR sticker or keychain shipped across Germany."
      },
      {
        title: "Activate in one minute",
        description: "Scan, sign in, add your car or key details. That’s it — no app needed."
      },
      {
        title: "Stay privately reachable",
        description: "Anyone who scans your QR can alert you. Your number stays hidden."
      }
    ]
  },
  useCases: {
    headline: "One QR. Two simple uses.",
    description: "AutoQr works for your car and for your keys, with the same privacy-first experience.",
    car: {
      title: "For your car",
      description: "Stick the QR on your windshield. If anyone damages it, they can alert you instantly.",
      bullets: [
        "Scan the QR on the windshield",
        "Upload damage photos securely",
        "Connect with the owner privately"
      ]
    },
    key: {
      title: "For your keys",
      description: "Clip the QR keychain on your keys. If you lose them, anyone can safely return them.",
      bullets: [
        "Scan the keychain QR",
        "Contact the owner anonymously",
        "Return keys safely, no address shared"
      ]
    }
  },
  workflow: {
    eyebrow: "The incident flow",
    headline: "How a scan becomes a safe call.",
    description: "Designed to be simple for the person scanning, and safe for you.",
    steps: [
      { title: "Scan the QR", description: "Opens a clean mobile page — no app required." },
      { title: "Upload photos", description: "Quick proof of the situation if needed." },
      { title: "Enter German number", description: "The reporter shares their number — not yours." },
      { title: "Click Connect", description: "A secure bridge is created behind the scenes." },
      { title: "Browser call starts", description: "Audio opens instantly in the browser." },
      { title: "You receive the call", description: "Ring directly on your registered device." }
    ]
  },
  privacy: {
    eyebrow: "Privacy-first",
    headline: "Your number stays private. Always.",
    description: "AutoQr is built around privacy, not around data collection.",
    pillars: [
      { title: "Number never exposed", description: "Your phone number is never visible to anyone who scans your QR." },
      { title: "Secure communication", description: "Encrypted, browser-based calls with no personal details exchanged." },
      { title: "Germany-focused", description: "Hosted and operated under strict German and EU privacy rules." },
      { title: "Data minimal by design", description: "We only store what’s needed for the incident — nothing more." }
    ]
  },
  pricing: {
    eyebrow: "Simple pricing",
    headline: "One price. Lifetime use.",
    description: "No subscriptions. No hidden fees. One QR, for as long as you need it.",
    price: "€29",
    priceCaption: "one-time",
    features: [
      "One premium QR (car or key)",
      "Lifetime use — no monthly fees",
      "Secure incident communication",
      "Activation & support included",
      "Shipping across Germany"
    ],
    cta: { label: "Order your QR", to: "/order" }
  },
  testimonials: {
    headline: "Trusted by careful drivers.",
    description: "What German drivers are saying about AutoQr.",
    items: [
      {
        quote: "Someone hit my car while parked. Within minutes they called me through AutoQr. No drama, no phone number on my dashboard.",
        author: "Lena K.",
        role: "Munich"
      },
      {
        quote: "I lost my keys on a train. A stranger scanned the QR and called me the same day. They returned them safely.",
        author: "Jonas B.",
        role: "Berlin"
      },
      {
        quote: "Exactly what I always wanted. A simple sticker that makes me reachable without putting my number out there.",
        author: "Maria S.",
        role: "Hamburg"
      }
    ]
  },
  faq: {
    eyebrow: "FAQ",
    headline: "Frequently asked questions.",
    description: "Everything you need to know before ordering.",
    items: [
      {
        question: "How does AutoQr work?",
        answer: "You order a QR sticker or keychain. Anyone who scans it can reach you securely through the browser — without ever seeing your phone number."
      },
      {
        question: "Is my number really private?",
        answer: "Yes. Your phone number is never visible to the person scanning. AutoQr creates a secure bridge for the call."
      },
      {
        question: "Can I use it for keys?",
        answer: "Yes. We offer both a windshield sticker for cars and a durable keychain for keys. Both work the same way."
      },
      {
        question: "Is there a subscription?",
        answer: "No. AutoQr is a one-time purchase. No monthly or annual fees."
      },
      {
        question: "How do I activate my QR?",
        answer: "Scan the code, create your account, and add your vehicle or key details. Activation takes less than a minute."
      },
      {
        question: "What happens if someone scans my QR?",
        answer: "They see a clean page where they can upload photos, enter their number, and connect to you through a secure call in the browser."
      }
    ]
  },
  cta: {
    headline: "Protect your car or keys today.",
    description: "Stay reachable. Stay private. Join thousands of Germans who chose AutoQr.",
    primaryCta: { label: "Get your QR", to: "/order" },
    secondaryCta: { label: "Talk to us", to: "/contact" }
  }
};

const germanMarketingContent: MarketingContent = {
  hero: {
    eyebrow: "Entwickelt für Deutschland",
    headline: "Schützen Sie Ihr Auto und Ihre Schlüssel",
    highlight: "mit einem smarten QR-Code.",
    description:
      "Wenn jemand Ihr geparktes Auto beschädigt oder Ihre verlorenen Schlüssel findet, kann man Sie privat erreichen – ohne Ihre Telefonnummer zu sehen.",
    primaryCta: { label: "QR-Code bestellen", to: "/order" },
    secondaryCta: { label: "So funktioniert es", to: "/how-it-works" },
    trustLine: "DSGVO-konform. Ihre Telefonnummer bleibt immer privat."
  },
  problem: {
    eyebrow: "Das Problem",
    headline: "Telefonnummern auf dem Armaturenbrett sind keine gute Idee.",
    description:
      "Bleiben Sie in wichtigen Momenten erreichbar, ohne persönliche Daten für Fremde sichtbar zu machen.",
    items: [
      {
        title: "Jemand beschädigt Ihr geparktes Auto",
        description: "Die Person fährt weiter, weil es keinen sicheren Weg gibt, Sie zu erreichen.",
        icon: "car"
      },
      {
        title: "Sie verlieren Ihre Schlüssel",
        description: "Niemand kann sie sicher zurückgeben, weil keine Kontaktmöglichkeit vorhanden ist.",
        icon: "key"
      },
      {
        title: "Ihre Nummer wird öffentlich",
        description: "Ein Zettel hinter der Scheibe macht Ihre Telefonnummer für jeden sichtbar.",
        icon: "eye"
      },
      {
        title: "Warnungen kommen zu spät",
        description: "Abschleppen, Strafzettel oder Licht angelassen – niemand kann Sie schnell informieren.",
        icon: "alert"
      }
    ]
  },
  solution: {
    eyebrow: "Die Lösung",
    headline: "AutoQr in drei einfachen Schritten.",
    description: "Für Menschen, die erreichbar bleiben und ihre Privatsphäre schützen möchten.",
    steps: [
      {
        title: "QR-Code bestellen",
        description: "Hochwertiger, wetterfester QR-Aufkleber oder Schlüsselanhänger für ganz Deutschland."
      },
      {
        title: "In einer Minute aktivieren",
        description: "Scannen, anmelden, Fahrzeug- oder Schlüsseldaten hinzufügen. Mehr ist nicht nötig."
      },
      {
        title: "Privat erreichbar bleiben",
        description: "Jede Person mit Scan kann Sie informieren. Ihre Nummer bleibt verborgen."
      }
    ]
  },
  useCases: {
    headline: "Ein QR-Code. Zwei einfache Einsatzzwecke.",
    description:
      "AutoQr funktioniert für Ihr Auto und Ihre Schlüssel – mit derselben datenschutzfreundlichen Erfahrung.",
    car: {
      title: "Für Ihr Auto",
      description:
        "Platzieren Sie den QR-Code an der Windschutzscheibe. Bei einem Schaden kann man Sie sofort informieren.",
      bullets: [
        "QR-Code an der Windschutzscheibe scannen",
        "Schadensfotos sicher hochladen",
        "Privat mit dem Fahrzeughalter verbinden"
      ]
    },
    key: {
      title: "Für Ihre Schlüssel",
      description:
        "Befestigen Sie den QR-Schlüsselanhänger an Ihrem Schlüsselbund. Finder können Sie sicher kontaktieren.",
      bullets: [
        "QR-Code am Schlüsselanhänger scannen",
        "Fahrzeughalter anonym kontaktieren",
        "Schlüssel sicher zurückgeben, ohne Adresse"
      ]
    }
  },
  workflow: {
    eyebrow: "Der Vorfallablauf",
    headline: "So wird aus einem Scan ein sicherer Anruf.",
    description: "Einfach für meldende Personen und sicher für Sie als Fahrzeughalter.",
    steps: [
      { title: "QR-Code scannen", description: "Öffnet eine saubere mobile Seite – keine App erforderlich." },
      { title: "Fotos hochladen", description: "Schneller Nachweis der Situation, wenn nötig." },
      { title: "Deutsche Nummer eingeben", description: "Die meldende Person teilt ihre Nummer – nicht Ihre." },
      { title: "Verbinden auswählen", description: "Im Hintergrund wird eine sichere Verbindung aufgebaut." },
      { title: "Browser-Anruf startet", description: "Audio beginnt direkt im Browser." },
      { title: "Sie erhalten den Anruf", description: "Klingelt direkt auf Ihrem registrierten Gerät." }
    ]
  },
  privacy: {
    eyebrow: "Datenschutz zuerst",
    headline: "Ihre Nummer bleibt privat. Immer.",
    description: "AutoQr ist auf Datenschutz ausgelegt – nicht auf Datensammlung.",
    pillars: [
      { title: "Nummer nie sichtbar", description: "Ihre Telefonnummer ist für Personen mit Scan niemals sichtbar." },
      { title: "Sichere Kommunikation", description: "Verschlüsselte Browser-Anrufe ohne Austausch persönlicher Daten." },
      { title: "Für Deutschland gedacht", description: "Betrieben unter strengen deutschen und EU-Datenschutzstandards." },
      { title: "Datenminimal", description: "Wir speichern nur, was für den Vorfall wirklich nötig ist." }
    ]
  },
  pricing: {
    eyebrow: "Einfache Preise",
    headline: "Ein Preis. Lebenslange Nutzung.",
    description: "Keine Abos. Keine versteckten Kosten. Ein QR-Code, so lange Sie ihn brauchen.",
    price: "29 €",
    priceCaption: "einmalig",
    features: [
      "Ein Premium-QR-Code für Auto oder Schlüssel",
      "Lebenslange Nutzung ohne Monatsgebühren",
      "Sichere Vorfall-Kommunikation",
      "Aktivierung und Support inklusive",
      "Versand innerhalb Deutschlands"
    ],
    cta: { label: "QR-Code bestellen", to: "/order" }
  },
  testimonials: {
    headline: "Vertrauen von sorgfältigen Fahrern.",
    description: "Was deutsche Autofahrer über AutoQr sagen.",
    items: [
      {
        quote:
          "Jemand hat mein Auto im Parkhaus beschädigt. Innerhalb weniger Minuten kam der Anruf über AutoQr. Keine Telefonnummer hinter der Scheibe.",
        author: "Lena K.",
        role: "München"
      },
      {
        quote:
          "Ich habe meine Schlüssel im Zug verloren. Eine fremde Person hat den QR-Code gescannt und mich noch am selben Tag erreicht.",
        author: "Jonas B.",
        role: "Berlin"
      },
      {
        quote:
          "Genau so etwas habe ich gesucht: ein einfacher Sticker, der mich erreichbar macht, ohne meine Nummer öffentlich zu machen.",
        author: "Maria S.",
        role: "Hamburg"
      }
    ]
  },
  faq: {
    eyebrow: "FAQ",
    headline: "Häufig gestellte Fragen.",
    description: "Alles Wichtige vor Ihrer Bestellung.",
    items: [
      {
        question: "Wie funktioniert AutoQr?",
        answer:
          "Sie bestellen einen QR-Aufkleber oder Schlüsselanhänger. Wer ihn scannt, kann Sie sicher im Browser erreichen, ohne Ihre Telefonnummer zu sehen."
      },
      {
        question: "Bleibt meine Nummer wirklich privat?",
        answer:
          "Ja. Ihre Telefonnummer ist für die meldende Person nicht sichtbar. AutoQr stellt eine sichere Verbindung her."
      },
      {
        question: "Kann ich AutoQr auch für Schlüssel nutzen?",
        answer:
          "Ja. Es gibt einen Aufkleber für Autos und einen robusten Schlüsselanhänger für Schlüssel. Beide funktionieren gleich."
      },
      {
        question: "Gibt es ein Abonnement?",
        answer: "Nein. AutoQr ist ein einmaliger Kauf. Es gibt keine monatlichen oder jährlichen Gebühren."
      },
      {
        question: "Wie aktiviere ich meinen QR-Code?",
        answer:
          "Scannen Sie den Code, erstellen Sie Ihr Konto und ergänzen Sie Fahrzeug- oder Schlüsseldaten. Die Aktivierung dauert weniger als eine Minute."
      },
      {
        question: "Was passiert, wenn jemand meinen QR-Code scannt?",
        answer:
          "Die Person sieht eine klare Seite zum Hochladen von Fotos, Eingeben der Nummer und zum sicheren Verbindungsaufbau im Browser."
      }
    ]
  },
  cta: {
    headline: "Schützen Sie Ihr Auto oder Ihre Schlüssel noch heute.",
    description: "Bleiben Sie erreichbar. Bleiben Sie privat. Entscheiden Sie sich für AutoQr.",
    primaryCta: { label: "QR-Code sichern", to: "/order" },
    secondaryCta: { label: "Kontakt aufnehmen", to: "/contact" }
  }
};

export const defaultMarketingContentByLocale = {
  de: germanMarketingContent,
  en: englishMarketingContent
} as const;

export const defaultMarketingContent: MarketingContent = defaultMarketingContentByLocale.de;
