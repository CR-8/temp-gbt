import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// Invoked by Strapi's preview handler (cms/config/admin.ts). Toggles Next.js
// draft mode and redirects into the page being previewed.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");
  const status = searchParams.get("status");

  if (!secret || secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  // Only ever redirect to a relative path on this site — never a full URL —
  // so this route can't be turned into an open redirect.
  if (!url || !url.startsWith("/") || url.startsWith("//")) {
    return new Response("Invalid preview path", { status: 400 });
  }

  const draft = await draftMode();
  if (status === "published") {
    draft.disable();
  } else {
    draft.enable();
  }

  redirect(url);
}
