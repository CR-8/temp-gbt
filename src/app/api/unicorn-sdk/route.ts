import { NextRequest, NextResponse } from "next/server";
import { cacheGetRaw, cacheSetRaw } from "@/lib/redis";

// The Unicorn Studio SDK is a large, effectively-static third-party script
// used to render the hero's 3D background. Fetching it fresh from jsdelivr
// on every visitor is wasted latency, so we cache the bytes in Redis and
// serve them from our own origin — Docker-friendly, no external CDN
// round-trip after the first fetch.
const DEFAULT_SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.6/dist/unicornStudio.umd.js";
const CACHE_KEY = "unicorn-sdk:script";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 1 week — the SDK is versioned/pinned, so it never changes underneath us

export async function GET(request: NextRequest) {
  const sdkUrl = request.nextUrl.searchParams.get("src") || DEFAULT_SDK_URL;

  const cached = await cacheGetRaw(CACHE_KEY);
  if (cached) {
    return new NextResponse(cached, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const upstream = await fetch(sdkUrl, { next: { revalidate: TTL_SECONDS } });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch Unicorn Studio SDK" }, { status: 502 });
    }
    const script = await upstream.text();
    await cacheSetRaw(CACHE_KEY, script, TTL_SECONDS);

    return new NextResponse(script, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Cache": "MISS",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unicorn Studio SDK unavailable" }, { status: 502 });
  }
}
