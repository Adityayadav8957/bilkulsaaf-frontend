import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getMe } from "@/lib/api/auth";
import { ComposerWizard } from "@/components/composer/ComposerWizard";
import { buildMetadata } from "@/lib/seo/metadata";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = buildMetadata({
  title: "Post anonymously",
  description: "File a new citizen report, anonymously.",
  path: "/create",
  noindex: true,
});

export default async function CreatePostPage() {
  const user = await getMe();
  if (!user) redirect("/login?redirect=/create");

  return <ComposerWizard />;
}
