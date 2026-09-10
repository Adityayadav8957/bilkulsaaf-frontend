import "server-only";
import { listCities, listStates } from "./api/map";
import { slugify } from "./slug";
import type { CityAgg, StateAgg } from "./api/types";

/**
 * Resolves a /states/[state] URL segment back to its canonical, DB-cased
 * state string (e.g. "tamil-nadu" -> "Tamil Nadu"). /map/states returns every
 * state (unpaginated), so this is a single cheap request.
 */
export async function findCanonicalState(stateSlug: string): Promise<StateAgg | null> {
  const normalized = slugify(stateSlug);
  const states = await listStates();
  return states.find((s) => slugify(s.state) === normalized) ?? null;
}

/**
 * Resolves a /cities/[city] URL segment back to its canonical, DB-cased city
 * string. /map/cities is cursor-paginated, so this pages through it (capped,
 * mirroring the sitemap generator's own cap) rather than trusting the raw
 * param — the backend's /map/cities/:city echoes back whatever string it was
 * given, so it can't tell us the "real" casing on its own.
 */
export async function findCanonicalCity(
  citySlug: string,
  maxPages = 20
): Promise<CityAgg | null> {
  const normalized = slugify(citySlug);
  let cursor: string | undefined;
  for (let page = 0; page < maxPages; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const { items, nextCursor } = await listCities({ cursor, limit: 50 });
    const match = items.find((c) => slugify(c.city) === normalized);
    if (match) return match;
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return null;
}
