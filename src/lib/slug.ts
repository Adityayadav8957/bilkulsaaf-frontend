/**
 * Frontend-side slugify for /states/[state] and /cities/[city] path segments.
 * State/city are free-text on the backend (no canonical slug field there),
 * so this is only used to build/compare URL segments — the actual matching
 * against the API is always case-insensitive exact-string on the backend.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
