import Link from "next/link";
import type { Metadata } from "next";
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
import { formatCount } from "@/lib/format";

export const revalidate = 60;

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

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const category: LeaderboardCategory = VALID_CATEGORIES.includes(
    params.category as LeaderboardCategory
  )
    ? (params.category as LeaderboardCategory)
    : "most-voted";

  const [posts, risingPeople] = await Promise.all([
    getLeaderboard(category, 25),
    getRisingPeople(10),
  ]);

  const categoryLabel = LEADERBOARD_CATEGORIES.find((c) => c.key === category)?.label ?? category;

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd
        data={itemListJsonLd(
          posts.map((post) => ({
            name: post.personSnapshot.name,
            path: `/posts/${post.slug || post._id}`,
          }))
        )}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Leaderboard" }]} />
      <h1>The leaderboard</h1>
      <p className="font-newsbody mt-2 max-w-xl text-text-muted">
        Ranked by the citizens, argued about by the citizens.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {LEADERBOARD_CATEGORIES.map((c) => (
          <Chip key={c.key} href={`/leaderboard?category=${c.key}`} active={c.key === category}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="lg:mt-8 lg:flex lg:items-start lg:gap-7">
        <div className="min-w-0 max-w-3xl flex-1">
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
