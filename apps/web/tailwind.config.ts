import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07070A",
          900: "#0B0B0F",
          800: "#101015",
          700: "#16161C",
          600: "#1C1C24",
          500: "#24242E"
        },
        fog: {
          50: "#F7F7F8",
          100: "#EDEDEE",
          200: "#D6D6D9",
          300: "#A8A8AD",
          400: "#7A7A80",
          500: "#5C5C63",
          600: "#3D3D44"
        },
        accent: {
          DEFAULT: "#E9C79A",
          soft: "#2A221A",
          muted: "#C9A982"
        },
        brand: {
          50: "#eef2ff",
          500: "#334155",
          700: "#1e293b"
        },
        action: "#dc2626"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace"
        ]
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        display: "-0.035em"
      },
      boxShadow: {
        premium: "0 10px 25px -10px rgba(15, 23, 42, 0.35)",
        glow: "0 0 60px -20px rgba(233, 199, 154, 0.35)",
        elevate: "0 30px 80px -40px rgba(0, 0, 0, 0.8)"
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(233,199,154,0.08), transparent 60%)"
      }
    }
  },
  plugins: []
};

export default config;
