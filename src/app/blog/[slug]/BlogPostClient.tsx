"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import Navbar from "@/components/layout/Navbar";
import type { Article } from "@/lib/strapi";

interface BlogPostClientProps {
  article: Article | null;
  articles: Article[];
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogPostClient({ article, articles }: BlogPostClientProps) {
  useEffect(() => {
    document.body.classList.add("page-scrollable");
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove("page-scrollable");
    };
  }, [article?.slug]);

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="blog-post">
          <p className="member-page__state">Post not found.</p>
          <Link href="/blog" className="member-back">
            <ArrowLeft size={14} weight="bold" /> Back to blog
          </Link>
        </div>
      </>
    );
  }

  const others = articles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <Navbar />
      <div className="blog-post">
        <Link href="/blog" className="member-back">
          <ArrowLeft size={14} weight="bold" /> Back to blog
        </Link>

        <header className="blog-post__header">
          {article.category && <span className="blog-card__category">{article.category.name}</span>}
          <h1 className="blog-post__title">{article.title}</h1>
          <div className="blog-post__byline">
            {article.author?.avatar && (
              <div className="blog-post__avatar">
                <Image src={article.author.avatar} alt={article.author.name} fill sizes="32px" />
              </div>
            )}
            {article.author?.name && <span>{article.author.name}</span>}
            {article.publishedDate && <span>{formatDate(article.publishedDate)}</span>}
          </div>
        </header>

        {article.coverImage && (
          <div className="blog-post__cover">
            <Image src={article.coverImage} alt={article.title} fill sizes="(max-width: 900px) 100vw, 900px" priority />
          </div>
        )}

        <div className="blog-post__body">
          <BlocksRenderer content={(article.body as BlocksContent) ?? []} />
        </div>

        {article.tags.length > 0 && (
          <div className="blog-post__tags">
            {article.tags.map((t) => (
              <span key={t.slug} className="blog-card__category">
                {t.name}
              </span>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <aside className="member-peers">
            <h2 className="member-about__label">More from the blog</h2>
            <div className="blog-grid">
              {others.map((a) => (
                <Link key={a.id} href={`/blog/${a.slug}`} className="blog-card">
                  {a.coverImage && (
                    <div className="blog-card__image">
                      <Image src={a.coverImage} alt={a.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  )}
                  <div className="blog-card__body">
                    {a.category && <span className="blog-card__category">{a.category.name}</span>}
                    <h3 className="blog-card__title">{a.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
