/**
 * Suspense fallbacks for the Cache Components streaming boundaries.
 *
 * Under `cacheComponents`, each route ships a prerendered App Shell instantly
 * and streams the request-time parts in behind <Suspense>. These skeletons
 * stand in for that streaming content, so the shell paints something with the
 * same shape as the real UI instead of a full-page spinner.
 */

/** A single shimmering placeholder rectangle. */
export function SkeletonBar({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-sm bg-border-4 ${className}`} aria-hidden="true" />;
}

/** Stand-in for a row of filter/sort pills (FeedChips, leaderboard categories). */
export function ChipRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="h-[30px] w-[104px] animate-pulse rounded-pill border border-border-5 bg-border-4"
        />
      ))}
    </div>
  );
}

/** Stand-in for one <PostCard />. Mirrors its outer card + header + body rhythm. */
export function PostCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-md border border-border-5 bg-white lg:rounded-sm"
      aria-hidden="true"
    >
      <div className="hidden h-[29px] bg-ink/90 lg:block" />
      <div className="flex items-center gap-3 p-3.5 pb-2.5 sm:p-4 sm:pb-3">
        <span className="h-11 w-11 flex-none animate-pulse rounded-xl bg-border-4" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-4 w-1/2" />
          <SkeletonBar className="h-3 w-3/4" />
        </div>
      </div>
      <div className="space-y-2 px-4 pb-3">
        <SkeletonBar className="h-5 w-[92%]" />
        <SkeletonBar className="h-5 w-[70%]" />
      </div>
      <div className="flex items-center gap-3 border-t border-border-1 px-4 py-3">
        <SkeletonBar className="h-7 w-24 rounded-pill" />
        <SkeletonBar className="h-7 w-16 rounded-pill" />
        <SkeletonBar className="ml-auto h-7 w-16 rounded-pill" />
      </div>
    </div>
  );
}

/** Stand-in for a vertical list of post cards. */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Stand-in for a compact bordered list (rising names, nearby posts, activity). */
export function ListRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-card border border-border-1 bg-white p-3.5">
          <span className="h-9 w-9 flex-none animate-pulse rounded-xl bg-border-4" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBar className="h-3.5 w-1/3" />
            <SkeletonBar className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
