"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthGate } from "@/components/auth/AuthGateProvider";
import { HomeIcon, MapPinIcon, PlusIcon, TrendingIcon, UserIcon } from "@/components/icons";
import { MastheadDate } from "@/components/layout/MastheadDate";
import type { ComponentType } from "react";

const ITEMS: { href: string; label: string; Icon: ComponentType<{ className?: string; size?: number }> }[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/explore", label: "Explore", Icon: TrendingIcon },
  { href: "/states", label: "Map", Icon: MapPinIcon },
  { href: "/people", label: "People", Icon: UserIcon },
  { href: "/leaderboard", label: "Leaderboard", Icon: TrendingIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();

  function startPost() {
    if (!user) {
      requireAuth("Post anonymously");
      return;
    }
    router.push("/create");
  }

  return (
    <aside className="relative z-20 hidden w-[240px] flex-none border-r border-border-2 lg:block">
      <div className="sticky top-[108px] py-[18px] pr-5">
        <div className="rule-red mb-4 pb-2.5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-meta-2">
            <MastheadDate options={{ weekday: "long", day: "2-digit", month: "long" }} />
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-red">
            Vol. II · Issue #1009
          </p>
        </div>

        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {ITEMS.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors ${
                  active ? "bg-red text-white shadow-sm" : "text-text-muted hover:bg-red-tint hover:text-red-dark"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={startPost}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-red font-serif text-sm font-bold text-white shadow-[0_3px_0_var(--color-red-dark)] transition-transform active:scale-[0.98]"
        >
          <PlusIcon size={16} />
          New post
        </button>

        <p className="mt-[18px] rounded-[14px] border border-dashed border-red/35 bg-red-tint/40 p-3.5 font-mono text-[11px] leading-relaxed text-meta-2">
          No real names. No data sold. We never post as you.
        </p>

        <div className="mt-6 border-t border-border-3 pt-5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-meta-3">
            Est. two volumes ago
          </p>
          <p className="mt-2 font-serif text-[13px] italic leading-snug text-meta-2">
            &ldquo;All the suspicion fit to print.&rdquo;
          </p>
        </div>
      </div>
    </aside>
  );
}
