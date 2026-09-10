import { apiFetch } from "./http";
import { buildQuery } from "./query";
import type { Comment, Paginated } from "./types";

export async function listComments(
  postId: string,
  params: { cursor?: string; limit?: number } = {},
  revalidate = 30
) {
  return apiFetch<Paginated<Comment>>(`/comments${buildQuery({ postId, ...params })}`, {
    next: { revalidate },
  });
}
