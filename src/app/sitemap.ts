import type { MetadataRoute } from "next";
import { getTeamMembers, getProjects, getArticles } from "@/lib/strapi";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [members, projects, articles] = await Promise.all([getTeamMembers(), getProjects(), getArticles()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/team`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
  ];

  const memberRoutes: MetadataRoute.Sitemap = members.map((m) => ({
    url: `${SITE_URL}/team/${m.id}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: a.publishedDate || undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...memberRoutes, ...projectRoutes, ...articleRoutes];
}
