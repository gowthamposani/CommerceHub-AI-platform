/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        admin: {
          gold: "#C98B2B",
          cream: "#F5F2ED",
          background: "#FAFAFA",
          ink: "#1F1A14",
          muted: "#756B5E",
          border: "#E7DED2",
        },
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        admin: "16px",
      },
      boxShadow: {
        admin: "0 18px 45px rgba(31, 26, 20, 0.08)",
        "admin-soft": "0 8px 24px rgba(31, 26, 20, 0.06)",
      },
    },
  },
  plugins: [],
};
