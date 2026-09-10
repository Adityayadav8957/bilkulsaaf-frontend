import { apiFetch } from "./http";
import { buildQuery } from "./query";
import type { Paginated, Post, ProfileActivity, ProfileComment } from "./types";

const accountRequest = { forwardCookies: true, cache: "no-store" as const };

export async function getMyPosts(cursor?: string) {
  return apiFetch<Paginated<Post>>(`/users/me/posts${buildQuery({ cursor })}`, accountRequest);
}

export async function getMyComments(cursor?: string) {
  return apiFetch<Paginated<ProfileComment>>(`/users/me/comments${buildQuery({ cursor })}`, accountRequest);
}

/** Requires the viewer's cookie — only used by the account-specific /profile page. */
export async function getMySavedPosts(cursor?: string) {
  return apiFetch<Paginated<{ savedAt: string; post: Post }>>(
    `/users/me/saved-posts${buildQuery({ cursor })}`,
    accountRequest
  );
}

export async function getMyActivity() {
  return apiFetch<{ items: ProfileActivity[] }>("/users/me/activity", accountRequest);
}
