import { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { instrumentSans, plexMono, fraunces, ptSerif } from "@/lib/fonts";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { NewsTicker } from "@/components/layout/NewsTicker";
import { SplashScreen } from "@/components/layout/SplashScreen";
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

/**
 * The breaking-news ticker. The root layout wraps every route, so this fetch
 * used to block every navigation in the app. It's cached (~60s, matching the
 * old `revalidate = 60`) so it prerenders into each route's App Shell, and it
 * still degrades to an empty ticker if the backend is unreachable.
 */
async function TickerBar() {
  "use cache";
  cacheLife("minutes");

  const ticker = await getFeed({ sort: "trending", limit: 10 }).catch(() => null);
  const tickerItems = (ticker?.items ?? []).map((post) => ({
    label: `${post.personSnapshot.name} — ${post.description.slice(0, 70)}${post.description.length > 70 ? "…" : ""}`,
    href: `/posts/${post.slug || post._id}`,
  }));

  return <NewsTicker items={tickerItems} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${plexMono.variable} ${fraunces.variable} ${ptSerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-bg-outer text-text antialiased">
        <SplashScreen />
        <Providers>
          <Header />
          {/* NewsTicker renders nothing when it has no items, so an empty
              fallback matches both the loading and the backend-down states. */}
          <Suspense fallback={null}>
            <TickerBar />
          </Suspense>
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
