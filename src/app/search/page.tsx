import type { Metadata } from "next";
import { search } from "@/lib/api/search";
import { SearchBox } from "@/components/search/SearchBox";
import { PostCard } from "@/components/post/PostCard";
import { PersonCard } from "@/components/person/PersonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { RightRail } from "@/components/layout/RightRail";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search people, cities, organisations, and posts.",
  path: "/search",
  noindex: true,
});

export const dynamic = "force-dynamic";

type SearchType = "all" | "posts" | "people";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: SearchType }>;
}) {
  const { q = "", type = "all" } = await searchParams;
  const result = q
    ? await search(q, type)
    : { posts: [], people: [], organizations: [], locations: [] };

  const noResults = q && result.posts.length === 0 && result.people.length === 0;

  return (
    <div className="px-4 py-10 sm:px-6">
      <h1>Search</h1>

      <div className="lg:flex lg:items-start lg:gap-7">
        <div className="min-w-0 max-w-3xl flex-1">
          <SearchBox initialQuery={q} initialType={type} />

          {noResults && (
            <div className="mt-8">
              <EmptyState
                title="No results found."
                subtitle="Even our anonymous citizens couldn't find anything."
              />
            </div>
          )}

          {result.people.length > 0 && (
            <section className="mt-8">
              <h2>People</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {result.people.map((person) => (
                  <PersonCard key={person._id} person={person} />
                ))}
              </div>
            </section>
          )}

          {result.posts.length > 0 && (
            <section className="mt-8">
              <h2>Posts</h2>
              <div className="mt-4 space-y-4">
                {result.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>

        <RightRail />
      </div>
    </div>
  );
}
