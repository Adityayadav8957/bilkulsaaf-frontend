import Link from "next/link";
import { locationLabel } from "@/lib/format";
import type { Person } from "@/lib/api/types";

export function PersonCard({ person }: { person: Person }) {
  return (
    <Link
      href={`/people/${person.slug || person._id}`}
      className="block rounded-card border border-border-3 bg-white p-4 hover:border-border-7"
    >
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="texture-avatar h-11 w-11 flex-none rounded-full" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{person.name}</p>
          <p className="truncate text-xs text-meta-2">
            {[person.designation, person.organization].filter(Boolean).join(", ")}
          </p>
          <p className="text-xs text-meta-3">
            {locationLabel(person.location.state, person.location.city)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-4 font-mono text-[11px] text-meta-2">
        <span>{person.stats.postsCount} posts</span>
        <span>{person.stats.totalVotes} votes</span>
        <span>{person.stats.totalComments} comments</span>
      </div>
    </Link>
  );
}
