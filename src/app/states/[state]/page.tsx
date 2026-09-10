import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { findCanonicalState } from "@/lib/geo";
import { getStateDetail } from "@/lib/api/map";
import { getFeed } from "@/lib/api/posts";
import { PostCard } from "@/components/post/PostCard";
import { StatTile } from "@/components/shared/StatTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, JsonLd } from "@/lib/seo/jsonld";
import { formatCount } from "@/lib/format";
import { slugify } from "@/lib/slug";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const canonical = await findCanonicalState(stateSlug);

  if (!canonical) {
    return buildMetadata({
      title: "State not found",
      description: "This state has no reports on file.",
      path: `/states/${stateSlug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: `Reports from ${canonical.state}`,
    description: `${formatCount(canonical.postCount)} anonymous citizen reports about public officials in ${canonical.state}, satirically rated on how definitely-clean they look.`,
    path: `/states/${slugify(canonical.state)}`,
  });
}

export default async function StateDetailPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: stateSlug } = await params;
  const canonical = await findCanonicalState(stateSlug);
  if (!canonical) notFound();

  const canonicalSlug = slugify(canonical.state);
  if (canonicalSlug !== stateSlug) redirect(`/states/${canonicalSlug}`);

  const [detail, feed] = await Promise.all([
    getStateDetail(canonical.state),
    getFeed({ state: canonical.state, sort: "latest", limit: 10 }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: canonical.state,
    address: { "@type": "PostalAddress", addressRegion: canonical.state, addressCountry: "IN" },
  };

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <JsonLd
        data={itemListJsonLd(
          detail.cities.map((city) => ({ name: city.city, path: `/cities/${slugify(city.city)}` }))
        )}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "States", href: "/states" },
          { label: canonical.state },
        ]}
      />
      <h1>{canonical.state}</h1>
      <p className="font-newsbody mt-2 max-w-xl text-text-muted">
        Every citizen report filed about a public official in {canonical.state}.
      </p>

      <div className="lg:flex lg:items-start lg:gap-7">
      <div className="min-w-0 max-w-3xl flex-1">

      <section className="mt-6 grid grid-cols-3 gap-3">
        <StatTile label="posts" value={formatCount(canonical.postCount)} />
        <StatTile label="votes" value={formatCount(canonical.voteCount)} />
        <StatTile label="comments" value={formatCount(canonical.commentCount)} />
      </section>

      {detail.cities.length > 0 && (
        <section className="mt-8">
          <h2>Cities in {canonical.state}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {detail.cities.map((city) => (
              <li key={city.city}>
                <Link
                  href={`/cities/${slugify(city.city)}`}
                  className="rounded-pill border border-border-5 px-3 py-1.5 text-sm text-text-muted hover:border-red/40 hover:bg-red-tint"
                >
                  {city.city} · {city.postCount}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2>Recent posts</h2>
        <div className="mt-4 space-y-4">
          {feed.items.length === 0 && (
            <EmptyState title="No posts here yet." subtitle="Suspiciously clean around here." />
          )}
          {feed.items.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </section>

      </div>

      <RightRail />
      </div>
    </div>
  );
}
