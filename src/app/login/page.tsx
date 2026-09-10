import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/seo/metadata";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = buildMetadata({
  title: "Log in",
  description: "Log in or get your anonymous citizen number.",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm mode="login" />
    </Suspense>
  );
}
