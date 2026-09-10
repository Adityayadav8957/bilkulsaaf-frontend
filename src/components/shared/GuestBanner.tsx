"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export function GuestBanner() {
  const { user, loading } = useAuth();
  if (loading || user) return null;

  return (
    <div className="mb-4 rounded-card border border-dashed border-border-7 bg-white p-4">
      <p className="font-semibold text-ink">You&apos;re browsing as a nobody</p>
      <p className="mt-1 text-sm text-text-muted">
        Peeking is free. Voting, posting and arguing require a (still anonymous) account.
      </p>
      <Link
        href="/signup"
        className="mt-3 inline-block rounded-pill bg-red px-4 py-2.5 text-sm font-medium text-white"
      >
        Get my citizen number
      </Link>
    </div>
  );
}
