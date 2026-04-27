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
        action: "#dc2626",
        landing: {
          primary: "#0066FF",
          deep: "#001233",
          soft: "#E8F0FF",
          ink: "#0A0A0A",
          mist: "#F8F9FB",
          line: "#E5E8EC",
          muted: "#9AA3B0",
          slate: "#4A5260"
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
      boxShadow: {
        premium: "0 10px 25px -10px rgba(15, 23, 42, 0.35)",
        glow: "0 0 60px -20px rgba(233, 199, 154, 0.35)",
        elevate: "0 30px 80px -40px rgba(0, 0, 0, 0.8)",
        soft: "0 1px 2px 0 rgba(17, 24, 39, 0.04), 0 1px 3px 0 rgba(17, 24, 39, 0.06)",
        card: "0 10px 30px -12px rgba(29, 78, 216, 0.12), 0 4px 10px -4px rgba(17, 24, 39, 0.06)",
        glass: "0 20px 60px -20px rgba(29, 78, 216, 0.18)",
        "landing-soft":
          "0 1px 2px 0 rgba(0,18,51,0.04), 0 4px 16px -4px rgba(0,102,255,0.08)",
        "landing-card":
          "0 12px 32px -12px rgba(0,102,255,0.18), 0 2px 8px -2px rgba(0,18,51,0.06)",
        "landing-glow": "0 0 60px -10px rgba(0,102,255,0.35)",
        "landing-deep": "0 30px 80px -30px rgba(0,18,51,0.35)"
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(29,78,216,0.10), transparent 60%)",
        "brand-fade":
          "radial-gradient(ellipse at top, rgba(59,124,246,0.12), transparent 60%)",
        "brand-soft":
          "linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 60%)",
        "landing-mesh":
          "radial-gradient(at 20% 10%, rgba(0,102,255,0.10) 0px, transparent 45%), radial-gradient(at 80% 0%, rgba(0,102,255,0.06) 0px, transparent 50%), radial-gradient(at 60% 90%, rgba(0,18,51,0.04) 0px, transparent 50%)",
        "landing-grid":
          "linear-gradient(to right, rgba(0,18,51,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,18,51,0.06) 1px, transparent 1px)"
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
