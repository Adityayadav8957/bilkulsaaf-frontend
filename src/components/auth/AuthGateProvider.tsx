"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useState } from "react";

type GateContextValue = {
  requireAuth: (reason?: string) => void;
};

const GateContext = createContext<GateContextValue | null>(null);

const DEFAULT_REASON = "Want to join the chaos?";

const PROMISES = [
  "We never post or comment on your behalf",
  "Your email is never shown publicly",
  "You can browse everything without an account",
];

/**
 * App-wide "auth gate" — any client component can call useAuthGate().requireAuth()
 * (e.g. on a 401 from voting/commenting/saving) to pop this non-blocking modal
 * instead of erroring, matching the design's contextual auth-gate pattern.
 */
export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const [reason, setReason] = useState<string | null>(null);

  const requireAuth = useCallback((r?: string) => setReason(r || DEFAULT_REASON), []);
  const close = useCallback(() => setReason(null), []);

  return (
    <GateContext.Provider value={{ requireAuth }}>
      {children}
      {reason && (
        <div
          className="fixed inset-0 z-[1300] flex items-end justify-center bg-scrim p-4 sm:items-center"
          onClick={close}
        >
          <div
            className="w-full max-w-sm rounded-modal bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-ink">{reason}</h2>
            <p className="mt-2 text-sm text-text-muted">
              Your real account never appears anywhere. The feed only ever sees a
              citizen number — no name, no email, no way back to you.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-text-muted-2">
              {PROMISES.map((promise) => (
                <li key={promise}>· {promise}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/signup"
                className="rounded-pill bg-red px-4 py-3 text-center text-sm font-medium text-white"
                onClick={close}
              >
                Continue anonymously
              </Link>
              <button
                type="button"
                onClick={close}
                className="rounded-pill px-4 py-3 text-center text-sm font-medium text-text-muted"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </GateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(GateContext);
  if (!ctx) throw new Error("useAuthGate must be used within AuthGateProvider");
  return ctx;
}
