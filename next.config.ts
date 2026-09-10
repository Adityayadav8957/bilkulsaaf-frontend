import type { NextConfig } from "next";

// In production this app is expected to sit behind a reverse proxy that
// already routes /api/* to the Express backend on the same origin (so the
// httpOnly `token` cookie stays same-site with no CORS/SameSite complications).
// This rewrite exists purely so `next dev` reproduces that same-origin setup
// locally, pointed at API_ORIGIN (the backend's own address, e.g.
// http://127.0.0.1:5050/api during local dev).
const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:5000/api";

const nextConfig: NextConfig = {
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
