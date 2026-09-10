import type { NextConfig } from "next";

// In production this app is expected to sit behind a reverse proxy that
// already routes /api/* to the Express backend on the same origin (so the
// httpOnly `token` cookie stays same-site with no CORS/SameSite complications).
// This rewrite exists purely so `next dev` reproduces that same-origin setup
// locally, pointed at API_ORIGIN (the backend's own address, e.g.
// http://127.0.0.1:5050/api during local dev).
const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:5000/api";

const nextConfig: NextConfig = {
  // Cache Components (Next 16) replaces the old route-segment caching configs
  // (`dynamic` / `revalidate` / `fetchCache`) with `use cache` + `cacheLife`,
  // and turns on Partial Prerendering by default: every route ships a static
  // App Shell instantly on navigation while genuinely dynamic parts stream in
  // behind <Suspense>. It also keeps recently-visited routes mounted via
  // React's <Activity>, so bottom-nav tab switching feels app-like.
  cacheComponents: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
