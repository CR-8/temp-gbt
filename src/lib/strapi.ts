import { cacheGet, cacheSet } from "./redis";

// Server-to-server calls (this file only ever runs on the server) can use a
// Docker-internal hostname like `http://cms:1337`. Media URLs returned to the
// browser must instead use NEXT_PUBLIC_STRAPI_URL, a host the browser can
// actually resolve — the two are deliberately different in a Docker deploy.
const STRAPI_INTERNAL_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Server-render freshness window; a Strapi webhook hits /api/revalidate for
// instant updates, this is just the fallback ceiling.
const REVALIDATE_SECONDS = 60;
// Redis is a second cache layer in front of Strapi itself, so repeated
// requests across many concurrent visitors don't all hit the CMS.
const REDIS_TTL_SECONDS = 60;

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface ResultItem {
  event: string;
  category: string | null;
  position: number;
}

export interface SiteSettings {
  brandName: string;
  brandTagline: string;
  heroTitle: string;
  heroUnicornProjectId: string;
  heroUnicornSdkUrl: string;
  heroFooterItems: string[];
  navbarLinks: LinkItem[];
  footerPhone: string;
  footerEmail: string;
  footerLinks: LinkItem[];
  footerSocial: LinkItem[];
  footerLegal: LinkItem[];
  teamPreviewLabel: string;
  teamPreviewFeaturedBatch: string;
  teamPreviewCtaLabel: string;
  teamPreviewCtaHref: string;
  achievementsLabel: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface AboutData {
  introHeading: string;
  introSubheading: string;
  outroHeading: string;
  outroCtaLabel: string;
  outroCtaHref: string;
  galleryHeadings: string[];
  galleryImages: GalleryImage[];
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface Project {
  id: number;
  title: string;
  tag: string;
  description: string;
  image: string;
  color: string;
  sortOrder: number;
  year: number;
  longDescription: string;
  gallery: GalleryImage[];
  highlights: FeatureCard[];
  githubUrl: string;
  demoUrl: string;
}

export interface Achievement {
  id: number;
  name: string;
  location: string;
  year: number;
  results: ResultItem[];
  image: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  branch: string;
  batch: string;
  isAlumni: boolean;
  image: string;
  linkedin: string;
  github: string;
  instagram: string;
  email: string;
  bio: string;
  sortOrder: number;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  body: unknown;
  publishedDate: string;
  featured: boolean;
  category: { name: string; slug: string } | null;
  author: { name: string; avatar: string } | null;
  tags: { name: string; slug: string }[];
  seo: { metaTitle: string; metaDescription: string; shareImage: string } | null;
}

// Strapi's raw REST response shape before we normalize it into the typed
// interfaces above — fields are dynamic per content type, hence `unknown`.
type StrapiRawEntry = Record<string, unknown>;

/** Resolve a Strapi media `url` (relative in dev, absolute if using S3/CDN) to a servable URL. */
export function strapiMediaUrl(media: StrapiMedia | null | undefined): string {
  if (!media?.url) return "";
  return media.url.startsWith("http") ? media.url : `${STRAPI_PUBLIC_URL}${media.url}`;
}

async function strapiFetch<T>(path: string, { cacheKey, tag }: { cacheKey: string; tag: string }): Promise<T | null> {
  const cached = await cacheGet<T>(cacheKey);
  if (cached) return cached;

  const headers: Record<string, string> = {};
  if (STRAPI_API_TOKEN) headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;

  try {
    const res = await fetch(`${STRAPI_INTERNAL_URL}/api${path}`, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
    });
    if (!res.ok) {
      console.error(`[strapi] ${path} -> ${res.status} ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    const data = (json?.data ?? null) as T | null;
    if (data) await cacheSet(cacheKey, data, REDIS_TTL_SECONDS);
    return data;
  } catch (err) {
    console.error(`[strapi] ${path} failed:`, err);
    return null;
  }
}

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === "number" ? v : fallback);
const bool = (v: unknown): boolean => v === true;
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const media = (v: unknown): StrapiMedia | null => (v && typeof v === "object" ? (v as StrapiMedia) : null);
const mediaArray = (v: unknown): StrapiMedia[] => (Array.isArray(v) ? (v as StrapiMedia[]) : []);
const entryId = (v: unknown): number => (typeof v === "number" ? v : 0);

function flattenLinks(links: unknown): LinkItem[] {
  if (!Array.isArray(links)) return [];
  return links.map((l) => {
    const entry = (l ?? {}) as StrapiRawEntry;
    return { label: str(entry.label), href: str(entry.href) };
  });
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const raw = await strapiFetch<StrapiRawEntry>("/site-setting?populate=*", {
    cacheKey: "strapi:site-setting",
    tag: "site-setting",
  });
  if (!raw) return null;
  return {
    brandName: str(raw.brandName),
    brandTagline: str(raw.brandTagline),
    heroTitle: str(raw.heroTitle),
    heroUnicornProjectId: str(raw.heroUnicornProjectId),
    heroUnicornSdkUrl: str(raw.heroUnicornSdkUrl),
    heroFooterItems: strArray(raw.heroFooterItems),
    navbarLinks: flattenLinks(raw.navbarLinks),
    footerPhone: str(raw.footerPhone),
    footerEmail: str(raw.footerEmail),
    footerLinks: flattenLinks(raw.footerLinks),
    footerSocial: flattenLinks(raw.footerSocial),
    footerLegal: flattenLinks(raw.footerLegal),
    teamPreviewLabel: str(raw.teamPreviewLabel),
    teamPreviewFeaturedBatch: str(raw.teamPreviewFeaturedBatch),
    teamPreviewCtaLabel: str(raw.teamPreviewCtaLabel),
    teamPreviewCtaHref: str(raw.teamPreviewCtaHref),
    achievementsLabel: str(raw.achievementsLabel),
  };
}

export async function getAbout(): Promise<AboutData | null> {
  const raw = await strapiFetch<StrapiRawEntry>("/about?populate=*", {
    cacheKey: "strapi:about",
    tag: "about",
  });
  if (!raw) return null;
  return {
    introHeading: str(raw.introHeading),
    introSubheading: str(raw.introSubheading),
    outroHeading: str(raw.outroHeading),
    outroCtaLabel: str(raw.outroCtaLabel),
    outroCtaHref: str(raw.outroCtaHref),
    galleryHeadings: strArray(raw.galleryHeadings),
    galleryImages: mediaArray(raw.galleryImages).map((img) => ({
      src: strapiMediaUrl(img),
      alt: img.alternativeText ?? "",
    })),
  };
}

function flattenFeatureCards(cards: unknown): FeatureCard[] {
  if (!Array.isArray(cards)) return [];
  return cards.map((c) => {
    const entry = (c ?? {}) as StrapiRawEntry;
    return { icon: str(entry.icon), title: str(entry.title), description: str(entry.description) };
  });
}

export async function getProjects(): Promise<Project[]> {
  const raw = await strapiFetch<StrapiRawEntry[]>("/projects?populate=*&sort=sortOrder:asc", {
    cacheKey: "strapi:projects",
    tag: "projects",
  });
  return (raw ?? []).map((p) => ({
    id: entryId(p.id),
    title: str(p.title),
    tag: str(p.tag),
    description: str(p.description),
    image: strapiMediaUrl(media(p.image)),
    color: str(p.color, "#111"),
    sortOrder: num(p.sortOrder),
    year: num(p.year),
    longDescription: str(p.longDescription),
    gallery: mediaArray(p.gallery).map((img) => ({ src: strapiMediaUrl(img), alt: img.alternativeText ?? "" })),
    highlights: flattenFeatureCards(p.highlights),
    githubUrl: str(p.githubUrl),
    demoUrl: str(p.demoUrl),
  }));
}

export async function getAchievements(): Promise<Achievement[]> {
  const raw = await strapiFetch<StrapiRawEntry[]>("/achievements?populate=*", {
    cacheKey: "strapi:achievements",
    tag: "achievements",
  });
  return (raw ?? []).map((a) => ({
    id: entryId(a.id),
    name: str(a.name),
    location: str(a.location),
    year: num(a.year),
    results: Array.isArray(a.results)
      ? a.results.map((r) => {
          const entry = (r ?? {}) as StrapiRawEntry;
          return {
            event: str(entry.event),
            category: typeof entry.category === "string" ? entry.category : null,
            position: num(entry.position),
          };
        })
      : [],
    image: strapiMediaUrl(media(a.image)),
  }));
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const raw = await strapiFetch<StrapiRawEntry[]>(
    "/team-members?populate=*&pagination[pageSize]=200&sort=sortOrder:asc",
    { cacheKey: "strapi:team-members", tag: "team-members" }
  );
  return (raw ?? []).map((m) => ({
    id: entryId(m.id),
    name: str(m.name),
    role: str(m.role),
    department: str(m.department),
    branch: str(m.branch),
    batch: str(m.batch),
    isAlumni: bool(m.isAlumni),
    image: strapiMediaUrl(media(m.photo)),
    linkedin: str(m.linkedin),
    github: str(m.github),
    instagram: str(m.instagram),
    email: str(m.email),
    bio: str(m.bio),
    sortOrder: num(m.sortOrder),
  }));
}

// populate=* only populates relations/media one level deep in Strapi v5, so
// media nested inside a relation (author.avatar, seo.shareImage) needs its
// own explicit populate clause or it comes back empty.
const ARTICLE_POPULATE =
  "populate[coverImage]=true&populate[author][populate]=avatar&populate[category]=true&populate[tags]=true&populate[seo][populate]=shareImage";

function mapArticle(a: StrapiRawEntry): Article {
  const category = a.category as StrapiRawEntry | null;
  const author = a.author as StrapiRawEntry | null;
  const seo = a.seo as StrapiRawEntry | null;
  return {
    id: entryId(a.id),
    title: str(a.title),
    slug: str(a.slug),
    excerpt: str(a.excerpt),
    coverImage: strapiMediaUrl(media(a.coverImage)),
    body: a.body ?? null,
    publishedDate: str(a.publishedDate),
    featured: bool(a.featured),
    category: category ? { name: str(category.name), slug: str(category.slug) } : null,
    author: author ? { name: str(author.name), avatar: strapiMediaUrl(media(author.avatar)) } : null,
    tags: Array.isArray(a.tags)
      ? a.tags.map((t) => {
          const entry = (t ?? {}) as StrapiRawEntry;
          return { name: str(entry.name), slug: str(entry.slug) };
        })
      : [],
    seo: seo
      ? { metaTitle: str(seo.metaTitle), metaDescription: str(seo.metaDescription), shareImage: strapiMediaUrl(media(seo.shareImage)) }
      : null,
  };
}

export async function getArticles(): Promise<Article[]> {
  const raw = await strapiFetch<StrapiRawEntry[]>(`/articles?${ARTICLE_POPULATE}&sort=publishedDate:desc`, {
    cacheKey: "strapi:articles",
    tag: "articles",
  });
  return (raw ?? []).map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const raw = await strapiFetch<StrapiRawEntry[]>(
    `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&${ARTICLE_POPULATE}`,
    { cacheKey: `strapi:article:${slug}`, tag: `article:${slug}` }
  );
  const first = raw?.[0];
  return first ? mapArticle(first) : null;
}
