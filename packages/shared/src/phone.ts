export const GERMAN_COUNTRY_CODE = "+49";
export const GERMAN_COUNTRY_ISO = "DE";
export const GERMAN_PHONE_PLACEHOLDER = "+49 170 1234567";
export const GERMAN_PHONE_EXAMPLE = "0170 1234567";

const stripFormatting = (value: string) => value.replace(/[\s()\-./]/g, "");

const stripLeadingZeros = (value: string) => value.replace(/^0+/, "");

export const isLikelyGermanNumber = (value: string) => {
  if (!value) return false;
  const cleaned = stripFormatting(value);
  if (cleaned.startsWith("+49")) return true;
  if (cleaned.startsWith("0049")) return true;
  if (cleaned.startsWith("49") && cleaned.length >= 11) return true;
  if (cleaned.startsWith("0") && cleaned.length >= 6) return true;
  return false;
};

export const toGermanE164 = (input: string): string | null => {
  if (!input) return null;
  const cleaned = stripFormatting(input);
  let digits = "";
  if (cleaned.startsWith("+49")) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith("0049")) {
    digits = cleaned.slice(4);
  } else if (cleaned.startsWith("49")) {
    digits = cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    digits = stripLeadingZeros(cleaned);
  } else {
    return null;
  }
  if (!/^\d{6,13}$/.test(digits)) return null;
  const trimmed = stripLeadingZeros(digits);
  if (trimmed.length < 6 || trimmed.length > 13) return null;
  return `+49${trimmed}`;
};

export const isValidGermanPhone = (value: string) => toGermanE164(value) !== null;

export const formatGermanPhoneDisplay = (value: string): string => {
  const e164 = toGermanE164(value);
  if (!e164) return value;
  const rest = e164.slice(3);
  if (rest.length <= 3) return `+49 ${rest}`;
  if (rest.length <= 7) return `+49 ${rest.slice(0, 3)} ${rest.slice(3)}`;
  return `+49 ${rest.slice(0, 3)} ${rest.slice(3)}`;
};

export const maskGermanPhone = (value: string): string => {
  const e164 = toGermanE164(value);
  if (!e164) return "•••• •••• ••";
  const visible = e164.slice(-3);
  return `+49 ••• ••• ${visible}`;
};
