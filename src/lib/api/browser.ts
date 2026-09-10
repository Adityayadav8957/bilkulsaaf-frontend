"use client";

import type { AuthUser, Comment, Media, Paginated, Person, Post, SearchResult } from "./types";

export class ApiClientError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json || json.success === false) {
    const message = json && !json.success ? json.error?.message : `Request failed (${res.status})`;
    const code = json && !json.success ? json.error?.code : "UNKNOWN_ERROR";
    throw new ApiClientError(res.status, code || "UNKNOWN_ERROR", message || "Request failed");
  }

  return json.data as T;
}

// --- Auth -------------------------------------------------------------

export function login(email: string, password: string) {
  return request<AuthUser>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function register(email: string, password: string) {
  return request<AuthUser>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout() {
  return request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
}

export function getMeClient() {
  return request<AuthUser>("/auth/me");
}

// --- Posts / votes / saves ---------------------------------------------

export function votePost(postId: string, value: 1) {
  return request<{ upvoteCount: number; voteScore: number; myVote: 0 | 1 }>(
    `/votes/posts/${postId}`,
    { method: "POST", body: JSON.stringify({ value }) }
  );
}

export function savePost(postId: string) {
  return request<{ saved: boolean }>(`/posts/${postId}/save`, { method: "POST" });
}

export function unsavePost(postId: string) {
  return request<{ saved: boolean }>(`/posts/${postId}/save`, { method: "DELETE" });
}

export function createPost(input: {
  personName: string;
  designation?: string;
  organization?: string;
  state: string;
  city?: string;
  description: string;
  media?: Media[];
}) {
  return request<Post>("/posts", { method: "POST", body: JSON.stringify(input) });
}

// --- Comments ------------------------------------------------------------

export function createComment(input: { postId: string; content: string; parentCommentId?: string }) {
  return request<Comment>("/comments", { method: "POST", body: JSON.stringify(input) });
}

export function voteComment(commentId: string, value: 1) {
  return request<{ upvoteCount: number; myVote: 0 | 1 }>(`/comments/${commentId}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

export function listReplies(commentId: string, cursor?: string) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return request<Paginated<Comment>>(`/comments/${commentId}/replies${qs}`);
}

// --- Reports --------------------------------------------------------------

export function reportContent(input: { targetType: "post" | "comment"; targetId: string; reason: string }) {
  return request<{ _id: string }>("/reports", { method: "POST", body: JSON.stringify(input) });
}

// --- Media upload ----------------------------------------------------------

export function getUploadUrl(input: { fileName: string; contentType: string }) {
  return request<{
    uploadUrl: string;
    key: string;
    publicUrl: string;
    contentType: string;
    maxSizeBytes: number;
    expiresIn: number;
  }>("/media/upload-url", { method: "POST", body: JSON.stringify(input) });
}

// --- People / search (client-side lookups, e.g. composer autocomplete) ----

export function listPeopleClient(q: string) {
  const usp = new URLSearchParams({ q });
  return request<Paginated<Person>>(`/people?${usp.toString()}`);
}

export function searchClient(q: string, type: "all" | "posts" | "people" = "all") {
  const usp = new URLSearchParams({ q, type });
  return request<SearchResult>(`/search?${usp.toString()}`);
}
