import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          500: "#334155",
          700: "#1e293b"
        },
        action: "#dc2626"
      },
      boxShadow: {
        premium: "0 10px 25px -10px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
