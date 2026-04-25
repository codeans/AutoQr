export const StorageKeys = {
  accessToken: "autoqr.accessToken",
  refreshToken: "autoqr.refreshToken",
  pushToken: "autoqr.pushToken",
  onboarded: "autoqr.onboarded"
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
