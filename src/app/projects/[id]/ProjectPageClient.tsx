"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowSquareOut,
  GithubLogo,
  Scales,
  Lightning,
  Shield,
  Gauge,
  Cpu,
  Flag,
  Wind,
  BatteryCharging,
  Trophy,
  ArrowsOutCardinal,
  Eye,
  SoccerBall,
  Robot,
  Brain,
  Medal,
  Sparkle,
  type IconProps,
} from "@phosphor-icons/react";
import type { Project } from "@/lib/strapi";

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  scales: Scales,
  lightning: Lightning,
  shield: Shield,
  gauge: Gauge,
  cpu: Cpu,
  flag: Flag,
  wind: Wind,
  "battery-charging": BatteryCharging,
  trophy: Trophy,
  "arrows-out-cardinal": ArrowsOutCardinal,
  eye: Eye,
  "soccer-ball": SoccerBall,
  robot: Robot,
  brain: Brain,
  medal: Medal,
};

interface ProjectPageClientProps {
  projects: Project[];
  id: string;
}

export default function ProjectPageClient({ projects, id }: ProjectPageClientProps) {
  useEffect(() => {
    document.body.classList.add("page-scrollable");
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove("page-scrollable");
    };
  }, [id]);

  const project = projects.find((p) => String(p.id) === id);
  const others = project
    ? [...projects].filter((p) => p.id !== project.id).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 4)
    : [];

  if (!project) {
    return (
      <div className="project-page">
        <p className="member-page__state">Project not found.</p>
        <Link href="/#projects" className="member-back">
          <ArrowLeft size={14} weight="bold" /> Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="project-page" style={{ backgroundColor: project.color }}>
      <Link href="/#projects" className="member-back">
        <ArrowLeft size={14} weight="bold" /> Back to projects
      </Link>

      <div className="project-hero">
        <div className="project-hero__image">
          {project.image && <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" priority />}
        </div>

        <div className="project-hero__info">
          <p className="project-hero__tag">
            {project.tag}
            {project.year ? ` · ${project.year}` : ""}
          </p>
          <h1 className="project-hero__title">{project.title}</h1>
          <p className="project-hero__desc">{project.description}</p>

          <div className="project-hero__links">
            {project.githubUrl && project.githubUrl !== "#" && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="member-social">
                <GithubLogo size={16} weight="fill" /> Source
              </a>
            )}
            {project.demoUrl && project.demoUrl !== "#" && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="member-social">
                <ArrowSquareOut size={16} weight="fill" /> Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {project.highlights.length > 0 && (
        <section className="project-highlights">
          {project.highlights.map((h, i) => {
            const Icon = ICON_MAP[h.icon] ?? Sparkle;
            return (
              <div key={i} className="project-highlight">
                <Icon size={22} weight="light" />
                <span className="project-highlight__title">{h.title}</span>
                <span className="project-highlight__desc">{h.description}</span>
              </div>
            );
          })}
        </section>
      )}

      {project.longDescription && (
        <section className="member-about project-about">
          <h2 className="member-about__label">About this build</h2>
          <p className="member-about__text">{project.longDescription}</p>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="project-gallery">
          {project.gallery.map((img, i) => (
            <div key={i} className="project-gallery__item">
              <Image
                src={img.src}
                alt={img.alt || `${project.title} detail ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </section>
      )}

      {others.length > 0 && (
        <aside className="member-peers project-others">
          <h2 className="member-about__label">More projects</h2>
          <div className="member-peers__grid project-others__grid">
            {others.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="member-peer">
                <div className="member-peer__avatar project-others__avatar">
                  {p.image && <Image src={p.image} alt={p.title} fill sizes="150px" />}
                </div>
                <span className="member-peer__name">{p.title}</span>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
