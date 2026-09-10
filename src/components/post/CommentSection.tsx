"use client";

import { useState, useTransition } from "react";
import { ApiClientError, createComment } from "@/lib/api/browser";
import { useAuthGate } from "@/components/auth/AuthGateProvider";
import { formatRelativeTime } from "@/lib/format";
import type { Comment } from "@/lib/api/types";

export function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const { requireAuth } = useAuthGate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || isPending) return;
    startTransition(async () => {
      try {
        const comment = await createComment({ postId, content: text });
        setComments((prev) => [comment, ...prev]);
        setContent("");
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          requireAuth("Join the argument anonymously");
        }
      }
    });
  }

  return (
    <div>
      <h2>Comments · {comments.length}</h2>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add to the argument…"
          maxLength={2000}
          className="flex-1 rounded-pill border border-border-5 px-4 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white"
        >
          Post
        </button>
      </form>

      <ul className="mt-4 space-y-3">
        {comments.length === 0 && (
          <li className="text-sm text-meta-2">No comments yet. Be the first to argue.</li>
        )}
        {comments.map((comment) => (
          <li key={comment._id} className="rounded-card border border-border-3 bg-white p-3">
            <p className="font-mono text-[11px] text-meta-3">
              {comment.author?.displayName || "Anonymous Citizen"} ·{" "}
              {formatRelativeTime(comment.createdAt)}
            </p>
            <p className="mt-1 text-sm text-text">{comment.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
