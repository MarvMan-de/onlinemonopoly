/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2bee79",
        "background-light": "#f6f8f7",
        "background-dark": "#102217",
      },
      fontFamily: {
        "display": ["Be Vietnam Pro", "sans-serif"],
        sans: ["Be Vietnam Pro", "sans-serif"],
      },
      borderRadius: { "DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px" },
    },
  },
  plugins: [],
}