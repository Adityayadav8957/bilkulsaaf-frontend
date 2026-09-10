import type { Metadata } from "next";
import { getFeed } from "@/lib/api/posts";
import { GuestGatedFeed } from "@/components/post/GuestGatedFeed";
import { FeedChips } from "@/components/shared/FeedChips";
import { GuestBanner } from "@/components/shared/GuestBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { withCursor } from "@/components/shared/NextPageLink";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, JsonLd } from "@/lib/seo/jsonld";
import type { FeedSort } from "@/lib/api/types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Search = { sort?: FeedSort; state?: string; city?: string; cursor?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { state, city } = await searchParams;
  const scope = city || state;
  const title = scope ? `Reports from ${scope} · Latest Reports` : "Latest Reports";
  const description = scope
    ? `Anonymous citizen reports about public officials in ${scope}, satirically rated on how definitely-clean they look.`
    : "Every anonymous citizen report on BilkulSaaf, newest first — vote on how definitely-clean it looks and argue in the comments.";

  return buildMetadata({ title, description, path: "/posts" });
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const sort = params.sort || "latest";
  const feed = await getFeed({
    sort,
    state: params.state,
    city: params.city,
    cursor: params.cursor,
    limit: 20,
  });

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd
        data={itemListJsonLd(
          feed.items.map((post) => ({
            name: post.personSnapshot.name,
            path: `/posts/${post.slug || post._id}`,
          }))
        )}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Posts" }]} />
      <h1>Latest reports</h1>
      <p className="font-newsbody mt-2 max-w-xl text-text-muted">
        Every anonymous citizen report, newest first. Vote on how definitely-clean it
        looks, then argue about it in the comments.
      </p>

      <div className="lg:mt-6 lg:flex lg:items-start lg:gap-7">
        <div className="min-w-0 max-w-3xl flex-1">
          <div className="sticky top-16 z-30 -mx-4 mt-6 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-0 lg:px-0">
            <FeedChips basePath="/posts" activeSort={sort} />
          </div>

          <div className="mt-4">
            <GuestBanner />
          </div>

          {feed.items.length === 0 ? (
            <EmptyState title="No posts here yet." subtitle="Suspiciously clean around here." />
          ) : (
            <GuestGatedFeed
              posts={feed.items}
              hasMore={!!feed.nextCursor}
              nextHref={withCursor(params, feed.nextCursor)}
            />
          )}
        </div>

        <RightRail />
      </div>
    </div>
  );
}
