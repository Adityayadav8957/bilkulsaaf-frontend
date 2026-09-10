import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

// Login/Profile/Create Post/Search are noindex (see each page's own metadata)
// but are deliberately NOT disallowed here — blocking crawl would stop
// Google from ever seeing the noindex tag in the first place, which can
// paradoxically leave a bare URL indexed with no snippet. noindex is the
// correct de-indexing mechanism; robots.txt is reserved for paths that
// should never be crawled at all, and this app has none.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
