import { de, type TranslationSchema } from "./de.js";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const deepMerge = <T extends Record<string, unknown>>(base: T, override: DeepPartial<T>): T => {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    if (Array.isArray(value)) {
      merged[key] = value;
    } else if (isPlainObject(current) && isPlainObject(value)) {
      merged[key] = deepMerge(current, value);
    } else if (value !== undefined) {
      merged[key] = value;
    }
  }
  return merged as T;
};

const overrides: DeepPartial<TranslationSchema> = {
  meta: {
    siteName: "AutoQr",
    siteTagline: "Secure QR system for your vehicle",
    defaultTitle: "AutoQr – Secure QR contact for your vehicle",
    defaultDescription:
      "AutoQr is the secure QR-based contact system for vehicle owners in Germany. Reachable in an emergency – without exposing your phone number."
  },
  common: {
    brand: "AutoQr",
    loading: "Loading...",
    loadingWorkspace: "Loading workspace...",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    confirm: "Confirm",
    continue: "Continue",
    back: "Back",
    next: "Next",
    submit: "Submit",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    search: "Search",
    yes: "Yes",
    no: "No",
    ok: "OK",
    retry: "Retry",
    required: "Required",
    optional: "Optional",
    selectLanguage: "Select language",
    language: "Language",
    learnMore: "Learn more",
    getStarted: "Get started",
    orderNow: "Order now",
    contactUs: "Contact us",
    viewAll: "View all",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    email: "Email address",
    password: "Password",
    name: "Name",
    fullName: "Full name",
    phone: "Phone number",
    address: "Address",
    message: "Message",
    subject: "Subject",
    status: "Status",
    date: "Date",
    actions: "Actions",
    details: "Details",
    noData: "No data available",
    errorGeneric: "Something went wrong. Please try again.",
    successGeneric: "Successfully saved.",
    copied: "Copied",
    copy: "Copy",
    upload: "Upload",
    uploadImages: "Upload images",
    download: "Download",
    saved: "Saved",
    saveFailed: "Save failed",
    add: "Add",
    remove: "Remove",
    apply: "Apply",
    preview: "Preview",
    print: "Print",
    view: "View"
  },
  status: {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    missed: "Missed",
    declined: "Declined",
    accepted: "Accepted",
    dispatched: "Dispatched",
    delivered: "Delivered",
    activated: "Activated",
    deactivated: "Deactivated",
    disabled: "Disabled",
    cancelled: "Cancelled",
    paid: "Paid",
    refunded: "Refunded",
    draft: "Draft",
    open: "Open",
    inReview: "In review",
    resolved: "Resolved",
    escalated: "Escalated",
    flagged: "Flagged",
    ringing: "Ringing",
    connected: "Connected",
    ended: "Ended",
    rejected: "Rejected",
    created: "Created",
    fulfillmentInProgress: "In progress",
    shipped: "Shipped",
    printed: "Printed",
    packed: "Packed",
    readyToShip: "Ready to ship",
    archived: "Archived",
    queued: "Queued",
    sent: "Sent",
    skipped: "Skipped",
    all: "All statuses",
    success: "Successful",
    lost: "Lost",
    inStock: "In stock",
    assignedToOrder: "Assigned to order"
  },
  nav: {
    howItWorks: "How it works",
    forCarOwners: "For car owners",
    pricing: "Pricing",
    faq: "FAQ",
    contact: "Contact",
    signIn: "Sign in",
    orderQr: "Order your QR",
    about: "About",
    useCases: "Use cases",
    partner: "Partner",
    help: "Help"
  },
  footer: {
    tagline: "Discreet contact with vehicle owners – without exposing personal data.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    support: "Support",
    rights: "All rights reserved.",
    designedByPrefix: "Designed & Developed By",
    madeIn: "Made in Germany",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    refund: "Refund Policy",
    shipping: "Shipping Policy",
    imprint: "Imprint",
    newsletterLabel: "Stay up to date",
    newsletterDesc: "News and tips for your vehicle.",
    subscribe: "Subscribe"
  },
  home: {
    hero: {
      eyebrow: "Secure QR contact for your vehicle",
      title: "Reachable in an emergency – without exposing your number.",
      subtitle:
        "AutoQr is the discreet QR code for your vehicle. Drivers can reach you directly – your phone number stays private.",
      ctaPrimary: "Order QR code",
      ctaSecondary: "How it works",
      trustSignal: "Trusted by thousands of drivers in Germany."
    },
    benefits: {
      title: "Why AutoQr?",
      subtitle: "Protection, privacy and peace of mind – in one small QR code.",
      items: [
        {
          title: "Privacy guaranteed",
          description: "Your phone number always stays private. Anonymous call routing only."
        },
        {
          title: "Instant contact",
          description:
            "Wrong parking, headlights left on or an accident – reachable immediately."
        },
        {
          title: "Made in Germany",
          description: "GDPR-compliant, developed and hosted in Germany."
        },
        {
          title: "Simple activation",
          description: "Place the sticker, activate the code – ready in 2 minutes."
        }
      ]
    },
    howItWorks: {
      title: "How AutoQr works",
      subtitle: "Three simple steps – ready for life.",
      steps: [
        {
          title: "Order QR code",
          description: "Choose your plan and get the sticker delivered to your door."
        },
        {
          title: "Activate and attach",
          description: "Activate your code online and stick it to your vehicle."
        },
        {
          title: "Securely connected",
          description: "Drivers scan the code and reach you – without seeing your number."
        }
      ]
    },
    trust: {
      title: "Trusted by drivers across Germany",
      dsgvo: "GDPR compliant",
      support: "24/7 support",
      privacy: "Phone number stays private"
    },
    cta: {
      title: "Ready for extra safety?",
      subtitle: "Protect your vehicle in under 2 minutes.",
      button: "Order your QR code"
    },
    useCases: {
      title: "When AutoQr helps",
      subtitle: "Typical situations where the QR code makes life easier.",
      items: [
        { title: "Wrongly parked", description: "When your car blocks the way." },
        { title: "Lights left on", description: "When the headlights are still on." },
        { title: "Accident or damage", description: "Safe, direct contact after an incident." },
        { title: "Flat tyre", description: "Someone notices damage to your vehicle." }
      ]
    },
    faq: {
      title: "Frequently asked questions (FAQ)",
      subtitle: "Answers to the most common questions about AutoQr.",
      viewAll: "View all FAQ"
    },
    heroVisual: {
      active: "Active",
      secureCallBridge: "Secure call bridge",
      bridgeFlow: "Scan → private bridge → vehicle owner",
      worksFor: "Works for",
      carsAndKeys: "Cars & keys",
      fallbackTrustLine: "GDPR-compliant. Your phone number is never shown."
    },
    privacyBadge: "GDPR · Hosted in Germany",
    pricingBadge: "One-time purchase",
    planGrid: {
      eyebrow: "Plans & pricing",
      title: "Choose the protection that fits.",
      subtitle: "One-time prices in EUR. The same privacy core — different tag bundles, contact limits, and support levels.",
      loading: "Loading plans…",
      empty:
        "No plans are available yet. Restart the API (it syncs the catalog on startup) or run: npm run seed:plans -w @autoqr/api",
      error: "We couldn't load plans. Please try again in a moment.",
      compareDetails: "Compare details",
      choose: "Choose {{name}}",
      oneTime: "One-time payment",
      billedYearly: "Billed yearly",
      tagsIncluded: "{{count}} tags included",
      mostPopular: "Most popular",
      fleetSales: "Need more than Fleet Pro?",
      fleetSalesLink: "Talk to sales"
    },
    planTier: {
      car_basic: "Car-Basic",
      smart_key: "Smart-Key",
      premium_combo: "Premium-Combo",
      fleet_pro: "Fleet-Pro"
    }
  },
  howItWorksPageExtra: {
    eyebrow: "How it works",
    heroTitle1: "From ordering to a secure call,",
    heroTitleBrand: "seamlessly.",
    heroSubtitle:
      "Every AutoQr is shipped, activated and monitored with the same care – whether for your car or your keys.",
    ctaOrder: "Order QR",
    ctaPricing: "See pricing"
  },
  useCasesPageExtra: {
    eyebrow: "Cars & keys",
    heroTitle1: "One QR for",
    heroTitleBrand: "parking damage and lost keys.",
    heroSubtitle:
      "AutoQr is made for the everyday moments that matter – a dent, a scratch, a lost keychain. Here's how it works for both."
  },
  faqPageExtra: {
    eyebrow: "Frequently asked",
    heroTitle1: "Everything you need to know,",
    heroTitleBrand: "before you order.",
    heroSubtitle:
      "If your question isn't answered below, contact us. We reply within one business day – always from a real human."
  },
  pricingPageExtra: {
    eyebrow: "Pricing",
    heroTitle1: "One price.",
    heroTitleBrand: "Lifetime use.",
    heroSubtitle:
      "We don't like recurring fees for things you don't need. You pay once – your AutoQr keeps working."
  },
  forCarOwnersPageExtra: {
    eyebrow: "For vehicle owners",
    heroTitle1: "Your car, your privacy.",
    heroTitleBrand: "Reachable all the same.",
    heroSubtitle:
      "Leave the worries about notes under the windscreen behind. Every incident – a dent, a blocked driveway, a witness call – lands in a private, traceable channel.",
    ctaOrder: "Order for my car",
    ctaFlow: "See the flow",
    points: [
      {
        title: "Your number is never on the windscreen.",
        body: "The QR code is just a signed identifier. No phone number means no unwanted calls, no spam, no risk."
      },
      {
        title: "Reachable in under two minutes.",
        body: "A scan lands on your device – with full context and photo evidence."
      },
      {
        title: "You decide when to take the call.",
        body: "Answer a secure browser call immediately or reply later. Either way, the incident stays logged."
      }
    ],
    featureTitle: "One QR code per vehicle. Registered, activated, private.",
    featureBody:
      "Enter your vehicle details, pay once and we'll deliver a high-quality QR code to your home. Activation is tied to your account – the QR only goes live when you confirm it.",
    ctaOrderShort: "Order QR",
    ctaPricingShort: "See pricing"
  },
  partnerPageExtra: {
    eyebrow: "Partners & resellers",
    heroTitle: "Distribute AutoQr at scale.",
    heroSubtitle:
      "Fleet operators, insurers and mobility resellers – get preferential pricing, co-branded QRs, and bulk activation tools.",
    benefitsTitle: "What partners get",
    benefits: [
      "Dedicated QR batches, optionally co-branded.",
      "Bulk activation portal and fleet dashboard.",
      "Priority support with SLAs and a dedicated contact.",
      "Revenue share for resellers with transparent reporting."
    ],
    thanksTitle: "Thanks – we'll be in touch.",
    thanksBody: "Our partner team replies within one business day.",
    formTitle: "Request partner access",
    companyLabel: "Company",
    nameLabel: "Your name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    volumeLabel: "Expected volume",
    volumePlaceholder: "e.g. 500 QR codes / quarter",
    notesLabel: "Use case / notes",
    submit: "Send partner request"
  },
  helpCenterExtra: {
    eyebrow: "Help center",
    heroTitle: "Guides, answers, support.",
    heroSubtitle: "Everything you need to use AutoQr confidently.",
    sections: [
      {
        title: "Getting started",
        items: [
          { title: "Ordering your first QR code" },
          { title: "Activating your QR code" },
          { title: "Adding a car or keys" }
        ]
      },
      {
        title: "Privacy & calls",
        items: [
          { title: "How the private call works" },
          { title: "What happens on scan" },
          { title: "Privacy policy" }
        ]
      },
      {
        title: "Account & billing",
        items: [
          { title: "Managing QR codes" },
          { title: "Shipping address" },
          { title: "Contact support" }
        ]
      }
    ],
    supportTitle: "Still need help?",
    supportHours: "Our support team is available Mon–Sat, 09:00–18:00 CET.",
    contactSupport: "Contact support"
  },
  contactExtra: {
    eyebrow: "Get in touch",
    heroTitle1: "A real team,",
    heroTitleBrand: "on the other end.",
    heroSubtitle:
      "Support is currently available via live chat and email only. Phone/call support is not available at the moment.",
    channels: [
      {
        label: "General",
        value: "support@autoqr.de",
        hint: "Product questions, orders, account help"
      },
      {
        label: "Trust & safety",
        value: "safety@autoqr.de",
        hint: "Abuse reports, deletion requests, policies"
      },
      {
        label: "Live chat support",
        value: "Mon–Fri · 09:00–18:00 CET",
        hint: "Most chat requests are answered within 4 hours"
      }
    ],
    activeIncident: "Active incident?",
    incidentTitle: "Don't email us. Scan the QR code.",
    incidentBody:
      "The fastest way to reach a vehicle owner is via the AutoQr sticker or keychain. Enter details and request a private call – we log everything securely.",
    ctaFlow: "See the flow",
    ctaOrder: "Order QR"
  },
  about: {
    title: "About AutoQr",
    subtitle: "We make Germany's roads a little safer – without compromise on privacy.",
    missionTitle: "Our mission",
    missionBody:
      "We believe every vehicle owner should be reachable without sacrificing their privacy. AutoQr creates a safe channel between vehicle owners and other road users.",
    valuesTitle: "Our values",
    values: [
      { title: "Privacy first", description: "Your personal data belongs to you." },
      { title: "Made in Germany", description: "Built and hosted in Germany." },
      { title: "Simple and effective", description: "One QR code that works when it matters." }
    ]
  },
  contact: {
    title: "Contact",
    subtitle: "We are happy to help – personally, quickly and in German.",
    formTitle: "Send us a message",
    namePlaceholder: "Your name",
    emailPlaceholder: "Your email address",
    subjectPlaceholder: "Subject",
    messagePlaceholder: "Your message",
    send: "Send message",
    sending: "Sending...",
    success: "Message sent successfully. We will reply shortly.",
    error: "Message could not be sent. Please try again.",
    infoTitle: "How to reach us",
    emailLabel: "Email",
    phoneLabel: "Phone",
    hoursLabel: "Business hours",
    hoursValue: "Mon. – Fri. 09:00 – 18:00"
  },
  faqPage: {
    title: "Frequently asked questions (FAQ)",
    subtitle: "Everything you need to know about AutoQr.",
    categories: {
      general: "General",
      privacy: "Privacy",
      product: "Product",
      billing: "Billing & subscription",
      shipping: "Shipping"
    }
  },
  howItWorksPage: {
    title: "How AutoQr works",
    subtitle: "Safely and privately on the road in three simple steps.",
    section1: {
      title: "1. Order QR code",
      body: "Choose the plan that suits your vehicle and have the weatherproof sticker delivered to your home."
    },
    section2: {
      title: "2. Activate code",
      body: "Scan the code, register with your phone number and link your vehicle."
    },
    section3: {
      title: "3. Ready to go",
      body: "Other road users scan your code in emergencies. You are notified immediately – without your number being shared."
    }
  },
  pricing: {
    title: "Plans and pricing",
    subtitle: "Transparent packages for every vehicle.",
    perYear: "per year",
    perMonth: "per month",
    oneTime: "one-time",
    mostPopular: "Most popular",
    choosePlan: "Choose plan",
    compareFeatures: "Compare features",
    includedFeatures: "Included features",
    vatIncluded: "VAT included"
  },
  forCarOwners: {
    title: "For car owners",
    subtitle: "How AutoQr protects your car – day and night.",
    benefitsTitle: "Your benefits"
  },
  useCasesPage: {
    title: "Use cases",
    subtitle: "When AutoQr really helps."
  },
  partnerPage: {
    title: "Become a partner",
    subtitle: "Work together with AutoQr.",
    ctaLabel: "Apply as a partner"
  },
  helpCenter: {
    title: "Help center",
    subtitle: "Find answers to your questions.",
    searchPlaceholder: "Search help..."
  },
  legal: {
    privacy: {
      title: "Privacy Policy",
      subtitle: "How AutoQr protects your data."
    },
    terms: {
      title: "Terms & Conditions",
      subtitle: "The rules for using AutoQr."
    },
    refund: {
      title: "Refund Policy",
      subtitle: "How we handle refunds."
    },
    shipping: {
      title: "Shipping Policy",
      subtitle: "Everything about shipping and delivery."
    },
    lastUpdated: "Last updated",
    backHome: "Back to home"
  },
  auth: {
    loginTitle: "Sign in",
    loginSubtitle: "Welcome back to AutoQr.",
    loginEyebrow: "Sign in",
    loginHeadline: "Welcome back.",
    loginIntro: "Sign in with your mobile number. We’ll send you a one-time code.",
    modeOtp: "Mobile OTP",
    modePassword: "Email + password",
    nameLabel: "Name",
    emailLabel: "Email address",
    passwordLabel: "Password",
    oneTimeCodeLabel: "One-time code",
    oneTimeCodePlaceholder: "6-digit code",
    devCodePrefix: "Dev code:",
    verifying: "Verifying…",
    verifyAndSignIn: "Verify & sign in",
    useDifferentNumber: "Use a different number",
    mobileNumberLabel: "Mobile number",
    mobileNumberPlaceholder: "+49 176 ...",
    sendingCode: "Sending code…",
    sendMeCode: "Send me a code",
    resendCode: "Resend code",
    resendIn: "Resend in {{seconds}}s",
    emailPlaceholder: "you@company.com",
    passwordPlaceholder: "••••••••",
    newToAutoqr: "New to AutoQr?",
    createAccountLink: "Create an account",
    registerEyebrow: "Create account",
    registerHeadline: "Set up your AutoQr.",
    registerIntro: "We’ll verify your mobile with a one-time code. No password needed — your number is your identity.",
    shippingAddressLabel: "Shipping address",
    sendVerificationCode: "Send verification code",
    termsAgreementNotice: "By continuing you agree to our terms and privacy policy.",
    verifyAndCreateAccount: "Verify & create account",
    editDetails: "Edit details",
    alreadyRegistered: "Already registered?",
    errorCouldNotSendCode: "Could not send code. Check your phone number.",
    errorCouldNotSendCodeGeneric: "Could not send a code.",
    errorInvalidCode: "Invalid code.",
    errorInvalidCredentials: "Invalid credentials. Please try again.",
    errorVerificationFailed: "Verification failed.",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    createAccount: "Create account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    rememberMe: "Keep me signed in",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    invalidCredentials: "Email or password is incorrect.",
    registrationSuccess: "Account created successfully.",
    acceptTerms: "I accept the Terms & Conditions and the Privacy Policy.",
    acceptTermsRequired: "Please accept the terms to continue."
  },
  validation: {
    required: "This field is required.",
    emailInvalid: "Please enter a valid email address.",
    emailRequired: "Email address is required.",
    passwordRequired: "Password is required.",
    passwordTooShort: "Password must be at least 8 characters.",
    phoneInvalid: "Please enter a valid German phone number.",
    phoneRequired: "Phone number is required.",
    plateRequired: "Number plate is required.",
    plateInvalid: "Please enter a valid German number plate.",
    activationCodeRequired: "Activation code is required.",
    activationCodeInvalid: "Activation code is invalid.",
    nameRequired: "Name is required.",
    addressRequired: "Address is required.",
    messageRequired: "Message is required.",
    messageTooShort: "Message is too short.",
    consentRequired: "Consent is required.",
    imagesRequired: "Please upload at least one image.",
    reasonRequired: "Please choose a reason."
  },
  incident: {
    title: "Report vehicle",
    subtitle: "Report an incident to the vehicle owner – safely and anonymously.",
    reasonLabel: "Reason",
    reasonPlaceholder: "Please choose a reason",
    reasons: {
      wrongParking: "Wrongly parked car",
      headlightsOn: "Headlights left on",
      flatTyre: "Flat tyre",
      towing: "Car being towed",
      doorOrWindowOpen: "Door or window left open",
      carDamaged: "Car damaged",
      accident: "Accident / emergency",
      other: "Other"
    },
    reporterNameLabel: "Your name (optional)",
    reporterPhoneLabel: "Your phone number",
    reporterPhoneHelp: "The owner will call you back securely through AutoQr.",
    messageLabel: "Message",
    messagePlaceholder: "Briefly describe what happened...",
    imagesLabel: "Images (optional)",
    imagesHelp: "Images help the owner understand the situation.",
    consentLabel: "I agree that my phone number may be used to be contacted.",
    submit: "Report incident",
    submitting: "Sending...",
    successTitle: "Report submitted",
    successBody: "The vehicle owner has been notified and will contact you shortly.",
    errorInvalidToken: "This QR code is no longer valid.",
    errorGeneric: "Report could not be sent.",
    eyebrow: "Report an incident",
    secureContactBadge: "Secure contact",
    pageHeadline: "Help the owner — safely and privately.",
    pageIntro:
      "This QR belongs to a registered AutoQr owner. Share clear details and — if needed — connect directly via a private browser call. Your number stays hidden until they answer.",
    reportingAbout: "Reporting about",
    reporterNamePlaceholder: "Leave blank to stay anonymous",
    germanPhoneRequired: "German phone number *",
    whatHappenedLabel: "What happened? *",
    incidentMessagePlaceholder: "Describe the incident — location, time, anything urgent.",
    incidentPhotosLabel: "Incident photos (optional)",
    consentLong:
      "I confirm this report is truthful. I consent to AutoQr sharing it with the owner and — if I start a call — to a brief live audio connection. My phone number stays masked.",
    connecting: "Connecting…",
    connectToOwner: "Connect to Owner",
    whatHappensNext: "What happens next?",
    whatHappensNextBody:
      "When you click {{action}}, we open a secure call window, ask your browser for microphone access, and ring the owner’s device in real time.",
    loadingSecureChannel: "Loading secure incident channel…",
    errorInvalidPhone: "Please enter a valid German phone number.",
    errorMessageTooShort: "Please describe briefly what happened (at least 5 characters).",
    errorConsentRequired: "Please accept the privacy consent to continue.",
    errorSubmitGeneric: "Could not submit incident. Please check your details and try again.",
    fetchingLocation: "Fetching your location...",
    locationDeniedLong:
      "Location access is required to report an incident. Please enable GPS to continue.",
    refreshLocation: "Refresh location",
    locationMapTitle: "Reported location preview",
    locationApproximateTitle: "Approximate (IP-based) location",
    locationApproximateBody:
      "We could not read GPS from this device. Your report will use an approximate location from the network connection when you submit.",
    locationLowAccuracy: "Low accuracy",
    locationConfirmationLabel: "This location looks correct — use it for my report.",
    locationConfirmRequired: "Please confirm the location before submitting.",
    offlineQueued: "You're offline — we saved your report and will send it when you're back online.",
    locationRequiredHint: "Location is required to send a report. When you submit, we will ask your browser for GPS access.",
    locationSectionTitle: "Location"
  },
  orderPage: {
    eyebrow: "Order AutoQr",
    titlePart1: "Three steps to a QR that",
    titleHighlight: "protects without exposing.",
    subtitle:
      "A single purchase. A single piece of infrastructure. A lifetime of privacy-first incident handling.",
    startRegistration: "Start registration",
    seeFullProcess: "See the full process",
    steps: [
      {
        title: "Create your account & pay",
        body: "Name, email, shipping address, contact number, then a single payment. Your order is matched to a QR from our pre-printed inventory."
      },
      {
        title: "Your pre-printed QR ships",
        body: "We dispatch a QR sticker or keychain from stock — already printed, serialized, and packaged with your one-time activation code."
      },
      {
        title: "Activate and bind it to your car or key",
        body: "After delivery, sign in, enter the activation code on your QR, and add your details. That permanently binds the QR to your account."
      }
    ],
    included: [
      "Weather-grade printed QR",
      "Lifetime secure call bridge",
      "Signed audit log of every scan",
      "Owner dashboard with incidents & calls"
    ],
    whatYouGet: "What you get",
    priceCaption: "one-time",
    beginOrder: "Begin order",
    priceFooter: "Pre-printed from inventory and shipped with a one-time activation code."
  },
  scan: {
    title: "Scan the QR code",
    subtitle: "Report an incident to the vehicle owner safely and anonymously.",
    cta: "Report incident",
    tagNotFoundTitle: "Car tag not found",
    tagNotFoundMessage: "We couldn't find this car tag.",
    notActiveTitle: "This car tag is not active yet",
    notActiveMessage:
      "The car owner hasn't activated this tag yet. Please try again later or contact AutoQR support.",
    loading: "Loading…",
    privacyBridge: "AutoQR · Car owner privacy bridge",
    landingTitleFallback: "This car",
    landingTitleSuffix: "needs a heads-up.",
    landingSubtitle:
      "The car owner's number is never shown. Pick a reason and we'll alert them instantly.",
    carDetails: {
      make: "Make",
      model: "Model",
      color: "Colour",
      plate: "Plate"
    },
    whyLabel: "Why are you reaching out about this car?",
    yourNameOptional: "Your name (optional)",
    yourPhoneLabel: "Your phone (needed for a private call with the car owner)",
    privateNoteLabel: "Private note (optional)",
    privateNotePlaceholder:
      "Example: Your car is blocking my driveway near the main entrance.",
    consentLabel:
      "I understand this alert will be shared with the car owner. My phone number will be masked if I request a call.",
    alertOwner: "Alert the car owner",
    sending: "Sending…",
    requestMaskedCall: "Request masked call",
    phoneRequiredForCall:
      "Please enter your phone number first so we can set up a masked call with the car owner.",
    couldNotStartCall: "Could not start the call.",
    couldNotSendAlert: "Could not send the alert.",
    emergencyContactsNotified: "Emergency contacts have also been notified.",
    thankYouResponseSoon: "Thanks for caring — the car owner will respond as soon as possible.",
    connectPrivateCall: "Connect a private call",
    severity: {
      info: "Info",
      urgent: "Urgent",
      emergency: "Emergency"
    },
    reasons: {
      wrongParking: {
        label: "Wrongly parked car",
        description: "Blocking a driveway, parked in a restricted zone, or in your spot."
      },
      headlightsOn: {
        label: "Headlights left on",
        description: "Lights or hazards on — the car battery will drain."
      },
      flatTyre: {
        label: "Flat tyre",
        description: "One of the car's tyres looks flat or deflated."
      },
      towing: {
        label: "Car being towed",
        description: "A towing service is about to tow this car."
      },
      doorOrWindowOpen: {
        label: "Door or window open",
        description: "A car door, boot, or window appears to be open."
      },
      carDamaged: {
        label: "Car damaged",
        description: "The car looks scratched, dented, or otherwise damaged."
      },
      accident: {
        label: "Accident / emergency",
        description: "An accident, fire, or medical emergency involving this car."
      },
      other: {
        label: "Something else",
        description: "Leave a private note for the car owner."
      }
    }
  },
  call: {
    incomingCall: "Incoming call",
    ownerCall: "Call from vehicle owner",
    ringing: "Ringing...",
    connecting: "Connecting...",
    connected: "Connected",
    ended: "Call ended",
    missed: "Missed call",
    accept: "Accept",
    decline: "Decline",
    hangUp: "Hang up",
    mute: "Mute",
    unmute: "Unmute",
    callOwner: "Call owner",
    callReporter: "Call reporter",
    callRequested: "Call requested",
    duration: "Duration",
    privateCall: "This call is anonymous – your number stays protected.",
    reporter: {
      header: "AutoQR · Secure call",
      subheader: "Incident bridge",
      closeAria: "Close call window",
      connectingTo: "Connecting to",
      vehicleOwnerFallback: "Vehicle owner",
      fromPhone: "From {{phone}}",
      reconnecting: "Reconnecting…",
      yourReport: "Your report",
      viewPhotoOne: "View 1 photo",
      viewPhotoMany: "View {{count}} photos",
      incidentPhotoAlt: "Incident {{index}}",
      incidentPhotoFullAlt: "Incident photo {{index}}",
      closeGalleryAria: "Close gallery",
      missingCredentials: "Missing incident credentials. Please re-submit the incident.",
      couldNotLoadIncident: "Could not load incident details.",
      couldNotNegotiate: "Could not negotiate the call. Please try again.",
      connectToVehicleOwner: "Connect to Vehicle Owner",
      micNotice:
        "Your browser will ask for microphone access. Your phone number stays masked to the owner.",
      waitingMicPermission: "Waiting for microphone permission…",
      preparing: "Preparing…",
      connectingShort: "Connecting…",
      micRequiredTitle: "Microphone permission required",
      micRequiredBody: "Please enable microphone access in your browser settings, then retry.",
      tryAgain: "Try again",
      cancelCall: "Cancel call",
      mute: "Mute",
      unmute: "Unmute",
      end: "End",
      speaker: "Speaker",
      rejectedBody: "No response from the vehicle owner. You can try again.",
      missedBody: "No response. You can try again.",
      errorBody: "Call couldn't complete. Please try again.",
      endedBody: "Call ended. Thanks for helping the owner.",
      callAgain: "Call again",
      close: "Close",
      statusPreparing: "Preparing secure channel",
      statusReady: "Ready to call",
      statusWaitingMic: "Waiting for microphone",
      statusMicBlocked: "Microphone blocked",
      statusConnecting: "Connecting",
      statusRinging: "Calling vehicle owner",
      statusInCall: "In call · {{duration}}",
      statusEnded: "Call ended",
      statusOwnerUnable: "No response",
      statusOwnerUnavailable: "Waiting for response",
      statusError: "Error"
    }
  },
  plans: {
    title: "Choose your plan",
    subtitle: "Find the right protection for your vehicle.",
    selectPlan: "Select plan",
    startOnboarding: "Get started",
    featuresTitle: "What's included",
    comingSoon: "Coming soon",
    eyebrow: "Plans",
    pageTitle: "Pick a plan — start in under 3 minutes.",
    pageSubtitle:
      "One-time payment. No subscriptions. No hidden fees. Every plan includes tags, emergency routing, and lifetime reassignment.",
    sectionEyebrow: "Transparent pricing",
    sectionTitle: "From a single car to a full fleet.",
    sectionSubtitle:
      "One-time plans in EUR. Same privacy core — different tag bundles, contact limits, and support levels.",
    loadingPlans: "Loading…",
    loadError: "We couldn't load plans just now. Please refresh in a moment.",
    needMoreThanBusiness: "Need more than Fleet Pro?",
    talkToSales: "Talk to sales",
    talkToSalesSuffix: "for volume pricing.",
    backToPlans: "← Back to plans",
    highlights: "Highlights",
    whatsInTheBox: "What's in the box",
    qrCodesLabel: "Tags",
    vehiclesLabel: "Vehicles",
    emergencyContactsLabel: "Emergency contacts",
    emergencyUnlimited: "Unlimited",
    supportLabel: "Support",
    youPay: "You pay",
    oneTime: "One-time payment · no subscription",
    billedYearly: "Billed yearly",
    checkoutCta: "Checkout",
    priceFooter: "Secured by Stripe · privacy-first relay",
    planNotFound: "Plan not found",
    chooseX: "Choose {{name}}",
    compareDetails: "Compare details",
    oneTimePayment: "One-time payment",
    tagIncluded: "QR tag included",
    tagsIncluded: "QR tags included",
    supportSuffix: "support",
    loading: "Loading…",
    checkoutYouPay: "You pay",
    checkoutIncludes: "Includes",
    checkoutTagsLine: "{{count}} QR tag",
    checkoutTagsLine_plural: "{{count}} QR tags",
    checkoutActivationNote: "Activation happens after delivery",
    checkoutFootnote:
      "Your QR becomes active only after you create an account and activate it with the activation code you receive with your QR.",
    checkoutTitle: "Checkout",
    checkoutIntro:
      "Your order and shipping details are used for dispatch. The QR is linked to your account only after activation.",
    checkoutSectionContact: "Contact",
    checkoutLabelFullName: "Full name",
    checkoutLabelPhone: "Phone",
    checkoutLabelEmail: "Email",
    checkoutPhonePlaceholder: "+49 …",
    checkoutSectionShipping: "Shipping address",
    checkoutLabelAddressLine1: "Address line",
    checkoutLabelAddressLine2: "Address line 2 (optional)",
    checkoutLabelCity: "City",
    checkoutLabelPostalCode: "Postal code",
    checkoutLabelCountry: "Country",
    checkoutDefaultCountry: "Germany",
    checkoutSectionNoteOptional: "Optional note",
    checkoutLabelDeliveryNote: "Delivery note",
    checkoutPayButton: "Pay {{amount}}",
    checkoutRedirecting: "Redirecting to payment…",
    checkoutLegalConsent:
      "By paying, you agree that your QR becomes active only after account creation and activation.",
    checkoutStripeFailed: "Stripe checkout failed. Please try again.",
    checkoutGenericFailed: "Checkout failed."
  },
  onboarding: {
    title: "Welcome to AutoQr",
    subtitle: "Ready in a few simple steps.",
    steps: {
      plan: "Plan",
      account: "Account",
      address: "Address",
      payment: "Payment",
      done: "Done"
    },
    accountTitle: "Create account",
    addressTitle: "Shipping address",
    paymentTitle: "Payment",
    successTitle: "Welcome aboard!",
    successSubtitle: "Your order was placed successfully. Your QR code will arrive soon.",
    successGoToDashboard: "Go to dashboard"
  },
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome back",
    portalBrand: "Vehicle owner portal",
    openSidebar: "Open sidebar",
    closeSidebar: "Close sidebar",
    toggleSidebar: "Toggle sidebar",
    toggleTheme: "Toggle theme",
    notificationsAria: "Notifications",
    ownerFallback: "Vehicle owner",
    logout: "Sign out",
    searchPlaceholder: "Search incidents, orders, calls...",
    nav: {
      overview: "Dashboard",
      activate: "Activate vehicle QR",
      tags: "My vehicle QRs",
      cars: "My vehicles",
      emergency: "Emergency contacts",
      alerts: "Scan alerts",
      incidents: "Incidents",
      calls: "Calls",
      orders: "Orders",
      notifications: "Notifications",
      profile: "Profile",
      settings: "Settings"
    },
    titles: {
      dashboard: "Dashboard",
      cars: "My vehicles",
      activate: "Activate vehicle QR",
      tags: "My vehicle QRs",
      alerts: "Scan alerts",
      emergency: "Emergency contacts",
      incidents: "Vehicle incidents",
      calls: "Calls",
      orders: "Orders",
      notifications: "Notifications",
      profile: "Profile",
      settings: "Settings",
      fallback: "Vehicle owner area"
    },
    hero: {
      welcome: "Welcome back to AutoQr",
      headline: "Your vehicle owner workspace is active and protected.",
      description:
        "Manage your vehicles, respond to scan alerts and track QR orders as well as shipments in a premium control center."
    },
    summary: {
      carCount: "Registered vehicles",
      activeTags: "Active vehicle QRs",
      incidents: "Recent incidents",
      calls: "Recent calls",
      paidOrders: "Paid orders",
      accountStatus: "Account status"
    },
    sections: {
      recentIncidentsTitle: "Recent vehicle incidents",
      recentIncidentsSubtitle:
        "Latest reports from people who scanned your vehicle QR.",
      emptyIncidentsTitle: "No incidents yet",
      emptyIncidentsMessage: "New reports from scans will appear here.",
      orderStatusTitle: "Order & shipping status",
      orderStatusSubtitle: "Progress and delivery history of your QR order.",
      emptyOrderTitle: "No order found",
      emptyOrderMessage: "Your first QR order will appear here after purchase.",
      notificationsPreviewTitle: "Notifications preview",
      notificationsPreviewSubtitle:
        "Latest scan alerts, call requests and order updates.",
      emptyNotificationsTitle: "No notifications yet",
      emptyNotificationsMessage: "Real-time updates will appear here."
    },
    recentIncidents: "Recent incidents",
    recentCalls: "Recent calls",
    noIncidents: "No incidents reported yet.",
    noCalls: "No calls yet.",
    noOrders: "No orders yet."
  },
  activate: {
    title: "Activate QR code",
    subtitle: "Enter the activation code from your sticker.",
    codeLabel: "Activation code",
    codePlaceholder: "e.g. AQR-1234-5678",
    plateLabel: "Number plate",
    platePlaceholder: "e.g. B-AB 1234",
    makeLabel: "Make",
    modelLabel: "Model",
    colorLabel: "Colour",
    submit: "Activate",
    submitting: "Activating...",
    success: "QR code activated successfully.",
    error: "Activation failed.",
    pageTitle: "Activate your vehicle QR",
    pageSubtitle:
      "Enter the one-time activation code on your QR sticker and link it to a vehicle. Once activated, the code is no longer usable and the QR stays permanently bound to this vehicle.",
    stepEnterCode: "Enter activation code",
    stepAddCarDetails: "Add vehicle details",
    stepActivated: "Activated",
    oneTimeCodeLabel: "One-time activation code",
    oneTimeCodeHelp:
      "You can find this code on the label next to your QR sticker. Each code can only be used once.",
    invalidCodeError:
      "The activation code appears invalid. Check the sticker – it should be 4–40 letters and digits.",
    registrationRequired: "Number plate is required.",
    activationSuccess: "Your vehicle QR is now active and permanently linked to your vehicle.",
    activationFailed: "Activation failed. Please check the code and try again.",
    codeSectionTitle: "Activation code",
    linkToExistingCar: "Link to an existing vehicle",
    addNewCar: "Add a new vehicle",
    carLabel: "Vehicle",
    registrationLabel: "Number plate *",
    registrationPlaceholder: "e.g. B-AQ 1234",
    makePlaceholder: "e.g. Volkswagen",
    modelPlaceholder: "e.g. Golf",
    yearLabel: "Year",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "e.g. Family vehicle",
    plateImageLabel: "Front photo with plate (optional)",
    activating: "Activating...",
    activateAndBind: "Activate and bind to vehicle",
    allSet: "All done.",
    backLabel: "Back"
  },
  cars: {
    title: "My vehicles",
    addCar: "Add vehicle",
    plate: "Number plate",
    make: "Make",
    model: "Model",
    color: "Colour",
    nickname: "Nickname",
    noCars: "No vehicles yet. Add your first vehicle.",
    subtitle:
      "Add every vehicle you want to link to an AutoQr code. Each vehicle can hold one active QR for scans and notifications.",
    registrationNumber: "Number plate",
    makePlaceholder: "e.g. Volkswagen",
    modelPlaceholder: "e.g. Golf",
    colorPlaceholder: "e.g. Pearl white",
    yearLabel: "Year",
    yearPlaceholder: "e.g. 2022",
    nicknamePlaceholder: "e.g. Family vehicle",
    displayMessageLabel: "Public display message (shown on the scan page)",
    displayMessagePlaceholder:
      "Example: Thanks for the heads-up about my vehicle – please pick a reason below.",
    saving: "Saving...",
    updateCar: "Update vehicle",
    couldNotSave: "Could not save vehicle.",
    couldNotDelete: "Could not delete.",
    removeConfirm: "Remove this vehicle?",
    noCarsTitle: "No vehicles yet",
    noCarsMessage: "Add your first vehicle above to link it with a QR.",
    primaryCar: "Primary vehicle",
    linkedTagsLabel: "Linked QRs:",
    activeLabel: "active",
    setAsPrimary: "Set as primary vehicle",
    remove: "Remove"
  },
  tags: {
    title: "My QR codes",
    noTags: "No QR codes yet.",
    activate: "Activate",
    code: "Code",
    linkedCar: "Linked vehicle",
    lastScan: "Last scan",
    pageTitle: "My vehicle QRs",
    pageSubtitle:
      "QR stickers activated with your account. Each QR is permanently bound to a specific vehicle and its activation code has been consumed.",
    noTagsTitle: "No QRs activated yet",
    noTagsMessage:
      "Received stickers? Go to Activate to enter the one-time code and link it to your vehicle.",
    columnSerial: "Serial number",
    columnStatus: "Status",
    columnLinkedCar: "Linked vehicle",
    columnScans: "Scans",
    columnLastScan: "Last scan",
    columnActivatedAt: "Activated on",
    columnPublicPage: "Public page",
    preview: "Preview",
    activationHistoryTitle: "Activation history",
    columnWhen: "When",
    columnQrSerial: "QR serial",
    columnCar: "Vehicle",
    columnOutcome: "Outcome"
  },
  emergency: {
    title: "Emergency contacts",
    subtitle:
      "In an accident or emergency scan we notify these contacts via SMS and email. Add family or trusted people.",
    nameLabel: "Name",
    relationshipLabel: "Relationship",
    relationshipPlaceholder: "Spouse, parent, friend...",
    phoneLabel: "Phone",
    emailLabel: "Email (optional)",
    emergencyOnlyLabel:
      "Notify this contact only for emergencies (accidents). Disabled = notify on every urgent scan alert.",
    saving: "Saving...",
    updateContact: "Update contact",
    addContact: "Add contact",
    couldNotSave: "Could not save contact.",
    removeConfirm: "Remove this emergency contact?",
    noContactsTitle: "No emergency contacts",
    noContactsMessage: "Add up to 10 people to be notified in an emergency.",
    emergencyOnlyBadge: "emergency only",
    allUrgentBadge: "all urgent",
    contactFallback: "Contact",
    priority: "Priority"
  },
  scanAlerts: {
    title: "Vehicle scan alerts",
    subtitle:
      "Every time someone scans your vehicle QR and picks a reason, it appears here. Acknowledge once you've responded.",
    noAlertsTitle: "No vehicle scan alerts yet",
    noAlertsMessage: "Alerts from people who scan your vehicle QR will appear here.",
    reporterLabel: "Reporter:",
    maskedForPrivacy: "(masked for privacy)",
    locationLabel: "Location:",
    markAsHandled: "Mark as handled",
    reasons: {
      wrongParking: "Wrongly parked car",
      headlightsOn: "Headlights left on",
      flatTyre: "Flat tyre",
      towing: "Car being towed",
      doorOrWindowOpen: "Car door or window open",
      carDamaged: "Car damaged",
      accident: "Accident / emergency",
      other: "Other"
    }
  },
  incidents: {
    title: "Incidents",
    subtitle: "All reported incidents for your vehicle.",
    noIncidents: "No incidents reported.",
    reporter: "Reporter",
    date: "Date",
    viewImages: "View images",
    reporterPhoneMasked: "Reporter number (masked)",
    pageTitle: "Vehicle incident management",
    pageSubtitle:
      "Track incident reports from people who scanned your vehicle QR, caller details, and resolution progress.",
    searchPlaceholder: "Search by message or masked number...",
    allStatuses: "All statuses",
    statusOpen: "Open",
    statusResolved: "Resolved",
    statusPending: "Pending",
    noIncidentsFoundTitle: "No vehicle incidents found",
    noIncidentsFoundMessage:
      "Adjust your filters or wait for new reports from vehicle scans.",
    tableTitle: "Vehicle incident table",
    tableSubtitle:
      "Reporter identities are masked – only their call, not their number, reaches you.",
    columnDate: "Date",
    columnReporter: "Reporter",
    columnMessage: "Message",
    columnImages: "Images",
    columnStatus: "Status",
    columnAction: "Action",
    privateReporter: "Private reporter",
    numberMasked: "Number masked",
    imagesCount: "{{count}} image(s)",
    viewDetails: "View details",
    detailsTitle: "Incident details",
    numberMaskedForPrivacy: "Number masked for privacy",
    callTimeline: "Call timeline",
    noDetailTitle: "No details found",
    noDetailMessage: "This incident may no longer be available."
  },
  calls: {
    title: "Calls",
    noCalls: "No calls yet.",
    duration: "Duration",
    date: "Date",
    with: "With",
    pageTitle: "Call history",
    pageSubtitle: "Track outcomes of incoming calls with linked incidents and response timelines.",
    searchPlaceholder: "Search by incident ID or status...",
    allStatuses: "All statuses",
    statusAccepted: "Accepted",
    statusRejected: "Rejected",
    statusMissed: "Missed",
    statusCompleted: "Completed",
    statusConnected: "Connected",
    noCallsFoundTitle: "No calls found",
    noCallsFoundMessage: "Call logs appear here after contact attempts on incidents.",
    ledgerTitle: "Detailed call log",
    ledgerSubtitle: "Readable status, duration and linked incident reference.",
    columnTimestamp: "Timestamp",
    columnIncident: "Incident",
    columnStatus: "Status",
    columnDuration: "Duration",
    columnOutcome: "Outcome",
    completedFallback: "completed"
  },
  orders: {
    title: "Orders",
    noOrders: "No orders yet.",
    orderNumber: "Order number",
    total: "Total",
    payment: "Payment",
    noOrdersTitle: "No orders yet",
    noOrdersMessage: "Your one-time AutoQr purchase details appear here after registration.",
    tableTitle: "Order and payment table",
    tableSubtitle: "Payment state, invoice availability and overall order status at a glance.",
    columnOrderDate: "Order date",
    columnAmount: "Amount",
    columnPayment: "Payment",
    columnOrder: "Order",
    columnInvoice: "Invoice",
    columnQrGeneration: "QR generation",
    invoicePending: "Pending",
    qrGenerated: "Generated/active soon",
    waitingPayment: "Waiting for payment",
    timelineTitle: "Print and delivery timeline",
    timelineSubtitle: "Overview of printing, shipping and delivery through to lifetime activation.",
    lifetimeActive: "Lifetime active after completion"
  },
  notifications: {
    title: "Notifications",
    noNotifications: "No notifications.",
    markAllRead: "Mark all as read",
    pageSubtitle:
      "Incident alerts, call requests, payment and shipping updates in a single feed.",
    noNotificationsTitle: "No notifications yet",
    noNotificationsMessage: "Incoming updates appear as you use AutoQr."
  },
  profile: {
    title: "Profile",
    updateProfile: "Update profile",
    updateSuccess: "Profile updated.",
    changePassword: "Change password",
    pageTitle: "Profile details",
    pageSubtitle: "Manage contact and ownership information for faster incident response.",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
    saveProfile: "Save profile",
    saving: "Saving...",
    ownershipTitle: "Vehicle ownership verification",
    ownershipSubtitle:
      "Uploaded ownership metadata and linked vehicle data support the incident trust flow.",
    ownershipBody:
      "Vehicle ownership verification data is automatically linked with your registered vehicles and order details to support secure, masked communication during incidents."
  },
  settings: {
    title: "Settings",
    languageSection: "Language",
    languageHelp: "Choose the display language of AutoQr.",
    notificationsSection: "Notifications",
    emailNotifications: "Email notifications",
    inAppNotifications: "In-app notifications",
    savePreferences: "Save preferences",
    languageSaved: "Language saved.",
    languageSaveFailed: "Could not save language.",
    passwordChangeTitle: "Change password",
    passwordChangeSubtitle: "Secure your AutoQr account with a strong password.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    passwordUpdateSoon: "Password update coming soon",
    notificationsTitle: "Notification preferences",
    notificationsSubtitle: "Choose which updates should trigger notifications.",
    prefIncidents: "Incident alerts",
    prefCalls: "Call requests",
    prefOrders: "Payment and shipping updates",
    saving: "Saving...",
    privacyTitle: "Privacy and account settings",
    privacySubtitle:
      "Manage visibility and account controls for vehicle owner communication.",
    privacyBody:
      "Your contact details are only shared with reporters during approved incident communication. Contact support for exports or account deactivation."
  },
  admin: {
    nav: {
      dashboard: "Dashboard",
      analytics: "Analytics",
      users: "Users",
      cars: "Vehicles",
      orders: "Orders",
      payments: "Payments",
      plans: "Plans",
      tagBatches: "Tag batches",
      tagsInventory: "QR inventory",
      activations: "Activations",
      incidents: "Incidents",
      scanAlerts: "Scan alerts",
      calls: "Calls",
      shipments: "Shipments",
      consent: "Consents",
      content: "Content",
      settings: "Settings",
      auditLogs: "Audit logs"
    },
    dashboard: {
      title: "Admin dashboard",
      users: "Users",
      paidOrders: "Paid orders",
      activeCars: "Active vehicles",
      activatedTags: "Activated QR codes",
      revenue: "Revenue",
      incidents: "Incidents",
      calls: "Calls",
      pendingShipments: "Pending shipments",
      recentActivity: "Recent activity"
    },
    content: {
      title: "Manage content",
      subtitle: "Edit website and legal content in German and English.",
      slug: "Slug",
      titleDe: "Title (German)",
      titleEn: "Title (English)",
      bodyDe: "Content (German)",
      bodyEn: "Content (English)",
      published: "Published",
      languageTabs: { de: "German", en: "English" },
      save: "Save content",
      saving: "Saving...",
      success: "Content saved.",
      newPage: "New page",
      selectPage: "Select page"
    },
    tagsInventory: {
      title: "QR inventory",
      total: "Total",
      available: "Available",
      activated: "Activated"
    }
  },
  landingHero: {
    chapterLabel: "Chapter",
    ctaPrimary: "Order Car QR",
    ctaSecondary: "Order Key QR",
    chapters: {
      arrival: {
        headline: "Parked. <highlight>Protected.</highlight>",
        subline: "Your car stays reachable — even after you walk away."
      },
      parking: {
        headline: "When someone <highlight>hits</highlight> your car —",
        subline: "it usually happens when you're not nearby."
      },
      reveal: {
        headline: "One <highlight>QR code</highlight>. A lifetime of safety.",
        subline:
          "Anonymous. GDPR-compliant. Instant connection — without exposing your number."
      },
      walkaway: {
        headline: "Walk away <highlight>at ease</highlight>.",
        subline: "AutoQR is there if anything happens."
      }
    }
  }
};

export const en: TranslationSchema = deepMerge(de, overrides);
