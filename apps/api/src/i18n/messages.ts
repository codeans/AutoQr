import type { Locale } from "@autoqr/shared";

type MessageBundle = {
  errors: {
    invalidInput: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    conflict: string;
    tooManyRequests: string;
    internalError: string;
    invalidToken: string;
    tokenExpired: string;
    phoneInvalid: string;
    phoneRequired: string;
    emailInvalid: string;
    emailRequired: string;
    passwordRequired: string;
    passwordTooShort: string;
    activationCodeRequired: string;
    activationCodeInvalid: string;
    plateRequired: string;
    plateInvalid: string;
    nameRequired: string;
    addressRequired: string;
    incidentImageRequired: string;
    incidentReasonRequired: string;
    otpRequired: string;
    otpInvalid: string;
    otpExpired: string;
    alreadyActivated: string;
    tagNotFound: string;
    vehicleNotFound: string;
    orderNotFound: string;
    paymentFailed: string;
    invalidFile: string;
    fileTooLarge: string;
  };
  success: {
    generic: string;
    saved: string;
    deleted: string;
    created: string;
    updated: string;
    activated: string;
    incidentReported: string;
    otpSent: string;
    callRequested: string;
  };
};

const de: MessageBundle = {
  errors: {
    invalidInput: "Ungültige Eingabe.",
    unauthorized: "Nicht autorisiert.",
    forbidden: "Zugriff verweigert.",
    notFound: "Nicht gefunden.",
    conflict: "Konflikt mit bestehenden Daten.",
    tooManyRequests: "Zu viele Anfragen. Bitte später erneut versuchen.",
    internalError: "Ein interner Fehler ist aufgetreten.",
    invalidToken: "Ungültiger oder abgelaufener Token.",
    tokenExpired: "Der Token ist abgelaufen.",
    phoneInvalid: "Bitte geben Sie eine gültige deutsche Telefonnummer ein.",
    phoneRequired: "Telefonnummer ist erforderlich.",
    emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    emailRequired: "E-Mail-Adresse ist erforderlich.",
    passwordRequired: "Passwort ist erforderlich.",
    passwordTooShort: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    activationCodeRequired: "Der Aktivierungscode ist erforderlich.",
    activationCodeInvalid: "Der Aktivierungscode ist ungültig.",
    plateRequired: "Das Kennzeichen ist erforderlich.",
    plateInvalid: "Bitte geben Sie ein gültiges deutsches Kennzeichen ein.",
    nameRequired: "Name ist erforderlich.",
    addressRequired: "Adresse ist erforderlich.",
    incidentImageRequired: "Bitte laden Sie mindestens ein Bild hoch.",
    incidentReasonRequired: "Bitte wählen Sie einen Grund aus.",
    otpRequired: "Der Bestätigungscode ist erforderlich.",
    otpInvalid: "Der Bestätigungscode ist ungültig.",
    otpExpired: "Der Bestätigungscode ist abgelaufen.",
    alreadyActivated: "Dieser QR-Code ist bereits aktiviert.",
    tagNotFound: "QR-Code nicht gefunden.",
    vehicleNotFound: "Fahrzeug nicht gefunden.",
    orderNotFound: "Bestellung nicht gefunden.",
    paymentFailed: "Die Zahlung ist fehlgeschlagen.",
    invalidFile: "Ungültiges Dateiformat.",
    fileTooLarge: "Die Datei ist zu groß."
  },
  success: {
    generic: "Erfolgreich.",
    saved: "Gespeichert.",
    deleted: "Gelöscht.",
    created: "Erstellt.",
    updated: "Aktualisiert.",
    activated: "Aktiviert.",
    incidentReported: "Der Vorfall wurde gemeldet. Der Fahrzeughalter wurde benachrichtigt.",
    otpSent: "Bestätigungscode wurde gesendet.",
    callRequested: "Anruf angefordert."
  }
};

const en: MessageBundle = {
  errors: {
    invalidInput: "Invalid input.",
    unauthorized: "Unauthorized.",
    forbidden: "Access denied.",
    notFound: "Not found.",
    conflict: "Conflict with existing data.",
    tooManyRequests: "Too many requests. Please try again later.",
    internalError: "An internal error occurred.",
    invalidToken: "Invalid or expired token.",
    tokenExpired: "Token expired.",
    phoneInvalid: "Please enter a valid German phone number.",
    phoneRequired: "Phone number is required.",
    emailInvalid: "Please enter a valid email address.",
    emailRequired: "Email address is required.",
    passwordRequired: "Password is required.",
    passwordTooShort: "Password must be at least 8 characters.",
    activationCodeRequired: "Activation code is required.",
    activationCodeInvalid: "Activation code is invalid.",
    plateRequired: "Number plate is required.",
    plateInvalid: "Please enter a valid German number plate.",
    nameRequired: "Name is required.",
    addressRequired: "Address is required.",
    incidentImageRequired: "Please upload at least one image.",
    incidentReasonRequired: "Please choose a reason.",
    otpRequired: "Verification code is required.",
    otpInvalid: "Invalid verification code.",
    otpExpired: "Verification code expired.",
    alreadyActivated: "This QR code is already activated.",
    tagNotFound: "QR code not found.",
    vehicleNotFound: "Vehicle not found.",
    orderNotFound: "Order not found.",
    paymentFailed: "Payment failed.",
    invalidFile: "Invalid file format.",
    fileTooLarge: "File is too large."
  },
  success: {
    generic: "Success.",
    saved: "Saved.",
    deleted: "Deleted.",
    created: "Created.",
    updated: "Updated.",
    activated: "Activated.",
    incidentReported: "The incident has been reported. The owner has been notified.",
    otpSent: "Verification code sent.",
    callRequested: "Call requested."
  }
};

const bundles: Record<Locale, MessageBundle> = { de, en };

export const t = (
  locale: Locale,
  group: keyof MessageBundle,
  key: string
): string => {
  const bundle = bundles[locale] || bundles.de;
  const section = bundle[group] as Record<string, string>;
  return section[key] || (bundles.en[group] as Record<string, string>)[key] || key;
};

export const messages = bundles;
