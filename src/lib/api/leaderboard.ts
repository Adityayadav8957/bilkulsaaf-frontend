import { apiFetch } from "./http";
import { buildQuery } from "./query";
import type { Person, Post } from "./types";

export type LeaderboardCategory =
  | "most-voted"
  | "most-discussed"
  | "trending"
  | "most-reported";

export const LEADERBOARD_CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: "most-voted", label: "Most Definitely Not Corrupt" },
  { key: "trending", label: "Trending this week" },
  { key: "most-discussed", label: "Most discussed" },
  { key: "most-reported", label: "Most reported" },
];

export async function getLeaderboard(
  category: LeaderboardCategory,
  limit = 20,
  revalidate = 60
) {
  return apiFetch<Post[]>(`/leaderboard/${category}${buildQuery({ limit })}`, {
    next: { revalidate },
  });
}

export async function getRisingPeople(limit = 20, revalidate = 60) {
  return apiFetch<Person[]>(`/leaderboard/rising-people${buildQuery({ limit })}`, {
    next: { revalidate },
  });
}
