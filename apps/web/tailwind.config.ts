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
          DEFAULT: "#1D4ED8",
          soft: "#DBEAFE",
          muted: "#1E3A8A"
        },
        brand: {
          50: "#EFF4FF",
          100: "#DBEAFE",
          200: "#BFD7FE",
          300: "#93BBFD",
          400: "#609BFA",
          500: "#3B7CF6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A"
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F8FAFC",
          sunken: "#F1F5F9",
          border: "#E5E7EB"
        },
        content: {
          DEFAULT: "#111827",
          muted: "#6B7280",
          subtle: "#6B7280",
          soft: "#9CA3AF"
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
        elevate: "0 30px 80px -40px rgba(0, 0, 0, 0.8)",
        soft: "0 1px 2px 0 rgba(17, 24, 39, 0.04), 0 1px 3px 0 rgba(17, 24, 39, 0.06)",
        card: "0 10px 30px -12px rgba(29, 78, 216, 0.12), 0 4px 10px -4px rgba(17, 24, 39, 0.06)",
        glass: "0 20px 60px -20px rgba(29, 78, 216, 0.18)"
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(29,78,216,0.10), transparent 60%)",
        "brand-fade":
          "radial-gradient(ellipse at top, rgba(59,124,246,0.12), transparent 60%)",
        "brand-soft":
          "linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 60%)"
      }
    }
  },
  plugins: []
};

export default config;
