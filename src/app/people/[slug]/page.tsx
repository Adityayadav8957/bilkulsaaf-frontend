import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPersonBySlugOrId, listPeople } from "@/lib/api/people";
import { isNotFoundError } from "@/lib/api/http";
import { PostCard } from "@/components/post/PostCard";
import { StatTile } from "@/components/shared/StatTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { NextPageLink, withCursor } from "@/components/shared/NextPageLink";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/jsonld";
import { locationLabel } from "@/lib/format";
import type { Person } from "@/lib/api/types";

export const revalidate = 300;

async function loadPerson(idOrSlug: string, cursor?: string) {
  try {
    return await getPersonBySlugOrId(idOrSlug, { cursor, limit: 20 });
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

function personJsonLd(person: Person) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.designation || undefined,
    worksFor: person.organization ? { "@type": "Organization", name: person.organization } : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: person.location.city || undefined,
      addressRegion: person.location.state,
      addressCountry: "IN",
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadPerson(slug);

  if (!result) {
    return buildMetadata({
      title: "Person not found",
      description: "This person could not be found on the register.",
      path: `/people/${slug}`,
      noindex: true,
    });
  }

  const { person } = result;
  const titleParts = [person.name, person.designation].filter(Boolean).join(", ");
  const description = `${person.name}${person.designation ? `, ${person.designation}` : ""}${
    person.organization ? ` at ${person.organization}` : ""
  } — ${person.stats.postsCount} citizen report${person.stats.postsCount === 1 ? "" : "s"} filed in ${locationLabel(
    person.location.state,
    person.location.city
  )}.`;

  return buildMetadata({
    title: titleParts,
    description,
    path: `/people/${person.slug || person._id}`,
  });
}

export default async function PersonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { slug } = await params;
  const { cursor } = await searchParams;
  const result = await loadPerson(slug, cursor);
  if (!result) notFound();

  const { person, posts } = result;

  const related = await listPeople({ city: person.location.city, limit: 4 });
  const relatedPeople = related.items.filter((p) => p._id !== person._id).slice(0, 3);

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd data={personJsonLd(person)} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "People", href: "/people" },
          { label: person.name },
        ]}
      />

      <div className="lg:flex lg:items-start lg:gap-7">
      <div className="min-w-0 max-w-3xl flex-1">

      <div className="flex items-start gap-4">
        {person.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.photoUrl} alt="" className="h-16 w-16 flex-none rounded-full object-cover" />
        ) : (
          <div aria-hidden="true" className="texture-avatar h-16 w-16 flex-none rounded-full" />
        )}
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight sm:text-3xl">{person.name}</h1>
          <p className="mt-1 text-text-muted">
            {[person.designation, person.organization].filter(Boolean).join(", ")}
          </p>
          <p className="text-sm text-meta-2">
            {locationLabel(person.location.state, person.location.city)}
          </p>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <StatTile label="posts" value={person.stats.postsCount} />
        <StatTile label="votes" value={person.stats.totalVotes} />
        <StatTile label="comments" value={person.stats.totalComments} />
      </section>

      <section className="mt-10">
        <h2>Recent posts</h2>
        <div className="mt-4 space-y-4">
          {posts.items.length === 0 && (
            <EmptyState title="No posts here yet." subtitle="Suspiciously clean around here." />
          )}
          {posts.items.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
        <NextPageLink href={withCursor({ cursor }, posts.nextCursor)} />
      </section>

      {relatedPeople.length > 0 && (
        <section className="mt-10">
          <h2>Related names</h2>
          <ul className="mt-4 space-y-2">
            {relatedPeople.map((p) => (
              <li key={p._id}>
                <Link
                  href={`/people/${p.slug || p._id}`}
                  className="text-sm text-text-muted hover:text-red hover:underline"
                >
                  {p.name}
                  {p.designation ? ` — ${p.designation}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      </div>

      <RightRail />
      </div>
    </div>
  );
}
