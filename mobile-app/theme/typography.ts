import { TextStyle } from "react-native";

export const typography = {
  displayLg: { fontSize: 36, lineHeight: 44, fontWeight: "700", letterSpacing: -0.5 },
  display: { fontSize: 30, lineHeight: 38, fontWeight: "700", letterSpacing: -0.4 },
  h1: { fontSize: 26, lineHeight: 34, fontWeight: "700", letterSpacing: -0.3 },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: "700", letterSpacing: -0.2 },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: "600" },
  bodyLg: { fontSize: 17, lineHeight: 26, fontWeight: "400" },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: "500" },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  smallMedium: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.2 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase" }
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
