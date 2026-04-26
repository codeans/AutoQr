const MONGO_ID_LENGTH = 24;
const UUID_HEX_LENGTH = 32;

const toHexSeed = (value: string) =>
  value.replace(/[^a-fA-F0-9]/g, "").toLowerCase().padEnd(UUID_HEX_LENGTH, "0").slice(0, UUID_HEX_LENGTH);

export const callUuidFromId = (callId: string): string => {
  const seed = toHexSeed(callId);
  return `${seed.slice(0, 8)}-${seed.slice(8, 12)}-${seed.slice(12, 16)}-${seed.slice(16, 20)}-${seed.slice(20)}`;
};

export const callIdFromUuid = (uuid: string): string => {
  const compact = uuid.replace(/-/g, "").toLowerCase();
  if (compact.length !== UUID_HEX_LENGTH) return uuid;
  return compact.slice(0, MONGO_ID_LENGTH);
};
