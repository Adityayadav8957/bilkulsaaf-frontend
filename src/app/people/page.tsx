import type { Metadata } from "next";
import { listPeople } from "@/lib/api/people";
import { PersonCard } from "@/components/person/PersonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { NextPageLink, withCursor } from "@/components/shared/NextPageLink";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, JsonLd } from "@/lib/seo/jsonld";

export const revalidate = 300;

type Search = { q?: string; state?: string; city?: string; cursor?: string };

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "People & Officials Named",
    description:
      "Every public official and person named in a citizen report on BilkulSaaf, ranked by community votes.",
    path: "/people",
  });
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const result = await listPeople({
    q: params.q,
    state: params.state,
    city: params.city,
    cursor: params.cursor,
    limit: 24,
  });

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd
        data={itemListJsonLd(
          result.items.map((person) => ({
            name: person.name,
            path: `/people/${person.slug || person._id}`,
          }))
        )}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "People" }]} />
      <h1>People on the register</h1>
      <p className="font-newsbody mt-2 max-w-xl text-text-muted">
        Every public official named in a citizen report, ranked by community votes.
      </p>

      <div className="lg:mt-8 lg:flex lg:items-start lg:gap-7">
        <div className="min-w-0 max-w-4xl flex-1">
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-0">
            {result.items.length === 0 && (
              <div className="sm:col-span-2">
                <EmptyState title="No one on file yet." subtitle="Suspiciously clean around here." />
              </div>
            )}
            {result.items.map((person) => (
              <PersonCard key={person._id} person={person} />
            ))}
          </div>

          <NextPageLink href={withCursor(params, result.nextCursor)} />
        </div>

        <RightRail />
      </div>
    </div>
  );
}
