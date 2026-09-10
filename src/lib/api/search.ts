import { apiFetch } from "./http";
import { buildQuery } from "./query";
import type { SearchResult } from "./types";

export async function search(q: string, type: "all" | "posts" | "people" = "all") {
  if (!q || !q.trim()) {
    return { posts: [], people: [], organizations: [], locations: [] } as SearchResult;
  }
  return apiFetch<SearchResult>(`/search${buildQuery({ q, type })}`, {
    cache: "no-store",
  });
}
