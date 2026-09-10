"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClientError, login, register } from "@/lib/api/browser";
import { useAuth } from "@/components/auth/AuthProvider";

const PROMISES = [
  "Your real account never appears — the feed only ever sees a citizen number",
  "We never post, vote, or comment on your behalf",
  "You can keep browsing everything without an account",
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      if (mode === "register") {
        await register(email, password);
      } else {
        await login(email, password);
      }
      await refresh();
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1>{mode === "register" ? "Get your citizen number" : "Log in"}</h1>
      <p className="mt-2 text-text-muted">
        {mode === "register"
          ? "Say it without saying who you are."
          : "Welcome back, citizen."}
      </p>

      <ul className="mt-5 space-y-1.5 text-sm text-text-muted-2">
        {PROMISES.map((promise) => (
          <li key={promise}>· {promise}</li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-pill border border-border-5 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-pill border border-border-5 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-pill bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "…" : mode === "register" ? "Get my citizen number" : "Log in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "register" ? "login" : "register")}
        className="mt-4 w-full text-center text-sm text-text-muted hover:text-ink"
      >
        {mode === "register" ? "Already have an account? Log in" : "New here? Get a citizen number"}
      </button>
    </div>
  );
}
