"use client";

import { useState, useTransition } from "react";
import { ApiClientError, savePost, unsavePost } from "@/lib/api/browser";
import { useAuthGate } from "@/components/auth/AuthGateProvider";
import { BookmarkIcon } from "@/components/icons";

export function SaveButton({
  postId,
  initialSaved = false,
}: {
  postId: string;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const { requireAuth } = useAuthGate();

  function toggle() {
    if (isPending) return;
    startTransition(async () => {
      try {
        if (saved) {
          await unsavePost(postId);
          setSaved(false);
        } else {
          await savePost(postId);
          setSaved(true);
        }
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          requireAuth("Save this for later");
        }
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? "Unsave post" : "Save post"}
      title={saved ? "Saved" : "Save"}
      className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-text-muted-2 hover:bg-border-4"
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}
