"use client";

import { useSyncExternalStore } from "react";

/** No subscription: today's date never changes while the tab is open. */
const subscribe = () => () => {};
const serverSnapshot = () => "";

/**
 * The decorative masthead date.
 *
 * Reading `new Date()` while rendering would freeze today's date into the
 * prerendered static shell (and Cache Components rejects it at build time —
 * see https://nextjs.org/docs/messages/blocking-prerender-current-time-client),
 * so the read happens only on the client. Renders as bare text, so the
 * surrounding markup is unchanged.
 */
export function MastheadDate({ options }: { options: Intl.DateTimeFormatOptions }) {
  const label = useSyncExternalStore(
    subscribe,
    () => new Date().toLocaleDateString("en-GB", options),
    serverSnapshot
  );

  return <>{label}</>;
}
