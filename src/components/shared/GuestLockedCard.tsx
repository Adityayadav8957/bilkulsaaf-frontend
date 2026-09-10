"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * A card whose heading always stays legible (so guests know what they're
 * missing) while its body is blurred and overlaid with a login prompt.
 * Defaults to locked while auth status is still loading (mirrors
 * GuestGatedFeed) so guests never see a flash of unlocked content.
 */
export function GuestLockedCard({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const locked = loading || !user;

  return (
    <div className="rounded-card border border-border-3 bg-white p-4 lg:rounded-sm lg:border-border-5 lg:p-0">
      <h2 className="text-sm lg:bg-ink lg:px-3 lg:py-2.5 lg:font-mono lg:text-[10px] lg:font-medium lg:uppercase lg:tracking-[0.18em] lg:text-white">{heading}</h2>
      {locked ? (
        <div className="relative mt-3 lg:mx-3 lg:mb-3">
          <div aria-hidden="true" className="pointer-events-none select-none blur-sm">
            {children}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-card bg-white/70 p-4 text-center backdrop-blur-[1px]">
            <p className="text-sm font-semibold text-ink">Log in to see this</p>
            <Link
              href="/signup"
              className="rounded-pill bg-red px-4 py-1.5 text-xs font-semibold text-white"
            >
              Get my citizen number
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-3 lg:mx-3 lg:mb-3">{children}</div>
      )}
    </div>
  );
}
