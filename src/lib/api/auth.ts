import { apiFetch } from "./http";
import type { AuthUser } from "./types";

/** Server-side "who is logged in" check — only used by account pages (e.g. /profile). */
export async function getMe(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>("/auth/me", {
      forwardCookies: true,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}
