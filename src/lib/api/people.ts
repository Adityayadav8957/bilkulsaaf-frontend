import { apiFetch } from "./http";
import { buildQuery } from "./query";
import type { Paginated, Person, Post } from "./types";

export async function listPeople(
  params: { q?: string; state?: string; city?: string; cursor?: string; limit?: number } = {},
  revalidate = 300
) {
  return apiFetch<Paginated<Person>>(`/people${buildQuery(params)}`, {
    next: { revalidate },
  });
}

export async function getPersonBySlugOrId(
  idOrSlug: string,
  params: { cursor?: string; limit?: number } = {},
  revalidate = 300
) {
  return apiFetch<{ person: Person; posts: Paginated<Post> }>(
    `/people/${encodeURIComponent(idOrSlug)}${buildQuery(params)}`,
    { next: { revalidate } }
  );
}
