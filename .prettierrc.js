"use strict";
const tailwindConfig = require("prettier-plugin-tailwindcss");

module.exports = {
  plugins: [tailwindConfig],
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "consistent",
  jsxSingleQuote: true,
  trailingComma: "all",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: "always",
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  endOfLine: "lf",
  embeddedLanguageFormatting: "auto",
  singleAttributePerLine: true,
};
