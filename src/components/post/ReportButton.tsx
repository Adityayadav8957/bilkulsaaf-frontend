"use client";

import { useState, useTransition } from "react";
import { ApiClientError, reportContent } from "@/lib/api/browser";
import { useAuthGate } from "@/components/auth/AuthGateProvider";
import { MoreIcon } from "@/components/icons";

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment";
  targetId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const { requireAuth } = useAuthGate();

  function submit() {
    if (isPending || done) return;
    startTransition(async () => {
      try {
        await reportContent({
          targetType,
          targetId,
          reason: "Flagged by a reader from the post page",
        });
        setDone(true);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          requireAuth("Report anonymously");
        }
      }
    });
  }

  if (done) return <span className="text-xs text-meta-2">Reported</span>;

  return (
    <button
      type="button"
      onClick={submit}
      disabled={isPending}
      aria-label="Report"
      title="Report"
      className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-meta-3 hover:bg-border-4 hover:text-ink"
    >
      <MoreIcon />
    </button>
  );
}
