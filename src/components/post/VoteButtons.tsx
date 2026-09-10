"use client";

import { useState } from "react";
import { ApiClientError, votePost } from "@/lib/api/browser";
import { useAuthGate } from "@/components/auth/AuthGateProvider";
import { formatCount } from "@/lib/format";

export function VoteButtons({
  postId,
  initialUpvoteCount,
  initialMyVote = 0,
}: {
  postId: string;
  initialUpvoteCount: number;
  initialMyVote?: 0 | 1;
}) {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [myVote, setMyVote] = useState<0 | 1>(initialMyVote);
  const { requireAuth } = useAuthGate();

  /**
   * Flips the button black the instant it's tapped instead of waiting on the
   * network, then fires the request in the background and rolls back on
   * failure (e.g. a 401 pops the auth gate).
   */
  function cast() {
    const prevUp = upvoteCount;
    const prevVote = myVote;
    const nextVote: 0 | 1 = myVote === 1 ? 0 : 1;

    setUpvoteCount(myVote === 1 ? upvoteCount - 1 : upvoteCount + 1);
    setMyVote(nextVote);

    votePost(postId, 1)
      .then((result) => {
        setUpvoteCount(result.upvoteCount);
        setMyVote(result.myVote);
      })
      .catch((err) => {
        setUpvoteCount(prevUp);
        setMyVote(prevVote);
        if (err instanceof ApiClientError && err.status === 401) {
          requireAuth("Vote as an anonymous citizen");
        }
      });
  }

  return (
    <button
      type="button"
      onClick={cast}
      aria-pressed={myVote === 1}
      className={`rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors ${
        myVote === 1
          ? "border-red bg-red text-white"
          : "border-border-5 text-text-muted hover:border-red/40 hover:bg-red-tint"
      }`}
    >
      👍 Definitely Clean · {formatCount(upvoteCount)}
    </button>
  );
}
