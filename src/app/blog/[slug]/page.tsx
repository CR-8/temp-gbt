import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getArticleBySlug, getArticles } from "@/lib/strapi";
import BlogPostClient from "./BlogPostClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Post not found" };

  const title = article.seo?.metaTitle || article.title;
  const description = article.seo?.metaDescription || article.excerpt;
  const image = article.seo?.shareImage || article.coverImage;

  return {
    title,
    description,
    openGraph: image ? { title, description, images: [{ url: image }] } : { title, description },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const [article, articles] = await Promise.all([getArticleBySlug(slug, draft), getArticles(draft)]);
  return <BlogPostClient article={article} articles={articles} />;
}
