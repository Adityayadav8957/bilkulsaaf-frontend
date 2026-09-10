import type { Metadata } from "next";
import { instrumentSans, plexMono, fraunces, ptSerif } from "@/lib/fonts";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { NewsTicker } from "@/components/layout/NewsTicker";
import { Providers } from "@/components/layout/Providers";
import { getFeed } from "@/lib/api/posts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A satirical public feed where anonymous citizens post about public officials, vote on how clean it looks, and argue about it in the comments.",
};

export const revalidate = 60;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const ticker = await getFeed({ sort: "trending", limit: 10 }).catch(() => null);
  const tickerItems = (ticker?.items ?? []).map((post) => ({
    label: `${post.personSnapshot.name} — ${post.description.slice(0, 70)}${post.description.length > 70 ? "…" : ""}`,
    href: `/posts/${post.slug || post._id}`,
  }));

  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${plexMono.variable} ${fraunces.variable} ${ptSerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-bg-outer text-text antialiased">
        <Providers>
          <Header />
          <NewsTicker items={tickerItems} />
          <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-0 lg:gap-7 lg:px-6">
            <DesktopSidebar />
            <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
          </div>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
