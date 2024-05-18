/**
 * It is a helper to check if it's not in production environment.
 * If you're developing, and not using vercel, you can add your own condition.
 */
export const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.VERCEL_ENV === "development" ||
  process.env.VERCEL_ENV === "preview";
