/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF4EE",
          100: "#FFE3D2",
          200: "#FFC5A6",
          300: "#FFA679",
          400: "#FF884D",
          500: "#FF6B35",
          600: "#E5511C",
          700: "#B83E12",
          800: "#8A2C0A",
          900: "#5C1A03",
        },
        secondary: {
          50: "#E8F1FE",
          100: "#C7DBFC",
          200: "#95BAF9",
          300: "#6498F5",
          400: "#3A80F2",
          500: "#1A73E8",
          600: "#1557B0",
          700: "#0F3F80",
          800: "#08274D",
          900: "#04121F",
        },
        success: "#52C41A",
        warning: "#FAAD14",
        danger: "#FF4D4F",
        surface: "#FFFFFF",
        background: "#F5F7FA",
        border: "#E5E6EB",
        text: {
          primary: "#1F2329",
          secondary: "#646A73",
          tertiary: "#8F959E",
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "card-hover":
          "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)",
        pop: "0 6px 24px 0 rgba(0, 0, 0, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
