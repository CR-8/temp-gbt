"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import type { Article } from "@/lib/strapi";

interface BlogPageClientProps {
  articles: Article[];
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogPageClient({ articles }: BlogPageClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    document.body.classList.add("page-scrollable");
    return () => {
      document.body.classList.remove("page-scrollable");
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(articles.map((a) => a.category?.name).filter((c): c is string => Boolean(c)));
    return ["All", ...Array.from(cats)];
  }, [articles]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return articles;
    return articles.filter((a) => a.category?.name === activeCategory);
  }, [articles, activeCategory]);

  const featured = articles.find((a) => a.featured) ?? null;
  const rest = filtered.filter((a) => a.id !== featured?.id || activeCategory !== "All");

  return (
    <>
      <Navbar />
      <div className="blog-page">
        <header className="team-header">
          <h1 className="team-header__title">From the Workshop</h1>
          <p className="team-header__sub">
            Build logs, competition recaps, and behind-the-scenes stories from the Grobots workshop.
          </p>
        </header>

        {featured && activeCategory === "All" && (
          <Link href={`/blog/${featured.slug}`} className="blog-featured">
            {featured.coverImage && (
              <div className="blog-featured__image">
                <Image src={featured.coverImage} alt={featured.title} fill sizes="(max-width: 900px) 100vw, 60vw" priority />
              </div>
            )}
            <div className="blog-featured__info">
              {featured.category && <span className="blog-card__category">{featured.category.name}</span>}
              <h2 className="blog-featured__title">{featured.title}</h2>
              <p className="blog-featured__excerpt">{featured.excerpt}</p>
              <div className="blog-card__meta">
                {featured.author?.name && <span>{featured.author.name}</span>}
                {featured.publishedDate && <span>{formatDate(featured.publishedDate)}</span>}
              </div>
            </div>
          </Link>
        )}

        {categories.length > 1 && (
          <div className="team-filters">
            <div className="team-filters__tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`team-filters__tab ${activeCategory === c ? "team-filters__tab--active" : ""}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="blog-grid">
          {rest.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`} className="blog-card">
              {article.coverImage && (
                <div className="blog-card__image">
                  <Image src={article.coverImage} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <div className="blog-card__body">
                {article.category && <span className="blog-card__category">{article.category.name}</span>}
                <h3 className="blog-card__title">{article.title}</h3>
                <p className="blog-card__excerpt">{article.excerpt}</p>
                <div className="blog-card__meta">
                  {article.author?.name && <span>{article.author.name}</span>}
                  {article.publishedDate && <span>{formatDate(article.publishedDate)}</span>}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="team-grid__empty">No posts yet — check back soon.</p>}
        </div>
      </div>
    </>
  );
}
