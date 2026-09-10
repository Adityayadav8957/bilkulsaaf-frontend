import Link from "next/link";
import type { Metadata } from "next";
import { getFeed } from "@/lib/api/posts";
import { listCities, listStates } from "@/lib/api/map";
import { GuestGatedFeed } from "@/components/post/GuestGatedFeed";
import { StatTile } from "@/components/shared/StatTile";
import { FeedChips } from "@/components/shared/FeedChips";
import { GuestBanner } from "@/components/shared/GuestBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { RightRail } from "@/components/layout/RightRail";
import { buildMetadata, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/metadata";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { formatCount } from "@/lib/format";
import type { FeedSort } from "@/lib/api/types";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "A satirical public feed where anonymous citizens post about public officials, vote on how definitely-clean it looks, and argue about it in the comments. Browse reports by person, state, city, or the leaderboard.",
  path: "/",
});

const VALID_SORTS: FeedSort[] = ["latest", "popular", "discussed", "trending"];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: rawSort } = await searchParams;
  const sort: FeedSort = VALID_SORTS.includes(rawSort as FeedSort) ? (rawSort as FeedSort) : "latest";

  const [feed, states, cities] = await Promise.all([
    getFeed({ sort, limit: 8 }),
    listStates(),
    listCities({ limit: 50 }),
  ]);

  const totalPosts = states.reduce((sum, s) => sum + s.postCount, 0);
  const totalVotesCast = states.reduce((sum, s) => sum + s.voteCount, 0);

  return (
    <div className="px-4 pt-3 pb-10 sm:px-6 sm:pt-10">
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />

      <section className="max-w-3xl overflow-hidden rounded-md border border-[#2e2d29] bg-ink pb-0 lg:max-w-none">
        <span className="flex items-center gap-1.5 bg-red px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white lg:px-5">
          The people&apos;s dispatch · Vol. II
        </span>
        <h1 className="mt-0 max-w-[650px] px-5 pt-9 font-serif text-[clamp(38px,10vw,60px)] leading-[0.94] text-white lg:px-7 lg:pt-10">
          India, <em className="text-red not-italic">unfiltered.</em> Anonymous by design.
        </h1>
        <p className="font-newsbody mt-5 max-w-[600px] px-5 text-base leading-relaxed text-white/70 sm:text-lg lg:px-7 lg:text-[15px]">
          A satirical public feed where citizens post what they&apos;ve seen, vote on how
          definitely-clean it looks, and argue about it in the comments. Anonymously. Always.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 border-t border-white/15 px-5 py-4 lg:px-7">
          <Link
            href="/create"
            className="rounded-sm bg-red px-5 py-3 font-serif text-sm font-bold text-white"
          >
            Post anonymously
          </Link>
          <Link
            href="/posts"
            className="rounded-sm border border-white/30 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            Just let me scroll
          </Link>
        </div>
      </section>

      <section className="hidden mt-8 grid-cols-2 gap-3 sm:grid sm:grid-cols-4 lg:hidden">
        <StatTile label="posts filed by citizens" value={formatCount(totalPosts)} />
        <StatTile label="states with activity" value={states.length} />
        <StatTile label="community votes cast" value={formatCount(totalVotesCast)} />
        <StatTile label="cities represented" value={formatCount(cities.items.length)} />
      </section>

      <section className="mt-0 sm:mt-12 lg:mt-8 lg:flex lg:items-start lg:gap-7">
        <div className="min-w-0 flex-1">
          <h2 className="hidden sm:block lg:font-serif lg:text-[22px]">The dispatches</h2>
          <div className="sticky top-16 z-30 -mx-4 mt-3 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-[108px] lg:mx-0 lg:border-b-2 lg:border-ink lg:px-0 lg:py-3">
            <FeedChips basePath="/" activeSort={sort} />
          </div>

          <div className="mt-4">
            <GuestBanner />
          </div>

          {feed.items.length === 0 ? (
            <EmptyState
              title="No posts here yet."
              subtitle="Suspiciously clean around here."
            />
          ) : (
            <GuestGatedFeed
              posts={feed.items}
              hasMore={!!feed.nextCursor}
              nextHref={null}
              totalCount={totalPosts}
            />
          )}
        </div>

        <RightRail />
      </section>
    </div>
  );
}
