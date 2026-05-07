import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "0px",
      sm: "481px",
      md: "769px",
      lg: "1025px",
      xl: "1441px"
    },
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
          DEFAULT: "#003878",
          soft: "#DCE8F7",
          muted: "#002C5F"
        },
        brand: {
          50: "#EEF4FB",
          100: "#DCE8F7",
          200: "#BDD4ED",
          300: "#93B8DF",
          400: "#6999CF",
          500: "#3D77B0",
          600: "#003878",
          700: "#002C5F",
          800: "#002449",
          900: "#001B36"
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
        action: "#dc2626",
        signal: {
          DEFAULT: "#688850",
          soft: "#EAF0E4",
          muted: "#4F6C3D"
        },
        landing: {
          primary: "#003878",
          deep: "#001B36",
          soft: "#EEF4FB",
          ink: "#0D1B2A",
          mist: "#F6F9FC",
          line: "#D2DEED",
          muted: "#5E7693",
          slate: "#37526F",
          support: "#688850"
        }
      },
      borderRadius: {
        card: "20px",
        "card-lg": "24px"
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
      fontSize: {
        "fluid-h1": ["clamp(2rem, 5vw, 5rem)", { lineHeight: "1.03", letterSpacing: "-0.03em" }],
        "fluid-h2": ["clamp(1.5rem, 3.6vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "fluid-h3": ["clamp(1.25rem, 2.6vw, 2.125rem)", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        "fluid-body": ["clamp(0.875rem, 1.4vw, 1rem)", { lineHeight: "1.6" }]
      },
      boxShadow: {
        premium: "0 10px 25px -10px rgba(15, 23, 42, 0.35)",
        glow: "0 0 60px -20px rgba(233, 199, 154, 0.35)",
        elevate: "0 30px 80px -40px rgba(0, 0, 0, 0.8)",
        soft: "0 1px 2px 0 rgba(17, 24, 39, 0.04), 0 1px 3px 0 rgba(17, 24, 39, 0.06)",
        card: "0 10px 30px -12px rgba(0, 56, 120, 0.16), 0 4px 10px -4px rgba(17, 24, 39, 0.06)",
        glass: "0 20px 60px -20px rgba(0, 56, 120, 0.2)",
        "landing-soft":
          "0 1px 2px 0 rgba(0,27,54,0.05), 0 4px 16px -4px rgba(0,56,120,0.1)",
        "landing-card":
          "0 12px 32px -12px rgba(0,56,120,0.22), 0 2px 8px -2px rgba(0,27,54,0.08)",
        "landing-glow": "0 0 60px -10px rgba(0,56,120,0.38)",
        "landing-deep": "0 30px 80px -30px rgba(0,27,54,0.38)"
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(0,56,120,0.12), transparent 60%)",
        "brand-fade":
          "radial-gradient(ellipse at top, rgba(61,119,176,0.14), transparent 60%)",
        "brand-soft":
          "linear-gradient(180deg, #F2F7FC 0%, #FFFFFF 60%)",
        "landing-mesh":
          "radial-gradient(at 20% 10%, rgba(0,56,120,0.12) 0px, transparent 45%), radial-gradient(at 80% 0%, rgba(104,136,80,0.08) 0px, transparent 50%), radial-gradient(at 60% 90%, rgba(0,27,54,0.05) 0px, transparent 50%)",
        "landing-grid":
          "linear-gradient(to right, rgba(0,27,54,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,27,54,0.07) 1px, transparent 1px)"
      },
      keyframes: {
        "landing-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        "landing-pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" }
        },
        "landing-shine": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" }
        }
      },
      animation: {
        "landing-float": "landing-float 6s ease-in-out infinite",
        "landing-pulse-glow": "landing-pulse-glow 2.4s ease-in-out infinite",
        "landing-shine": "landing-shine 2.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
