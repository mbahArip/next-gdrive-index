const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-exo2)", ...defaultTheme.fontFamily.sans],
        docs: ["var(--font-source-sans-pro", ...defaultTheme.fontFamily.sans],
        code: ["var(--font-jetbrains-mono)", ...defaultTheme.fontFamily.mono],
      },
      screens: {
        mobile: "320px",
        tablet: "768px",
        desktop: "1024px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "checkerboard":
          "repeating-linear-gradient(45deg, #71717a, #71717a 25%, #52525b 25%, #52525b 50%)", // zinc-500 - zinc-600
        "checkerboard-dark":
          "repeating-linear-gradient(45deg, #71717a, #71717a 25%, #a1a1aa 25%, #a1a1aa 50%)", // zinc-500 - zinc-400
      },
      backgroundSize: {
        checkerboard: "128px 128px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
