import type { Metadata } from "next";

export const SITE_NAME = "BilkulSaaf";
export const SITE_TAGLINE = "definitely · clean";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Builds a page's <title>/description/canonical/OG/Twitter metadata from one
 * shared shape, so every SEO page (and only those pages) gets the full set
 * instead of hand-rolling it per route.
 */
export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
  image,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || "/opengraph-image");

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Truncates text on a word boundary for use in <title>/description tags. */
export function truncate(text: string, maxLength: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : maxLength)}…`;
}
