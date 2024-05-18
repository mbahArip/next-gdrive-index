import config from "config";

export function formatFooter(text: string[]): string {
  return text
    .join("\n")
    .replaceAll("{{ year }}", new Date().getFullYear().toString())
    .replaceAll("{{ repository }}", "[Repository](https://github.com/mbaharip/next-gdrive-index)")
    .replaceAll("{{ author }}", config.siteConfig.siteAuthor || "mbaharip")
    .replaceAll("{{ version }}", config.version || "0.0.0")
    .replaceAll("{{ siteName }}", config.siteConfig.siteName)
    .replaceAll("{{ handle }}", config.siteConfig.twitterHandle || "@__mbaharip__")
    .replaceAll("{{ creator }}", "mbaharip");
}
