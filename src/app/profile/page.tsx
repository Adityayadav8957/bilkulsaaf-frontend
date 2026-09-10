import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getMe } from "@/lib/api/auth";
import { getMyActivity, getMyComments, getMyPosts, getMySavedPosts } from "@/lib/api/users";
import { PostCard } from "@/components/post/PostCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeedSkeleton, ListRowsSkeleton, SkeletonBar } from "@/components/shared/Skeletons";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatRelativeTime, locationLabel } from "@/lib/format";

export const metadata: Metadata = buildMetadata({
  title: "Your profile",
  description: "Your anonymous citizen profile.",
  path: "/profile",
  noindex: true,
});

const PROFILE_TABS = [
  { id: "posts", label: "Posts" },
  { id: "comments", label: "Comments" },
  { id: "saved", label: "Saved" },
  { id: "activity", label: "Activity" },
] as const;

type ProfileTab = (typeof PROFILE_TABS)[number]["id"];

type ProfileSearchParams = Promise<{ tab?: string }>;

/**
 * Everything on this page hangs off the viewer's auth cookie, so none of it can
 * be prerendered. Under Cache Components the page itself is a static shell and
 * the personalized body streams into this skeleton — which mirrors the real
 * avatar / stat-tile card, tab bar and list, so a tab switch paints the profile
 * layout immediately instead of a full-page spinner.
 */
function ProfileBodySkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10" aria-hidden="true">
      <h1>Profile</h1>

      <section className="mt-6 overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-[0_16px_35px_rgba(19,19,18,0.12)] sm:p-7">
        <div className="flex items-center gap-4 sm:gap-5">
          <span className="h-20 w-20 flex-none animate-pulse rounded-[22px] border border-white/10 bg-white/10 sm:h-24 sm:w-24" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <SkeletonBar className="h-3 w-28 bg-white/15" />
            <SkeletonBar className="h-7 w-2/3 bg-white/20" />
            <SkeletonBar className="h-4 w-1/2 bg-white/10" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-2">
          <SkeletonBar className="h-3 w-40 bg-white/10" />
          <SkeletonBar className="h-8 w-20 rounded-pill bg-white/10" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
          {PROFILE_TABS.slice(0, 3).map((tab) => (
            <div key={tab.id} className="flex flex-col gap-2 rounded-[18px] bg-white/[0.07] px-3 py-3.5 sm:px-4 sm:py-4">
              <SkeletonBar className="h-7 w-12 bg-white/20" />
              <SkeletonBar className="h-3 w-16 bg-white/10" />
            </div>
          ))}
        </div>
      </section>

      <div className="hide-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {PROFILE_TABS.map((tab) => (
          <span
            key={tab.id}
            className="h-[42px] w-[104px] flex-none animate-pulse rounded-pill border border-border-2 bg-border-4"
          />
        ))}
      </div>

      <section className="mt-6">
        <FeedSkeleton count={2} />
      </section>
    </div>
  );
}

/** The selected tab's list. Each tab is its own cookie-backed request. */
async function TabContent({ activeTab }: { activeTab: ProfileTab }) {
  const [posts, comments, saved, activity] = await Promise.all([
    activeTab === "posts" ? getMyPosts() : null,
    activeTab === "comments" ? getMyComments() : null,
    activeTab === "saved" ? getMySavedPosts() : null,
    activeTab === "activity" ? getMyActivity() : null,
  ]);

  return (
    <>
      {activeTab === "posts" && (
        <div className="space-y-4">
          {posts?.items.length === 0 && (
            <EmptyState title="No posts yet." subtitle="Your first public record will appear here." />
          )}
          {posts?.items.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="space-y-3">
          {comments?.items.length === 0 && (
            <EmptyState title="No comments yet." subtitle="Your thoughts will be listed here." />
          )}
          {comments?.items.map((comment) => (
            <Link
              key={comment._id}
              href={`/posts/${comment.post.slug || comment.post._id}`}
              className="block rounded-card border border-border-1 bg-white p-4 transition-colors hover:border-border-5"
            >
              <p className="font-mono text-[11px] text-meta-2">
                Commented on · {locationLabel(comment.post.personSnapshot.state, comment.post.personSnapshot.city)}
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text">{comment.content}</p>
              <p className="mt-3 font-mono text-[11px] text-meta-2">{formatRelativeTime(comment.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "saved" && (
        <div className="space-y-4">
          {saved?.items.length === 0 && (
            <EmptyState title="Nothing saved yet." subtitle="Keep a record of anything worth revisiting." />
          )}
          {saved?.items.map(({ post }) => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-3">
          {activity?.items.length === 0 && (
            <EmptyState title="No activity yet." subtitle="Your account activity will appear here." />
          )}
          {activity?.items.map((event, index) => {
            const labels = {
              post: "Published a post",
              comment: "Left a comment",
              saved: "Saved a post",
              vote: "Voted on a post",
            } as const;
            return (
              <Link
                key={`${event.type}-${event.createdAt}-${index}`}
                href={`/posts/${event.post.slug || event.post._id}`}
                className="flex items-center gap-3 rounded-card border border-border-1 bg-white p-4 transition-colors hover:border-border-5"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-border-4 font-mono text-xs font-semibold text-ink">
                  {event.type === "post" ? "P" : event.type === "comment" ? "C" : event.type === "saved" ? "S" : "V"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{labels[event.type]}</span>
                  <span className="mt-0.5 block truncate text-xs text-meta-2">
                    {event.post.personSnapshot.name} · {formatRelativeTime(event.createdAt)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function ProfilePage({ searchParams }: { searchParams: ProfileSearchParams }) {
  return (
    <Suspense fallback={<ProfileBodySkeleton />}>
      <ProfileBody searchParams={searchParams} />
    </Suspense>
  );
}

async function ProfileBody({ searchParams }: { searchParams: ProfileSearchParams }) {
  // getMe() swallows its own errors. Mark this scope as request-time up front so
  // the prerender bails out here rather than inside that try/catch (which would
  // otherwise bake the guest view into the static shell).
  await connection();

  const user = await getMe();

  if (!user) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <h1>You don&apos;t exist yet.</h1>
        <p className="mt-2 text-text-muted">
          Log in and you&apos;ll be handed a citizen number instead of a name.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block rounded-pill bg-red px-5 py-3 text-sm font-medium text-white"
        >
          Get my citizen number
        </Link>
      </div>
    );
  }

  const { tab: requestedTab } = await searchParams;
  const activeTab: ProfileTab = PROFILE_TABS.some((tab) => tab.id === requestedTab)
    ? (requestedTab as ProfileTab)
    : "posts";

  const memberSince = new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const stats = [
    { label: "posts", value: user.postsCount },
    { label: "comments", value: user.commentsCount },
    { label: "saved", value: user.savedPostsCount },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1>Profile</h1>

      <section className="mt-6 overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-[0_16px_35px_rgba(19,19,18,0.12)] sm:p-7">
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="texture-avatar flex h-20 w-20 flex-none items-center justify-center rounded-[22px] border border-white/10 sm:h-24 sm:w-24"
            aria-hidden="true"
          >
            <span className="font-mono text-xl font-medium text-white/80">{user.anonymousIdentity.number}</span>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
              Public identity
            </p>
            <h2 className="mt-1 truncate text-[clamp(24px,6vw,38px)] text-white">
              {user.anonymousIdentity.displayName}
            </h2>
            <p className="mt-2 max-w-lg font-mono text-sm leading-relaxed text-white/65 sm:text-base">
              Your real account is private and never shown.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-mono text-[11px] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" /> Member since {memberSince}
          </p>
          <LogoutButton />
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col rounded-[18px] bg-white/[0.07] px-3 py-3.5 sm:px-4 sm:py-4">
              <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/55 sm:text-[11px]">
                {stat.label}
              </dt>
              <dd className="-order-1 text-2xl font-semibold leading-none text-white sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="Profile content" className="hide-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {PROFILE_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={`/profile?tab=${tab.id}`}
              aria-current={active ? "page" : undefined}
              className={`flex-none rounded-pill border px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-border-2 bg-white text-text-muted hover:border-border-5 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <section className="mt-6">
        {/* The tab lists are separate cookie-backed requests, so switching tabs
            keeps the profile card and tab bar on screen and only swaps this. */}
        <Suspense
          key={activeTab}
          fallback={activeTab === "posts" || activeTab === "saved" ? <FeedSkeleton count={2} /> : <ListRowsSkeleton count={4} />}
        >
          <TabContent activeTab={activeTab} />
        </Suspense>
      </section>
    </div>
  );
}
