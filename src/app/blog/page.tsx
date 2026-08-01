import type { Metadata } from "next";
import { getArticles } from "@/lib/strapi";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "Build logs, competition recaps, and behind-the-scenes stories from the Grobots workshop.",
};

export default async function BlogPage() {
  const articles = await getArticles();
  return <BlogPageClient articles={articles} />;
}
