import Link from "next/link";
import { VoteButtons } from "./VoteButtons";
import { SaveButton } from "./SaveButton";
import { ShareButton } from "./ShareButton";
import { ReportButton } from "./ReportButton";
import { formatRelativeTime, locationLabel } from "@/lib/format";
import { tintForNumber } from "@/lib/tint";
import type { Post } from "@/lib/api/types";

export function PostCard({ post }: { post: Post }) {
  const personHref = `/people/${post.person}`;
  const postHref = `/posts/${post.slug || post._id}`;

  return (
    <article className="overflow-hidden rounded-md border border-border-5 bg-white lg:rounded-sm">
      <div className="hidden items-center justify-between gap-3 bg-ink px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white/85 lg:flex">
        <span className="truncate">⌾ {locationLabel(post.personSnapshot.state, post.personSnapshot.city)}</span>
        <span className="text-white/50">public record</span>
      </div>
      <div className="flex items-center gap-3 p-3.5 pb-2.5 sm:p-4 sm:pb-3">
        {post.personSnapshot.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.personSnapshot.photoUrl}
            alt=""
            className="h-11 w-11 flex-none rounded-xl object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="texture-avatar flex h-11 w-11 flex-none items-center justify-center rounded-xl"
          >
            <span className="font-mono text-[9px] text-meta-3">FACE</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={personHref} className="font-serif text-lg font-bold leading-none text-ink hover:underline">
              {post.personSnapshot.name}
            </Link>
            <span className="rotate-[-4deg] border-2 border-dashed border-red bg-red-tint px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-red">
              definitely clean
            </span>
          </div>
          <p className="truncate text-xs text-meta-2">
            {[post.personSnapshot.designation, post.personSnapshot.organization]
              .filter(Boolean)
              .join(", ")}
            {post.personSnapshot.designation || post.personSnapshot.organization ? " · " : ""}
            {locationLabel(post.personSnapshot.state, post.personSnapshot.city)}
          </p>
        </div>
        <ReportButton targetType="post" targetId={post._id} />
      </div>

      <Link
        href={postHref}
        className="relative block px-4 pb-3 font-serif text-[20px] font-bold leading-snug text-text sm:text-[21px] lg:text-[22px]"
      >
        <span aria-hidden="true" className="mr-0.5 font-serif text-red">&ldquo;</span>
        {post.description}
        <span aria-hidden="true" className="font-serif text-red">&rdquo;</span>
      </Link>

      {post.media.length > 0 && (
        <Link href={postHref} className="block px-4 pb-3">
          {post.media[0].type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.media[0].url}
              alt={`Photo evidence for report about ${post.personSnapshot.name}`}
              className="h-48 w-full rounded-card object-cover"
            />
          ) : (
            <div className="texture-media flex h-48 w-full flex-col items-center justify-center gap-1 rounded-card border border-border-3">
              <span className="font-mono text-[11px] uppercase tracking-wide text-meta-2">
                {post.media[0].type}
              </span>
              <span className="font-mono text-[10px] text-meta-4">attached by author</span>
            </div>
          )}
        </Link>
      )}

      <div className="flex items-center gap-2 px-4 pb-2.5 sm:pb-3">
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 flex-none rounded-tag"
          style={{ background: tintForNumber(post.author?.number ?? 0) }}
        />
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-meta-1">
          {post.author ? post.author.displayName : "Anonymous Citizen"}
        </p>
        <span className="flex-none font-mono text-[11px] text-meta-3">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-border-4 p-2 sm:gap-1.5 sm:p-2.5">
        <VoteButtons
          postId={post._id}
          initialUpvoteCount={post.upvoteCount}
          initialMyVote={post.myVote ?? 0}
        />
        <Link
          href={`${postHref}#comments`}
          className="rounded-pill px-3 py-1.5 text-xs font-semibold text-text-muted-2 hover:bg-border-4"
        >
          💬 {post.commentCount}
        </Link>
        <div className="flex-1" />
        <ShareButton path={postHref} />
        <SaveButton postId={post._id} initialSaved={post.isSavedByMe ?? false} />
      </div>
    </article>
  );
}
