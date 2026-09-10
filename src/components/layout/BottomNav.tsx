"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthGate } from "@/components/auth/AuthGateProvider";
import { HomeIcon, PlusIcon, SearchIcon, TrendingIcon, UserIcon } from "@/components/icons";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";

// On a fast/cached navigation, `pending` can flip back to false within a
// handful of milliseconds — too fast to register as a "loading" indicator to
// a mobile user tapping the tab bar. Holding the spinner visible for at
// least this long makes every tab switch read as a deliberate, seen state
// transition rather than an invisible flash.
const MIN_PENDING_MS = 400;

/** Must render as a child of <Link> — useLinkStatus() only works there. */
function TabPendingOverlay() {
  const { pending } = useLinkStatus();
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (pending) {
      shownAtRef.current = Date.now();
      setVisible(true);
      return;
    }
    if (!visible) return;
    const remaining = MIN_PENDING_MS - (Date.now() - shownAtRef.current);
    if (remaining <= 0) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [pending, visible]);

  if (!visible) return null;

  return (
    <span
      className="absolute inset-0 flex items-center justify-center bg-white/80"
      aria-hidden="true"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border-5 border-t-red" />
    </span>
  );
}

const TABS: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string; size?: number }>;
}[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/explore", label: "Explore", Icon: SearchIcon },
  { href: "/leaderboard", label: "Trending", Icon: TrendingIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();

  function handlePost() {
    if (!user) {
      requireAuth("Post anonymously");
      return;
    }
    router.push("/create");
  }

  function renderTab(tab: (typeof TABS)[number]) {
    const active = tab.href === "/" ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
    const Icon = tab.Icon;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        aria-label={tab.label}
        aria-current={active ? "page" : undefined}
        className="group relative flex h-[76px] flex-1 flex-col items-center justify-center gap-1.5 pt-2"
      >
        <span
          className={`flex h-9 w-9 flex-none items-center justify-center transition-all duration-200 ${
            active ? "text-red" : "text-meta-1 group-active:scale-95"
          }`}
        >
          <Icon size={22} />
        </span>
        <span
          className={`font-mono text-[10px] font-medium uppercase tracking-[0.18em] ${
            active ? "text-red" : "text-meta-1"
          }`}
        >
          {tab.label}
        </span>
        <TabPendingOverlay />
      </Link>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1200] border-t-2 border-ink bg-white md:hidden">
      <div className="flex h-[82px] items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.slice(0, 2).map(renderTab)}
        <button
          type="button"
          onClick={handlePost}
          className="group flex h-[76px] flex-1 items-center justify-center"
          aria-label="New post"
        >
          <span className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full border-2 border-ink bg-red text-white shadow-[0_6px_0_var(--color-ink)] transition-transform duration-200 group-active:translate-y-[-0.7rem] group-active:shadow-[0_3px_0_var(--color-ink)]">
            <PlusIcon size={28} />
          </span>
        </button>
        {TABS.slice(2).map(renderTab)}
      </div>
    </nav>
  );
}
