"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { NextPageLink } from "@/components/shared/NextPageLink";
import { PostCard } from "./PostCard";
import type { Post } from "@/lib/api/types";

const GUEST_POST_LIMIT = 4;

/**
 * Renders a post feed that lets guests preview the first few posts and then
 * hits them with a login wall instead of "Load more" — mirrors GuestBanner's
 * client-side useAuth() check so it works alongside the pages' cached SSR
 * fetch (which always fetches the full page for cacheability).
 */
export function GuestGatedFeed({
  posts,
  hasMore,
  nextHref,
  totalCount,
}: {
  posts: Post[];
  hasMore: boolean;
  nextHref: string | null;
  /** Total posts across the whole feed, if known — used to show "N more posts behind this". */
  totalCount?: number;
}) {
  const { user, loading } = useAuth();
  const unlocked = !loading && !!user;
  const gated = !unlocked && (posts.length > GUEST_POST_LIMIT || hasMore);
  const visiblePosts = gated ? posts.slice(0, GUEST_POST_LIMIT) : posts;
  const remaining =
    totalCount !== undefined ? Math.max(totalCount - visiblePosts.length, 0) : null;

  return (
    <>
      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {gated ? (
        <div className="mt-4 rounded-card border border-border-3 bg-gradient-to-b from-white to-border-4 p-8 text-center">
          <p className="text-lg font-bold text-ink">That&apos;s the free sample.</p>
          <p className="mt-2 text-text-muted">
            {remaining
              ? `There are ${remaining.toLocaleString()} more posts behind this. Log in to keep scrolling.`
              : "There are more posts behind this. Log in to keep scrolling."}
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-pill bg-ink px-6 py-3 text-sm font-semibold text-white"
          >
            Want to join the chaos?
          </Link>
        </div>
      ) : (
        <NextPageLink href={nextHref} />
      )}
    </>
  );
}
