"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    if (isPending) return;
    setIsPending(true);
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-pill border border-white/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-50"
    >
      {isPending ? "Logging out…" : "Log out"}
    </button>
  );
}
