import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "rgb(var(--color-gold) / <alpha-value>)",
          blue: "rgb(var(--color-blue) / <alpha-value>)",
          green: "rgb(var(--color-green) / <alpha-value>)",
          red: "rgb(var(--color-red) / <alpha-value>)",
          yellow: "rgb(var(--color-yellow) / <alpha-value>)",
          ink: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          surface: "rgb(var(--color-surface) / <alpha-value>)"
        }
      },
      boxShadow: {
        soft: "0 8px 30px rgb(15 23 42 / 0.08)",
        panel: "0 1px 2px rgb(15 23 42 / 0.06), 0 10px 28px rgb(15 23 42 / 0.08)"
      },
      borderRadius: {
        card: "0.5rem"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
