import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getProjects } from "@/lib/strapi";
import ProjectPageClient from "./ProjectPageClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => String(p.id) === id);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description,
    openGraph: project.image ? { images: [{ url: project.image }] } : undefined,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isEnabled: draft } = await draftMode();
  const projects = await getProjects(draft);
  return <ProjectPageClient projects={projects} id={id} />;
}
