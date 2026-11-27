// Public site address, without a trailing slash.
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://cavaleirosdafrancesinha.com").replace(/\/$/, "");
}
