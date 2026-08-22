/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant modern-travel palette
        brand: {
          50: "#effcfb",
          100: "#c9f5f1",
          200: "#96e9e3",
          300: "#5fd6ce",
          400: "#2fbdb5",
          500: "#14a89f", // primary teal
          600: "#0d867f",
          700: "#106b66",
          800: "#135553",
          900: "#144745",
          950: "#052a29",
        },
        coral: {
          50: "#fff3f0",
          100: "#ffe3db",
          200: "#ffc9ba",
          300: "#ffa088",
          400: "#ff6f4d",
          500: "#ff5a36", // accent coral
          600: "#ed3a13",
          700: "#c82c0d",
          800: "#a52812",
          900: "#882616",
          950: "#4a0f06",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae1",
          300: "#b0bbc7",
          400: "#8595a7",
          500: "#66778c",
          600: "#516073",
          700: "#434e5e",
          800: "#3a4350",
          900: "#1f2731",
          950: "#12171e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(16, 42, 67, 0.08), 0 4px 20px -4px rgba(16, 42, 67, 0.10)",
        card: "0 1px 3px rgba(16,42,67,0.06), 0 8px 30px -12px rgba(16,42,67,0.18)",
        glow: "0 10px 40px -10px rgba(20, 168, 159, 0.45)",
        coral: "0 10px 40px -10px rgba(255, 90, 54, 0.45)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(120deg, rgba(20,168,159,0.92) 0%, rgba(13,134,127,0.88) 45%, rgba(255,90,54,0.78) 120%)",
        "brand-gradient":
          "linear-gradient(120deg, #14a89f 0%, #0d867f 55%, #ff5a36 140%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
