import "server-only";
import { cookies } from "next/headers";

// The backend's own address (bypasses the /api rewrite proxy, which exists
// only so the browser and search engines see a same-origin /api/* path).
const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:5000/api";

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code: string; details?: unknown } };

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Next.js data-cache controls — omit for an uncached (always-fresh) request. */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  /**
   * Forward the incoming request's cookies to the backend. Defaults to false:
   * public SEO pages deliberately render the guest view so their response is
   * shareable across visitors and cacheable via `revalidate`. Only
   * account-specific server-rendered pages (e.g. /profile) opt in.
   */
  forwardCookies?: boolean;
};

/**
 * Server-side API client — calls the Express backend directly (not through
 * the /api rewrite, which is for the browser). Use from Server Components,
 * generateMetadata, sitemap.ts, etc. Never import this from a Client
 * Component (enforced by the `server-only` import above).
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, next, cache, forwardCookies = false } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (forwardCookies) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    if (cookieHeader) headers.cookie = cookieHeader;
  }

  const res = await fetch(`${API_ORIGIN}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next,
    cache,
  });

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !json || json.success === false) {
    const message = json && !json.success ? json.error.message : `Request failed (${res.status})`;
    const code = json && !json.success ? json.error.code : "UNKNOWN_ERROR";
    throw new ApiRequestError(res.status, code, message);
  }

  return json.data;
}

/** True when `err` is an ApiRequestError with a 404 status (from a bad id/slug). */
export function isNotFoundError(err: unknown): boolean {
  return err instanceof ApiRequestError && err.status === 404;
}
