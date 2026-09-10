"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";

export function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // user cancelled the native share sheet — not an error
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Share"
      title={copied ? "Link copied" : "Share"}
      className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-text-muted-2 hover:bg-border-4"
    >
      <ShareIcon />
    </button>
  );
}
