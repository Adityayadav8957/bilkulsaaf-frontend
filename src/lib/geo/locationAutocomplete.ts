"use client";

// Photon (komoot's OSM-backed geocoder) does real prefix/type-ahead matching
// ("pun" -> Pune) — plain Nominatim /search doesn't, it only matches on full
// tokens. Both are free, keyless, and OSM-licensed (ODbL) — attribute it in
// the UI wherever suggestions from this file are shown.
const PHOTON_BASE = "https://photon.komoot.io/api/";
// Roughly bounds India so results stay in-region; countrycode is still
// checked per-result since a bbox alone can catch neighbouring borders.
const INDIA_BBOX = "68,6,97.5,37.5";

export type PlaceSuggestion = { label: string; state: string; city: string };

type PhotonFeature = {
  properties: {
    countrycode?: string;
    type?: string;
    name?: string;
    state?: string;
  };
};

async function photonSearch(query: string): Promise<PhotonFeature[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmed,
    lang: "en",
    limit: "10",
    bbox: INDIA_BBOX,
  });

  const res = await fetch(`${PHOTON_BASE}?${params.toString()}`);
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { features?: PhotonFeature[] } | null;
  return json?.features ?? [];
}

export async function searchIndianStates(query: string): Promise<PlaceSuggestion[]> {
  const features = await photonSearch(query);
  const seen = new Set<string>();
  const results: PlaceSuggestion[] = [];
  for (const { properties: p } of features) {
    if (p.countrycode !== "IN" || p.type !== "state" || !p.name || seen.has(p.name)) continue;
    seen.add(p.name);
    results.push({ label: p.name, state: p.name, city: "" });
  }
  return results.slice(0, 6);
}

export async function searchIndianCities(query: string): Promise<PlaceSuggestion[]> {
  const features = await photonSearch(query);
  const seen = new Set<string>();
  const results: PlaceSuggestion[] = [];
  for (const { properties: p } of features) {
    if (p.countrycode !== "IN" || !p.name || !p.state) continue;
    if (!["city", "town", "village"].includes(p.type ?? "")) continue;
    const key = `${p.name}|${p.state}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ label: `${p.name}, ${p.state}`, state: p.state, city: p.name });
  }
  return results.slice(0, 6);
}
