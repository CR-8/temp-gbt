import type { NextConfig } from "next";

// Media URLs the browser fetches directly (via NEXT_PUBLIC_STRAPI_URL) come
// from wherever the CMS is actually deployed — not always localhost — so the
// remote pattern is derived from that env var instead of hardcoded.
function strapiRemotePattern() {
  const raw = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const url = new URL(raw);
  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: "/uploads/**",
  };
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      strapiRemotePattern(),
      // Seed data uses picsum.photos as placeholder imagery until real
      // uploads replace it.
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
