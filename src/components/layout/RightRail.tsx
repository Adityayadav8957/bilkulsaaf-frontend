import Link from "next/link";
import { getLeaderboard } from "@/lib/api/leaderboard";
import { listStates } from "@/lib/api/map";
import { GuestLockedCard } from "@/components/shared/GuestLockedCard";
import { formatCount } from "@/lib/format";
import { slugify } from "@/lib/slug";

/**
 * Persistent desktop side column — reused across every listing/detail page so
 * the wide viewport never resolves to a bare content column next to the nav.
 * Fetches its own data (Next dedupes identical requests already made higher
 * in the tree within the same render pass, so this is effectively free on
 * pages that already loaded states/leaderboard for their own hero content).
 */
export async function RightRail() {
  const [topVoted, states] = await Promise.all([
    getLeaderboard("most-voted", 3),
    listStates(),
  ]);

  const totalPosts = states.reduce((sum, s) => sum + s.postCount, 0);
  const totalVotes = states.reduce((sum, s) => sum + s.voteCount, 0);

  return (
    <aside className="hidden w-[280px] flex-none space-y-6 lg:block">
      <div className="rule-red overflow-hidden rounded-sm border border-border-5 pb-0">
        <p className="bg-ink px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white">
          Today&apos;s edition
        </p>
        <div className="grid grid-cols-3 divide-x divide-border-4 border-t border-border-4">
          <div className="px-2 py-3 text-center">
            <p className="font-serif text-lg font-bold text-ink">{formatCount(totalPosts)}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-meta-3">reports</p>
          </div>
          <div className="px-2 py-3 text-center">
            <p className="font-serif text-lg font-bold text-ink">{formatCount(totalVotes)}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-meta-3">votes</p>
          </div>
          <div className="px-2 py-3 text-center">
            <p className="font-serif text-lg font-bold text-red">{states.length}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-meta-3">states</p>
          </div>
        </div>
      </div>

      <GuestLockedCard heading="Leaderboard">
        <ul className="space-y-3">
          {topVoted.map((post, index) => (
            <li key={post._id} className="flex items-start gap-2">
              <span className="font-mono text-xs text-meta-3">#{index + 1}</span>
              <Link
                href={`/posts/${post.slug || post._id}`}
                className="min-w-0 flex-1 text-sm text-text hover:underline"
              >
                <span className="block truncate font-serif font-bold text-ink">
                  {post.personSnapshot.name}
                </span>
                <span className="text-xs text-meta-2">{formatCount(post.voteScore)} votes</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/leaderboard"
          className="mt-4 block text-center text-xs font-medium text-text-muted hover:text-red"
        >
          See the whole leaderboard →
        </Link>
      </GuestLockedCard>

      <GuestLockedCard heading="States, by suspicion">
        <ul className="space-y-2">
          {states.slice(0, 6).map((state) => (
            <li key={state.state} className="flex items-center justify-between text-sm">
              <Link
                href={`/states/${slugify(state.state)}`}
                className="text-text-muted hover:text-red hover:underline"
              >
                {state.state}
              </Link>
              <span className="font-mono text-xs text-meta-3">{state.postCount}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/states"
          className="mt-4 block text-center text-xs font-medium text-text-muted hover:text-red"
        >
          Browse all states →
        </Link>
      </GuestLockedCard>

      <div className="rounded-sm border border-dashed border-red/40 bg-red-tint/40 p-4 text-center">
        <p className="font-serif text-sm font-bold italic text-ink">Classifieds</p>
        <p className="mt-1.5 text-xs leading-relaxed text-meta-1">
          Know something? File it anonymously — no names, no accounts tied to you, ever.
        </p>
        <Link
          href="/create"
          className="mt-3 inline-block rounded-pill bg-red px-4 py-1.5 text-xs font-semibold text-white"
        >
          Post anonymously
        </Link>
      </div>
    </aside>
  );
}
