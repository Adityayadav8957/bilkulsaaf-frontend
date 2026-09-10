"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthGate } from "@/components/auth/AuthGateProvider";
import { PlusIcon, SearchIcon } from "@/components/icons";

export function Header() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { requireAuth } = useAuthGate();

  function handleNewPost() {
    if (!user) {
      requireAuth("Post anonymously");
      return;
    }
    router.push("/create");
  }

  return (
    <header className="sticky top-0 z-[1200] border-b-[3px] border-ink bg-bg-outer/90 backdrop-blur-md">
      <div className="hidden border-b border-white/15 bg-ink lg:block">
        <div className="mx-auto flex h-[34px] max-w-7xl items-center justify-between pl-[246px] pr-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">
          <span>Vol. II · Issue #1009</span>
          <span>भारत · अनौपचारिक जनहित संस्करण</span>
          <span>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-sm border border-ink bg-red font-serif text-xl font-bold text-white"
          >
            B.
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-serif text-[25px] font-bold tracking-[-0.04em] text-ink sm:text-[26px]">
              BilkulSaaf
            </span>
            <span className="mt-1 truncate font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-red">
              definitely · clean
            </span>
          </span>
        </Link>

        <Link
          href="/search"
          className="ml-auto hidden h-[42px] w-full max-w-[340px] items-center gap-2.5 rounded-xl border border-border-2 bg-white px-3.5 text-[13.5px] text-meta-4 transition-colors hover:border-red/50 hover:text-meta-1 lg:flex"
        >
          <SearchIcon size={15} className="flex-none" />
          People, cities, departments…
        </Link>

        <div className="flex flex-none items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={handleNewPost}
            className="hidden items-center gap-1.5 rounded-pill bg-red px-3 py-1.5 text-sm font-medium text-white md:flex lg:hidden"
          >
            <PlusIcon size={14} />
            New post
          </button>
          {!loading && !user && (
            <Link
              href="/login"
              className="rounded-pill bg-ink px-4 py-1.5 text-sm font-semibold text-white"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
