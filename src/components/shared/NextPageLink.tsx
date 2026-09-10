import Link from "next/link";

export function NextPageLink({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <div className="mt-6 flex justify-center">
      <Link
        href={href}
        className="rounded-pill border border-border-5 px-4 py-2 text-sm font-medium text-text-muted hover:bg-border-4"
      >
        Load more →
      </Link>
    </div>
  );
}

/** Builds a same-path href with `cursor` swapped to `nextCursor`, preserving other query params. */
export function withCursor(
  searchParams: Record<string, string | string[] | undefined>,
  nextCursor: string | null
): string | null {
  if (!nextCursor) return null;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "cursor" || value === undefined) continue;
    usp.set(key, Array.isArray(value) ? value[0] : value);
  }
  usp.set("cursor", nextCursor);
  return `?${usp.toString()}`;
}
