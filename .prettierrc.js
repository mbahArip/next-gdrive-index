"use strict";
module.exports = {
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
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

  tailwindAttributes: ["classNames", "wrapperClassName", "rootClassName"],
  tailwindFunctions: ["twsx", "cn"],
  tailwindConfig: "./tailwind.config.ts",

  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^~/components/(.*)$",
    "^~/(utils|hooks|context)/(.*)$",
    "^~/types/(.*)$",
    "^~/(config|styles)/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
