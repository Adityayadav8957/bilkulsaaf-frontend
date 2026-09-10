import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import {
  getLeaderboard,
  getRisingPeople,
  LEADERBOARD_CATEGORIES,
  type LeaderboardCategory,
} from "@/lib/api/leaderboard";
import { PostCard } from "@/components/post/PostCard";
import { Chip } from "@/components/shared/Chip";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, JsonLd } from "@/lib/seo/jsonld";
import { ChipRowSkeleton, FeedSkeleton, SkeletonBar } from "@/components/shared/Skeletons";
import { formatCount } from "@/lib/format";

type Search = { category?: LeaderboardCategory };

const VALID_CATEGORIES = LEADERBOARD_CATEGORIES.map((c) => c.key);

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Leaderboard — Most Definitely Clean",
    description:
      "The most-voted, most-discussed, trending, and most-reported citizen reports on BilkulSaaf, plus the fastest-rising names.",
    path: "/leaderboard",
  });
}

type LeaderboardSearchParams = Promise<Search>;

/** Ranked posts for one category — public, cached (~60s, was `revalidate = 60`). */
async function getRankedPosts(category: LeaderboardCategory) {
  "use cache";
  cacheLife("minutes");

  return getLeaderboard(category, 25);
}

/** Fastest-rising names — independent of `?category=`, so it ships in the shell. */
async function getRising() {
  "use cache";
  cacheLife("minutes");

  return getRisingPeople(10);
}

/** `?category=` is request-time data, so it may only be read inside <Suspense>. */
async function resolveCategory(
  searchParams: LeaderboardSearchParams
): Promise<LeaderboardCategory> {
  const params = await searchParams;
  return VALID_CATEGORIES.includes(params.category as LeaderboardCategory)
    ? (params.category as LeaderboardCategory)
    : "most-voted";
}

async function CategoryChips({ searchParams }: { searchParams: LeaderboardSearchParams }) {
  const category = await resolveCategory(searchParams);

  return (
    <>
      {LEADERBOARD_CATEGORIES.map((c) => (
        <Chip key={c.key} href={`/leaderboard?category=${c.key}`} active={c.key === category}>
          {c.label}
        </Chip>
      ))}
    </>
  );
}

async function RankedPosts({ searchParams }: { searchParams: LeaderboardSearchParams }) {
  const category = await resolveCategory(searchParams);
  const posts = await getRankedPosts(category);
  const categoryLabel = LEADERBOARD_CATEGORIES.find((c) => c.key === category)?.label ?? category;

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          posts.map((post) => ({
            name: post.personSnapshot.name,
            path: `/posts/${post.slug || post._id}`,
          }))
        )}
      />
      {posts.length > 0 && (
        <div className="rule-red mt-6 overflow-hidden rounded-sm bg-ink p-5 text-white lg:mt-0">
          <p className="font-mono text-[11px] uppercase tracking-wide text-red">
            #1 {categoryLabel}
          </p>
          <p className="mt-1 font-serif text-lg font-bold">{posts[0].personSnapshot.name}</p>
          <p className="font-newsbody mt-1 text-sm text-white/80">{posts[0].description}</p>
          <div className="mt-3 flex gap-4 font-mono text-xs text-white/70">
            <span>{formatCount(posts[0].voteScore)} votes</span>
            <span>{formatCount(posts[0].commentCount)} comments</span>
          </div>
        </div>
      )}

      <section className="mt-8">
        {posts.length === 0 && (
          <EmptyState title="No posts here yet." subtitle="Suspiciously clean around here." />
        )}
        <ol className="space-y-4">
          {posts.slice(1).map((post, index) => (
            <li key={post._id} className="flex gap-3">
              <span className="w-6 flex-none pt-4 text-right font-serif text-sm font-bold text-meta-3">
                {index + 2}
              </span>
              <div className="min-w-0 flex-1">
                <PostCard post={post} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

/** Shape-matching stand-in for the #1 hero card plus the ranked list. */
function RankedPostsSkeleton() {
  return (
    <>
      <div className="rule-red mt-6 space-y-2 overflow-hidden rounded-sm bg-ink p-5 lg:mt-0">
        <SkeletonBar className="h-3 w-40 bg-white/15" />
        <SkeletonBar className="h-5 w-1/2 bg-white/20" />
        <SkeletonBar className="h-4 w-3/4 bg-white/10" />
      </div>
      <section className="mt-8">
        <FeedSkeleton count={3} />
      </section>
    </>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: LeaderboardSearchParams;
}) {
  const risingPeople = await getRising();

  return (
    <div className="px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Leaderboard" }]} />
      <h1>The leaderboard</h1>
      <p className="font-newsbody mt-2 max-w-xl text-text-muted">
        Ranked by the citizens, argued about by the citizens.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Suspense fallback={<ChipRowSkeleton count={LEADERBOARD_CATEGORIES.length} />}>
          <CategoryChips searchParams={searchParams} />
        </Suspense>
      </div>

      <div className="lg:mt-8 lg:flex lg:items-start lg:gap-7">
        <div className="min-w-0 max-w-3xl flex-1">
          <Suspense fallback={<RankedPostsSkeleton />}>
            <RankedPosts searchParams={searchParams} />
          </Suspense>

          {risingPeople.length > 0 && (
            <section className="mt-10">
              <h2>Rising names</h2>
              <ul className="mt-4 space-y-2">
                {risingPeople.map((person, index) => (
                  <li key={person._id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/people/${person.slug || person._id}`}
                      className="text-text-muted hover:text-red hover:underline"
                    >
                      #{index + 1} {person.name}
                    </Link>
                    <span className="font-mono text-xs text-meta-3">
                      {formatCount(person.stats.totalVotes)} votes
                    </span>
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
