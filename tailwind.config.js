const defaultColors = require("tailwindcss/colors");

const colors = {
  inherit: "inherit",
  transparent: "transparent",
  white: "#ffffff",
  black: "#000000",
  primary: defaultColors.neutral,
  accent: {
    50: "rgb(var(--accent-50) / <alpha-value>)",
    100: "rgb(var(--accent-100) / <alpha-value>)",
    200: "rgb(var(--accent-200) / <alpha-value>)",
    300: "rgb(var(--accent-300) / <alpha-value>)",
    400: "rgb(var(--accent-400) / <alpha-value>)",
    500: "rgb(var(--accent-500) / <alpha-value>)",
    600: "rgb(var(--accent-600) / <alpha-value>)",
    700: "rgb(var(--accent-700) / <alpha-value>)",
    800: "rgb(var(--accent-800) / <alpha-value>)",
    900: "rgb(var(--accent-900) / <alpha-value>)",
    950: "rgb(var(--accent-950) / <alpha-value>)",
  },

  success: {
    ...defaultColors.emerald,
    main: defaultColors.emerald[600],
    hover: defaultColors.emerald[500],
    active: defaultColors.emerald[700],
    text: defaultColors.emerald[50],
  },
  warning: {
    ...defaultColors.amber,
    main: defaultColors.amber[600],
    hover: defaultColors.amber[500],
    active: defaultColors.amber[700],
    text: defaultColors.amber[50],
  },
  danger: {
    ...defaultColors.red,
    main: defaultColors.red[600],
    hover: defaultColors.red[500],
    active: defaultColors.red[700],
    text: defaultColors.red[50],
  },
  info: {
    ...defaultColors.blue,
    main: defaultColors.blue[600],
    hover: defaultColors.blue[500],
    active: defaultColors.blue[700],
    text: defaultColors.blue[50],
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    colors,
    extend: {
      minHeight: {
        dynamic: "100dvh",
      },
      minWidth: {
        dynamic: "100dvw",
      },
      height: {
        dynamic: "100dvh",
      },
      width: {
        dynamic: "100dvw",
      },
      screens: {
        mobile: "320px",
        tablet: "768px",
        desktop: "1280px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "checkerboard": "repeating-linear-gradient(45deg, #71717a, #71717a 25%, #52525b 25%, #52525b 50%)", // zinc-500 - zinc-600
        "checkerboard-dark": "repeating-linear-gradient(45deg, #71717a, #71717a 25%, #a1a1aa 25%, #a1a1aa 50%)", // zinc-500 - zinc-400
      },
      backgroundSize: {
        checkerboard: "128px 128px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".transition-smooth": {
          transitionDuration: "250ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
