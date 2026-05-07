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

export type UseCaseFeature = {
  title: string;
  description: string;
};

export type UseCaseSide = {
  title: string;
  /** Short label next to the icon, e.g. KFZ-Sicherheit */
  tagline?: string;
  description: string;
  features?: UseCaseFeature[];
  /** Legacy CMS payloads */
  bullets?: string[];
};

export type UseCaseContent = {
  headline: string;
  description: string;
  car: UseCaseSide;
  key: UseCaseSide;
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
        title: "Your phone number is exposed",
        description: "A note on your dashboard makes your number visible to anyone passing by.",
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
    headline: "One QR for parking damage and lost keys.",
    description: "AutoQr works for your car and for your keys, with the same privacy-first experience.",
    car: {
      title: "Your car",
      tagline: "Vehicle protection",
      description:
        "Put the QR on your windshield — stay reachable for parking scrapes, blocked access, and everyday situations without exposing your phone number.",
      features: [
        {
          title: "Minor damage & parking scrapes",
          description:
            "Clear, low-friction contact after small bumps or parking damage, so things get sorted without needless stress."
        },
        {
          title: "Avoid unnecessary towing",
          description:
            "Get notified promptly if your vehicle is in the way — before someone calls a tow truck and you face a heavy bill."
        },
        {
          title: "Window open or lights on",
          description:
            "Passers-by can send a friendly heads-up when a window is still down or lights are draining the battery."
        },
        {
          title: "Blocked driveways & private contact",
          description:
            "People can reach you anonymously and safely when a driveway or access is blocked — without trading private numbers."
        },
        {
          title: "Private parking areas",
          description:
            "Sort parking disputes on residential or company lots politely and quickly with a short message instead of a confrontation."
        }
      ]
    },
    key: {
      title: "Your keys",
      tagline: "Key protection",
      description:
        "Use the QR keychain so finders can reach you privately — keys come back faster and your locks and master-key systems stay safer.",
      features: [
        {
          title: "Spare your building’s lock system",
          description:
            "Avoid the huge cost of replacing an entire access or lock system across a building after losing one key."
        },
        {
          title: "Anonymous return, real privacy",
          description:
            "Get your keys back without the finder learning your home address or identity — stronger security where you live."
        },
        {
          title: "Fewer locksmith emergencies",
          description:
            "Reduce expensive emergency call-outs when an honest finder gets your keys back to you quickly via the QR."
        },
        {
          title: "Protection for workplace master keys",
          description:
            "Especially for businesses: limit the damage if a valuable central or master key goes missing."
        },
        {
          title: "Instant find alerts & peace of mind",
          description:
            "Hear as soon as your keys are reported found — less time worrying while they are gone."
        }
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
    eyebrow: "",
    headline: "Frequently asked questions (FAQ)",
    description: "Short answers before you order.",
    items: [
      {
        question: "How does AutoQr work?",
        answer:
          "It's that simple! You order a QR sticker or keychain. When someone scans it, they can reach you securely through the browser – without ever seeing your number."
      },
      {
        question: "Is my number really private?",
        answer:
          "Yes. Your phone number is never visible to third parties at any time. The connection runs exclusively through our encrypted bridge to protect your privacy."
      },
      {
        question: "Can I use it for my keys too?",
        answer:
          "Absolutely! The keychain works just like the sticker – discreet, secure, and with no app to install."
      },
      {
        question: "Is there a subscription?",
        answer:
          "No. You pay a one-time €29 and use AutoQr with no further costs, for as long as you like. There are no hidden monthly fees."
      },
      {
        question: "What happens when someone scans my QR code?",
        answer:
          'A mobile page opens right away. They can upload photos, enter their message or number, and tap "Connect" – your device then rings immediately.'
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
    headline: "Ein QR-Code für Parkschäden und verlorene Schlüssel.",
    description:
      "AutoQr funktioniert für Ihr Auto und Ihre Schlüssel – mit derselben datenschutzfreundlichen Erfahrung.",
    car: {
      title: "Auto",
      tagline: "KFZ-Sicherheit",
      description:
        "QR-Code an der Windschutzscheibe – bleiben Sie für Parkrempler, Zuparker und Alltagsrisiken erreichbar, ohne Ihre Nummer preiszugeben.",
      features: [
        {
          title: "Bagatellschäden & Parkrempler",
          description:
            "Schnelle und unkomplizierte Kommunikation bei kleinen Unfällen oder Parkschäden, um unnötigen Stress zu vermeiden."
        },
        {
          title: "Abschleppkosten vermeiden",
          description:
            "Verhindern Sie teure Abschleppgebühren, indem Sie sofort benachrichtigt werden, falls Ihr Fahrzeug jemanden behindert."
        },
        {
          title: "Offenes Fenster oder Licht an",
          description:
            "Erhalten Sie einen freundlichen Hinweis von Passanten, wenn Ihr Fenster noch offen ist oder das Licht brennt."
        },
        {
          title: "Zugeparkte Einfahrten & Anonymer Anruf",
          description:
            "Kontaktieren Sie den Fahrzeughalter anonym und sicher, falls eine Einfahrt blockiert ist, ohne private Nummern preiszugeben."
        },
        {
          title: "Privatparkplatz-Management",
          description:
            "Lösen Sie Parkplatzkonflikte auf privaten Flächen direkt und höflich durch eine schnelle Nachricht."
        }
      ]
    },
    key: {
      title: "Schlüssel",
      tagline: "Schlüssel-Schutz",
      description:
        "QR-Schlüsselanhänger – Finder erreichen Sie privat, Schlüssel kommen schneller zurück und Ihre Schließanlage bleibt geschützt.",
      features: [
        {
          title: "Schutz vor Austausch der Schließanlage",
          description:
            "Vermeiden Sie die enormen Kosten für den Austausch der gesamten Schließanlage eines Gebäudes bei Schlüsselverlust."
        },
        {
          title: "Anonyme Rückgabe & Privatsphäre",
          description:
            "Finden Sie Ihren Schlüssel zurück, ohne dass der Finder Ihre Adresse oder Identität erfährt – maximale Sicherheit für Ihr Zuhause."
        },
        {
          title: "Hohe Schlüsseldienst-Kosten vermeiden",
          description:
            "Sparen Sie sich teure Notdienste, wenn Ihr verlorener Schlüssel dank des QR-Codes schnell wieder bei Ihnen landet."
        },
        {
          title: "Schutz für gewerbliche Zentralschlüssel",
          description:
            "Besonders wichtig für Firmen: Schützen Sie wertvolle Zentralschlüssel vor einem kostspieligen Totalverlust."
        },
        {
          title: "Sofortige Benachrichtigung & Seelenfrieden",
          description:
            "Erhalten Sie in Echtzeit eine Nachricht, sobald Ihr Schlüssel gefunden wurde, und genießen Sie absolute Sorgenfreiheit."
        }
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
    eyebrow: "",
    headline: "Häufig gestellte Fragen (FAQ)",
    description: "Alles Wichtige vor Ihrer Bestellung.",
    items: [
      {
        question: "Wie funktioniert autoqr?",
        answer:
          "Es ist ganz einfach! Sie bestellen einen QR-Aufkleber oder Schlüsselanhänger. Wenn jemand diesen scannt, kann er Sie sicher über den Browser erreichen – ganz ohne Ihre Nummer zu sehen."
      },
      {
        question: "Ist meine Nummer wirklich privat?",
        answer:
          "Ja. Ihre Telefonnummer ist zu keinem Zeitpunkt für Dritte sichtbar. Die Verbindung läuft ausschließlich über unsere verschlüsselte Brücke, um Ihre Privatsphäre zu schützen."
      },
      {
        question: "Kann ich es auch für Schlüssel nutzen?",
        answer:
          "Selbstverständlich! Der Schlüsselanhänger funktioniert genauso wie der Aufkleber – diskret, sicher und ohne dass eine App installiert werden muss."
      },
      {
        question: "Gibt es ein Abonnement?",
        answer:
          "Nein. Sie zahlen einmalig 29 € und nutzen autoqr ohne weitere Kosten, so lange Sie möchten. Es gibt keine versteckten monatlichen Gebühren."
      },
      {
        question: "Was passiert, wenn jemand meinen QR-Code scannt?",
        answer:
          "Eine mobile Seite öffnet sich sofort. Die Person kann Fotos hochladen, ihre Nachricht oder Nummer eingeben und auf „Verbinden“ klicken – Ihr Gerät klingelt dann direkt."
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
