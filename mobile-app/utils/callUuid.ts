const MONGO_ID_LENGTH = 24;
const UUID_HEX_LENGTH = 32;

function toHexSeed(value: string): string {
  const hex = value.replace(/[^a-fA-F0-9]/g, "").toLowerCase();
  return hex.padEnd(UUID_HEX_LENGTH, "0").slice(0, UUID_HEX_LENGTH);
}

export function callUuidFromId(callId: string): string {
  const seed = toHexSeed(callId);
  return `${seed.slice(0, 8)}-${seed.slice(8, 12)}-${seed.slice(12, 16)}-${seed.slice(16, 20)}-${seed.slice(20)}`;
}

export function callIdFromUuid(uuid: string): string {
  const compact = uuid.replace(/-/g, "").toLowerCase();
  if (compact.length !== UUID_HEX_LENGTH) return uuid;
  const maybeObjectId = compact.slice(0, MONGO_ID_LENGTH);
  return /^[a-f0-9]{24}$/.test(maybeObjectId) ? maybeObjectId : uuid;
}
