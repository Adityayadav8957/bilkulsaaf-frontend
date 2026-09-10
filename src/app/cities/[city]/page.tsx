import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { findCanonicalCity } from "@/lib/geo";
import { getFeed } from "@/lib/api/posts";
import { PostCard } from "@/components/post/PostCard";
import { StatTile } from "@/components/shared/StatTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/jsonld";
import { formatCount } from "@/lib/format";
import { slugify } from "@/lib/slug";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const canonical = await findCanonicalCity(citySlug);

  if (!canonical) {
    return buildMetadata({
      title: "City not found",
      description: "This city has no reports on file.",
      path: `/cities/${citySlug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: `Reports from ${canonical.city}`,
    description: `${formatCount(canonical.postCount)} anonymous citizen reports about public officials in ${canonical.city}, satirically rated on how definitely-clean they look.`,
    path: `/cities/${slugify(canonical.city)}`,
  });
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const canonical = await findCanonicalCity(citySlug);
  if (!canonical) notFound();

  const canonicalSlug = slugify(canonical.city);
  if (canonicalSlug !== citySlug) redirect(`/cities/${canonicalSlug}`);

  const feed = await getFeed({ city: canonical.city, sort: "latest", limit: 15 });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: canonical.city,
    address: { "@type": "PostalAddress", addressLocality: canonical.city, addressCountry: "IN" },
  };

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/cities" },
          { label: canonical.city },
        ]}
      />
      <h1>{canonical.city}</h1>
      <p className="font-newsbody mt-2 max-w-xl text-text-muted">
        Every citizen report filed about a public official in {canonical.city}.
      </p>

      <div className="lg:flex lg:items-start lg:gap-7">
      <div className="min-w-0 max-w-3xl flex-1">

      <section className="mt-6 grid grid-cols-3 gap-3">
        <StatTile label="posts" value={formatCount(canonical.postCount)} />
        <StatTile label="votes" value={formatCount(canonical.voteCount)} />
        <StatTile label="comments" value={formatCount(canonical.commentCount)} />
      </section>

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
