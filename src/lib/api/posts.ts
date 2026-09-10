import { apiFetch } from "./http";
import { buildQuery } from "./query";
import type { FeedSort, Paginated, Post } from "./types";

export async function getFeed(
  params: {
    sort?: FeedSort;
    state?: string;
    city?: string;
    personId?: string;
    cursor?: string;
    limit?: number;
  } = {},
  revalidate = 60
) {
  return apiFetch<Paginated<Post>>(`/posts${buildQuery(params)}`, {
    next: { revalidate },
  });
}

export async function getPostBySlugOrId(idOrSlug: string, revalidate = 60) {
  return apiFetch<Post>(`/posts/${encodeURIComponent(idOrSlug)}`, {
    next: { revalidate },
  });
}
