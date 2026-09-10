import type { MetadataRoute } from "next";
import { getFeed } from "@/lib/api/posts";
import { listPeople } from "@/lib/api/people";
import { listCities, listStates } from "@/lib/api/map";
import { absoluteUrl } from "@/lib/seo/metadata";
import { slugify } from "@/lib/slug";

// Regenerate at most once an hour — the sitemap doesn't need to reflect a
// single new post instantly, and this bounds how often we page through
// every resource below.
export const revalidate = 3600;

// The backend's cursor pagination never reports a total count, so each
// collector pages until it runs out of cursor or hits this safety cap.
const MAX_URLS_PER_RESOURCE = 5000;
const PAGE_LIMIT = 50;

async function collectPostUrls(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  let cursor: string | undefined;
  while (urls.length < MAX_URLS_PER_RESOURCE) {
    // eslint-disable-next-line no-await-in-loop
    const { items, nextCursor } = await getFeed({ sort: "latest", cursor, limit: PAGE_LIMIT });
    for (const post of items) {
      urls.push({
        url: absoluteUrl(`/posts/${post.slug || post._id}`),
        lastModified: post.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return urls;
}

async function collectPeopleUrls(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  let cursor: string | undefined;
  while (urls.length < MAX_URLS_PER_RESOURCE) {
    // eslint-disable-next-line no-await-in-loop
    const { items, nextCursor } = await listPeople({ cursor, limit: PAGE_LIMIT });
    for (const person of items) {
      urls.push({
        url: absoluteUrl(`/people/${person.slug || person._id}`),
        lastModified: person.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return urls;
}

async function collectStateUrls(): Promise<MetadataRoute.Sitemap> {
  const states = await listStates();
  return states.map((state) => ({
    url: absoluteUrl(`/states/${slugify(state.state)}`),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

async function collectCityUrls(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  let cursor: string | undefined;
  while (urls.length < MAX_URLS_PER_RESOURCE) {
    // eslint-disable-next-line no-await-in-loop
    const { items, nextCursor } = await listCities({ cursor, limit: PAGE_LIMIT });
    for (const city of items) {
      urls.push({
        url: absoluteUrl(`/cities/${slugify(city.city)}`),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1.0 },
    { url: absoluteUrl("/posts"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/people"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/states"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/cities"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/leaderboard"), changeFrequency: "hourly", priority: 0.9 },
  ];

  // Login, Profile, Create Post, and Search are intentionally excluded here —
  // they're noindex (see each page's own metadata) and never belong in a
  // sitemap even though robots.txt still allows crawling them.
  const [postUrls, peopleUrls, stateUrls, cityUrls] = await Promise.all([
    collectPostUrls(),
    collectPeopleUrls(),
    collectStateUrls(),
    collectCityUrls(),
  ]);

  return [...staticUrls, ...postUrls, ...peopleUrls, ...stateUrls, ...cityUrls];
}
