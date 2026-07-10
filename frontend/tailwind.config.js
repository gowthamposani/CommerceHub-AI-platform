/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#C98B2B",
          primaryDark: "#A66C19",
          secondary: "#F5F2ED",
          background: "#FAFAFA",
          surface: "#FFFFFF",
          text: "#1F2937",
          muted: "#6B7280",
          border: "#E7E2D9",
          success: "#0F8A5F",
          warning: "#C48310",
          danger: "#C0392B",
          info: "#2563EB"
        },
        admin: {
          gold: "#C98B2B",
          cream: "#F5F2ED",
          background: "#FAFAFA",
          ink: "#1F1A14",
          muted: "#756B5E",
          border: "#E7DED2"
        }
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        admin: "16px"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(31, 41, 55, 0.08)",
        glow: "0 0 0 1px rgba(201, 139, 43, 0.18), 0 24px 50px rgba(201, 139, 43, 0.18)",
        admin: "0 18px 45px rgba(31, 26, 20, 0.08)",
        "admin-soft": "0 8px 24px rgba(31, 26, 20, 0.06)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(201, 139, 43, 0.15), transparent 30%), radial-gradient(circle at top right, rgba(245, 242, 237, 0.9), transparent 28%), linear-gradient(180deg, #FAFAFA 0%, #F7F4EE 100%)"
      }
    }
  },
  plugins: []
};
