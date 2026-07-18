/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"]
      },
      colors: {
        hospital: {
          bg: "#0B1220",
          card: "#172235",
          border: "#24344A",
          blue: "#2563EB",
          muted: "#8EA0B8"
        },
        status: {
          stable: "#22C55E",
          observation: "#FACC15",
          urgent: "#F97316",
          critical: "#EF4444"
        }
      },
      boxShadow: {
        panel: "0 18px 60px rgba(2, 8, 23, 0.28)"
      }
    }
  },
  plugins: []
};
