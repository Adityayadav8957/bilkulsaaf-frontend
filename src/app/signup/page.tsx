import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Get your citizen number",
  description: "Create an anonymous citizen account.",
  path: "/signup",
  noindex: true,
});

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm mode="register" />
    </Suspense>
  );
}
