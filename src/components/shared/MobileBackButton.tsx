"use client";

import { useRouter } from "next/navigation";

export function MobileBackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-1.5 rounded-full border border-border-2 bg-white px-3 py-2 text-sm font-medium text-text-muted shadow-sm transition-colors active:bg-border-4"
      aria-label="Go back"
    >
      <span aria-hidden="true" className="text-lg leading-none">←</span>
      Back
    </button>
  );
}
