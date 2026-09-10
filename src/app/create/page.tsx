import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getMe } from "@/lib/api/auth";
import { ComposerWizard } from "@/components/composer/ComposerWizard";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Post anonymously",
  description: "File a new citizen report, anonymously.",
  path: "/create",
  noindex: true,
});

export const dynamic = "force-dynamic";

export default async function CreatePostPage() {
  const user = await getMe();
  if (!user) redirect("/login?redirect=/create");

  return <ComposerWizard />;
}
