import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { cacheDel } from "@/lib/redis";

// Strapi content-type UID -> the Next.js fetch tag(s) / Redis key(s) it maps to.
const TAG_MAP: Record<string, { tags: string[]; redisKeys: string[] }> = {
  "site-setting": { tags: ["site-setting"], redisKeys: ["strapi:site-setting"] },
  about: { tags: ["about"], redisKeys: ["strapi:about"] },
  project: { tags: ["projects"], redisKeys: ["strapi:projects"] },
  achievement: { tags: ["achievements"], redisKeys: ["strapi:achievements"] },
  "team-member": { tags: ["team-members"], redisKeys: ["strapi:team-members"] },
  article: { tags: ["articles"], redisKeys: ["strapi:articles", "strapi:article:*"] },
  category: { tags: ["articles"], redisKeys: ["strapi:articles"] },
  tag: { tags: ["articles"], redisKeys: ["strapi:articles"] },
  author: { tags: ["articles"], redisKeys: ["strapi:articles"] },
};

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.STRAPI_REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  let model: string | undefined;
  try {
    const body = await request.json();
    model = body?.model;
  } catch {
    // Strapi webhooks always send JSON; ignore parse errors and fall through to revalidate everything.
  }

  const entry = model ? TAG_MAP[model] : undefined;
  const targets = entry ? [entry] : Object.values(TAG_MAP);

  for (const { tags, redisKeys } of targets) {
    for (const tag of tags) revalidateTag(tag, "max");
    for (const key of redisKeys) await cacheDel(key);
  }

  return NextResponse.json({ revalidated: true, model: model ?? "all" });
}
