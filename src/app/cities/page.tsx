import Link from "next/link";
import type { Metadata } from "next";
import { listCities } from "@/lib/api/map";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { NextPageLink, withCursor } from "@/components/shared/NextPageLink";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, JsonLd } from "@/lib/seo/jsonld";
import { formatCount } from "@/lib/format";
import { slugify } from "@/lib/slug";

export const revalidate = 300;

type Search = { cursor?: string };

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Browse Reports by City",
    description:
      "Every city with an active citizen report on BilkulSaaf, ranked by how much activity it's seen.",
    path: "/cities",
  });
}

export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const result = await listCities({ cursor: params.cursor, limit: 50 });

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd
        data={itemListJsonLd(
          result.items.map((city) => ({ name: city.city, path: `/cities/${slugify(city.city)}` }))
        )}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cities" }]} />
      <h1>Cities on the register</h1>
      <p className="font-newsbody mt-2 max-w-xl text-text-muted">
        Every city with a citizen report, ranked by how much activity it&apos;s seen.
      </p>

      <div className="lg:mt-8 lg:flex lg:items-start lg:gap-7">
        <div className="min-w-0 max-w-3xl flex-1">
          <ul className="mt-6 space-y-2 lg:mt-0">
            {result.items.length === 0 && (
              <EmptyState title="No posts here yet." subtitle="Suspiciously clean around here." />
            )}
            {result.items.map((city) => (
              <li key={city.city}>
                <Link
                  href={`/cities/${slugify(city.city)}`}
                  className="flex items-center justify-between rounded-card border border-border-3 bg-white px-4 py-3 hover:border-red/40"
                >
                  <span className="font-medium text-ink">{city.city}</span>
                  <span className="font-mono text-xs text-meta-2">
                    {formatCount(city.postCount)} posts · {formatCount(city.voteCount)} votes
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <NextPageLink href={withCursor(params, result.nextCursor)} />
        </div>

        <RightRail />
      </div>
    </div>
  );
}
