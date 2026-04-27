export const colors = {
  primary: "#1D4ED8",
  primaryDark: "#1E3A8A",
  primarySoft: "#DBEAFE",
  primaryTint: "#EFF6FF",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",
  text: "#111827",
  textMuted: "#4B5563",
  textSubtle: "#6B7280",
  textInverse: "#FFFFFF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  success: "#16A34A",
  successSoft: "#D1FAE5",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  info: "#3B82F6",
  infoSoft: "#DBEAFE",
  overlay: "rgba(17, 24, 39, 0.55)",
  shadow: "rgba(17, 24, 39, 0.08)"
} as const;

export type ColorToken = keyof typeof colors;
