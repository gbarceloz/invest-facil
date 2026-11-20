/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050505",
          900: "#0b0b0b",
          800: "#111111",
          700: "#181818",
          600: "#222222",
          500: "#2b2b2b",
        },
        accent: {
          DEFAULT: "#facc15",
          400: "#fde047",
          500: "#eab308",
          900: "#1d1a0b",
        },
        muted: "#a3a3a3",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(250,204,21,0.25), 0 20px 60px -20px rgba(250,204,21,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s ease-out both",
      },
    },
  },
  plugins: [],
};
