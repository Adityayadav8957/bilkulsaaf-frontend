import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getFeed, getPostBySlugOrId } from "@/lib/api/posts";
import { listComments } from "@/lib/api/comments";
import { isNotFoundError } from "@/lib/api/http";
import { VoteButtons } from "@/components/post/VoteButtons";
import { SaveButton } from "@/components/post/SaveButton";
import { ShareButton } from "@/components/post/ShareButton";
import { ReportButton } from "@/components/post/ReportButton";
import { CommentSection } from "@/components/post/CommentSection";
import { PostCard } from "@/components/post/PostCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RightRail } from "@/components/layout/RightRail";
import { buildMetadata, truncate } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/jsonld";
import { formatRelativeTime, locationLabel } from "@/lib/format";
import { tintForNumber } from "@/lib/tint";
import type { Post } from "@/lib/api/types";

export const revalidate = 60;

async function loadPost(slug: string): Promise<Post | null> {
  try {
    return await getPostBySlugOrId(slug);
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (!post) {
    return buildMetadata({
      title: "Report not found",
      description: "This report could not be found — it may have been removed.",
      path: `/posts/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: `${post.personSnapshot.name} — ${truncate(post.description, 60)}`,
    description: truncate(post.description, 160),
    path: `/posts/${post.slug || post._id}`,
  });
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const [comments, related] = await Promise.all([
    listComments(post._id, { limit: 20 }),
    getFeed({ personId: post.person, limit: 4 }),
  ]);

  const relatedPosts = related.items.filter((p) => p._id !== post._id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: `${post.personSnapshot.name} — citizen report`,
    articleBody: post.description,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author?.displayName || "Anonymous Citizen",
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.upvoteCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.commentCount,
      },
    ],
  };

  return (
    <div className="px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Posts", href: "/posts" },
          { label: post.personSnapshot.name, href: `/people/${post.person}` },
          { label: "Report" },
        ]}
      />

      <div className="lg:flex lg:items-start lg:gap-7">
      <div className="min-w-0 max-w-3xl flex-1">

      <article className="rule-red overflow-hidden rounded-card border border-border-3 bg-white p-5">
        <div className="flex items-start gap-3">
          {post.personSnapshot.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.personSnapshot.photoUrl}
              alt=""
              className="h-12 w-12 flex-none rounded-full object-cover"
            />
          ) : (
            <div aria-hidden="true" className="texture-avatar h-12 w-12 flex-none rounded-full" />
          )}
          <div className="min-w-0 flex-1">
            <Link href={`/people/${post.person}`} className="hover:underline">
              <h1>{post.personSnapshot.name}</h1>
            </Link>
            <p className="mt-1 text-sm text-meta-2">
              {[post.personSnapshot.designation, post.personSnapshot.organization]
                .filter(Boolean)
                .join(", ")}
              {" · "}
              {locationLabel(post.personSnapshot.state, post.personSnapshot.city)}
            </p>
          </div>
          <span className="flex-none font-mono text-xs text-meta-3">
            {formatRelativeTime(post.createdAt)}
          </span>
          <ReportButton targetType="post" targetId={post._id} />
        </div>

        <p className="font-newsbody mt-4 text-lg leading-relaxed text-text">
          <span aria-hidden="true" className="font-serif text-2xl leading-none text-red">&ldquo;</span>
          {post.description}
          <span aria-hidden="true" className="font-serif text-2xl leading-none text-red">&rdquo;</span>
        </p>

        {post.media.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {post.media.map((media) =>
              media.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={media.key}
                  src={media.url}
                  alt={`Photo evidence for report about ${post.personSnapshot.name}`}
                  className="h-48 w-48 flex-none rounded-card object-cover"
                />
              ) : (
                <div
                  key={media.key}
                  className="texture-media flex h-48 w-48 flex-none flex-col items-center justify-center gap-1 rounded-card border border-border-3"
                >
                  <span className="font-mono text-xs uppercase tracking-wide text-meta-2">
                    {media.type}
                  </span>
                  <span className="font-mono text-[10px] text-meta-4">attached by author</span>
                </div>
              )
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <VoteButtons
            postId={post._id}
            initialUpvoteCount={post.upvoteCount}
            initialMyVote={post.myVote ?? 0}
          />
          <div className="flex items-center gap-1">
            <ShareButton path={`/posts/${post.slug || post._id}`} />
            <SaveButton postId={post._id} initialSaved={post.isSavedByMe ?? false} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 flex-none rounded-tag"
            style={{ background: tintForNumber(post.author?.number ?? 0) }}
          />
          <p className="font-mono text-[11px] text-meta-1">
            Posted by {post.author?.displayName || "Anonymous Citizen"}
          </p>
        </div>
      </article>

      <section id="comments" className="mt-8">
        <CommentSection postId={post._id} initialComments={comments.items} />
      </section>

      {relatedPosts.length > 0 && (
        <section className="mt-10">
          <h2>Related posts</h2>
          <div className="mt-4 space-y-4">
            {relatedPosts.map((relatedPost) => (
              <PostCard key={relatedPost._id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}

      </div>

      <RightRail />
      </div>
    </div>
  );
}
