import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getFeed } from "@/lib/api/posts";
import { getRisingPeople } from "@/lib/api/leaderboard";
import { listStates } from "@/lib/api/map";
import { SearchIcon } from "@/components/icons";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { NearbyLocationPicker } from "@/components/explore/NearbyLocationPicker";
import { ListRowsSkeleton } from "@/components/shared/Skeletons";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatCount, formatRelativeTime, locationLabel } from "@/lib/format";

export const metadata: Metadata = buildMetadata({
  title: "Explore",
  description: "Trending reports, fast-rising names, and what's happening near you on BilkulSaaf.",
  path: "/explore",
});

type ExploreSearchParams = Promise<{ near?: string }>;

/**
 * Everything on Explore except the "Around you" section is public and
 * non-personalized, so it's cached (~60s, matching the old `revalidate = 60`)
 * and prerenders into the route's App Shell.
 */
async function getExploreData() {
  "use cache";
  cacheLife("minutes");

  const [trending, rising, states] = await Promise.all([
    getFeed({ sort: "trending", limit: 6 }),
    getRisingPeople(6),
    listStates(),
  ]);

  return { trending, rising, topStates: states.slice(0, 8).map((s) => s.state) };
}

/**
 * Rendered inside its own cached scope because `formatRelativeTime` reads
 * `Date.now()`, which can't be evaluated during a prerender unless the result
 * is captured in a cache entry (it expires with the entry, same as before).
 */
async function RecentPosts() {
  "use cache";
  cacheLife("minutes");

  const recent = await getFeed({ sort: "latest", limit: 6 });

  return (
    <div className="mt-4 flex flex-col gap-px overflow-hidden rounded-card border border-border-1 bg-border-1">
      {recent.items.map((post) => (
        <Link
          key={post._id}
          href={`/posts/${post.slug || post._id}`}
          className="flex gap-3 bg-white p-3.5"
        >
          <div className="texture-avatar h-10 w-10 flex-none rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{post.personSnapshot.name}</p>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-text-muted-2">
              {post.description}
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-meta-4">
              {formatCount(post.upvoteCount)} votes · {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Cached per state, so switching the picker is served from cache too. */
async function getNearbyFeed(state: string) {
  "use cache";
  cacheLife("minutes");

  return getFeed({ state, sort: "latest", limit: 4 });
}

/**
 * `?near=` is request-time data, so this section reads it inside <Suspense>
 * while the rest of the page ships in the shell.
 */
async function AroundYou({
  searchParams,
  topStates,
}: {
  searchParams: ExploreSearchParams;
  topStates: string[];
}) {
  const { near } = await searchParams;
  const nearbyState = near && topStates.includes(near) ? near : topStates[0];
  const nearby = nearbyState ? await getNearbyFeed(nearbyState) : null;

  if (!nearbyState || !nearby) return null;

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h2>Around you</h2>
        <NearbyLocationPicker states={topStates} selected={nearbyState} />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {nearby.items.length === 0 && (
          <p className="rounded-card border border-border-1 bg-white p-3.5 text-sm text-text-muted">
            No posts from {nearbyState} yet.
          </p>
        )}
        {nearby.items.map((post) => (
          <Link
            key={post._id}
            href={`/posts/${post.slug || post._id}`}
            className="rounded-card border border-border-1 bg-white p-3.5"
          >
            <p className="font-mono text-xs text-meta-2">
              {locationLabel(post.personSnapshot.state, post.personSnapshot.city)}
            </p>
            <p className="mt-1.5 text-[14.5px] leading-snug text-text">{post.description}</p>
            <p className="mt-2 font-mono text-[11.5px] text-meta-2">
              {formatCount(post.upvoteCount)} votes · {formatCount(post.commentCount)} comments
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}

export default async function ExplorePage({ searchParams }: { searchParams: ExploreSearchParams }) {
  const { trending, rising, topStates } = await getExploreData();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Explore" }]} />
      <h1 className="hidden sm:block">Explore</h1>
      <p className="font-newsbody mt-2 hidden max-w-xl text-text-muted sm:block">
        What&apos;s trending right now, the names rising fastest, and where the reports are
        coming from.
      </p>

      <Link
        href="/search"
        className="mt-1 flex h-[46px] items-center gap-2.5 rounded-2xl border border-border-2 bg-white px-3.5 text-sm text-meta-4 sm:hidden"
      >
        <SearchIcon size={16} />
        People, cities, departments…
      </Link>

      <div className="lg:mt-8 lg:flex lg:items-start lg:gap-7">
      <div className="min-w-0 max-w-3xl flex-1">
      <section className="mt-6 sm:mt-8 lg:mt-0">
        <div className="flex items-baseline justify-between">
          <h2>Trending now</h2>
          <span className="font-mono text-[11px] text-meta-2">this week</span>
        </div>
        <div className="hide-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {trending.items.map((post, index) => {
            const postHref = `/posts/${post.slug || post._id}`;
            const subline = [post.personSnapshot.designation, post.personSnapshot.organization]
              .filter(Boolean)
              .join(", ");
            return (
              <Link
                key={post._id}
                href={postHref}
                className="w-[220px] flex-none overflow-hidden rounded-card border border-border-1 bg-white"
              >
                {post.media.length > 0 && post.media[0].type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.media[0].url}
                    alt={`Photo evidence for report about ${post.personSnapshot.name}`}
                    className="h-[118px] w-full object-cover"
                  />
                ) : (
                  <div className="texture-media flex h-[118px] w-full items-center justify-center font-mono text-[10.5px] text-meta-3">
                    {post.media[0]?.type ?? "report"}
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-meta-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red" />#{index + 1} trending
                  </div>
                  <p className="mt-1.5 truncate text-[14.5px] font-semibold text-ink">
                    {post.personSnapshot.name}
                  </p>
                  {subline && <p className="mt-0.5 truncate text-xs text-meta-1">{subline}</p>}
                  <p className="mt-2 line-clamp-2 text-xs leading-snug text-text">
                    {post.description}
                  </p>
                  <p className="mt-2.5 font-mono text-[11px] text-meta-2">
                    {formatCount(post.upvoteCount)} votes · {formatCount(post.commentCount)}{" "}
                    comments
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-9">
        <h2>Rising names</h2>
        <div className="mt-4 flex flex-col gap-2">
          {rising.map((person, index) => {
            const subline = [person.designation, person.organization].filter(Boolean).join(", ");
            return (
              <Link
                key={person._id}
                href={`/people/${person.slug || person._id}`}
                className="flex items-center gap-3 rounded-card border border-border-1 bg-white p-3"
              >
                <span className="w-6 flex-none font-mono text-[13px] text-meta-5">
                  {index + 1}
                </span>
                <div className="texture-avatar h-9 w-9 flex-none rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold text-ink">{person.name}</p>
                  <p className="truncate text-xs text-meta-1">
                    {subline || locationLabel(person.location.state, person.location.city)}
                  </p>
                </div>
                <div className="flex-none text-right">
                  <p className="text-sm font-semibold text-ink">
                    {formatCount(person.stats.totalVotes)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-meta-2">
                    {person.stats.postsCount} posts
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {topStates.length > 0 && (
        <section id="around-you" className="mt-9">
          <Suspense
            fallback={
              <>
                <div className="flex items-baseline justify-between">
                  <h2>Around you</h2>
                </div>
                <div className="mt-4">
                  <ListRowsSkeleton count={4} />
                </div>
              </>
            }
          >
            <AroundYou searchParams={searchParams} topStates={topStates} />
          </Suspense>
        </section>
      )}

      <section className="mt-9 mb-0">
        <h2>Recent posts</h2>
        <RecentPosts />
      </section>
      </div>

      <RightRail />
      </div>
    </div>
  );
}
