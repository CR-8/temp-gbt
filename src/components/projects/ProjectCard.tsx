"use client";

import Link from "next/link";
import Image from "next/image";

interface ProjectCardProps {
  project: {
    id: number;
    tag: string;
    title: string;
    description: string;
    image: string;
    color: string;
  };
  index: number;
  total: number;
}

export default function ProjectCard({ project, index, total }: ProjectCardProps) {
  return (
    <div
      className="project-card"
      id={`project-card-${project.id}`}
      style={{ backgroundColor: project.color, zIndex: total - index }}
    >
      <div className="project-card__col project-card__col--text">
        <p className="project-card__tag">{project.tag}</p>
        <h1 className="project-card__title">{project.title}</h1>
        <p className="project-card__desc">{project.description}</p>
        <Link href={`/projects/${project.id}`} className="project-card__link">
          View details →
        </Link>
      </div>
      <div className="project-card__col project-card__col--image">
        <Image src={project.image} alt={project.title} fill sizes="(max-width: 1000px) 90vw, 40vw" />
      </div>
    </div>
  );
}
