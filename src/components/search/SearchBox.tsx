"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

export function SearchBox({
  initialQuery,
  initialType,
}: {
  initialQuery: string;
  initialType: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const usp = new URLSearchParams({ q, type: initialType });
    router.push(`/search?${usp.toString()}`);
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <div
        className={`flex flex-1 items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition-all duration-200 ${
          isFocused
            ? "border-ink shadow-[0_0_0_4px_rgba(19,19,18,0.08)]"
            : "border-border-5 shadow-[0_1px_2px_rgba(19,19,18,0.03)]"
        }`}
      >
        <span
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full transition-colors ${
            isFocused ? "bg-ink text-white" : "bg-border-4 text-meta-2"
          }`}
        >
          <SearchIcon size={14} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="People, cities, organisations, posts…"
          aria-label="Search people, cities, organisations, and posts"
          className="min-w-0 w-full bg-transparent text-sm text-ink outline-none placeholder:text-meta-3"
        />
      </div>
      <button
        type="submit"
        className="rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white transition-transform active:scale-[0.98] sm:self-stretch"
      >
        Search
      </button>
    </form>
  );
}
