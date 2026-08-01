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
    // Local dev points NEXT_PUBLIC_STRAPI_URL at localhost:1337, which
    // Next 16 blocks by default (SSRF hardening treats any private/loopback
    // IP as untrusted). Safe here since it's only ever a private-network URL.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
