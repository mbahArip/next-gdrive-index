import { z } from "zod";
import pkg from "~/../package.json";

import { Schema_Theme } from "~/types/schema";

const template = `/* Version: ${pkg.version} */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Shadcn/ui theme */
@layer base {
  :root {
{{lightTheme}}
  }

  .dark {
{{darkTheme}}
  }

  div.preview * {
    @apply !transition-none;
  }
}

html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
@layer base {
  :root {
    @apply text-[100%];
  }
  body {
    @apply bg-background text-foreground;
  }

  ::-webkit-scrollbar {
    @apply h-1.5 w-1.5;
  }
  ::-webkit-scrollbar-track {
    @apply bg-primary/5;
  }
  ::-webkit-scrollbar-thumb {
    @apply rounded-full bg-primary/25 hover:bg-primary/50;
  }

  /* Typography */
  h1 {
    @apply scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl;
  }
  h2 {
    @apply scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0;
  }
  h3 {
    @apply scroll-m-20 text-2xl font-semibold tracking-tight;
  }
  h4 {
    @apply scroll-m-20 text-xl font-semibold tracking-tight;
  }
  .paragraph {
    @apply leading-7 [&:not(:first-child)]:mt-6;
  }
  blockquote {
    @apply mt-6 border-l-2 pl-6 italic;
  }
  ul {
    @apply my-6 ml-6 list-disc [&>li]:mt-2;
  }
  .lead {
    @apply text-xl text-muted-foreground;
  }
  .large {
    @apply text-lg font-semibold;
  }
  .muted {
    @apply text-sm text-muted-foreground;
  }
  small {
    @apply text-sm font-medium leading-none;
  }
}
`;

export function generateTheme(theme: Record<"light" | "dark", z.input<typeof Schema_Theme>>) {
  const lightTheme = Object.entries(theme.light)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join("\n");
  const darkTheme = Object.entries(theme.dark)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join("\n");

  return template.replace("{{lightTheme}}", lightTheme).replace("{{darkTheme}}", darkTheme);
}
