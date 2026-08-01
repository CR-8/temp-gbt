"use client";

import dynamic from "next/dynamic";
import type { SiteSettings, AboutData, Project, Achievement, TeamMember } from "@/lib/strapi";

// The whole animated experience (GSAP timelines, Lenis, WebGL hero) is
// browser-only — keep it out of the server render, see AGENTS.md re: this
// Next.js version's Vite-SPA migration guidance for why this boundary exists.
const HomeExperience = dynamic(() => import("@/components/home/HomeExperience"), { ssr: false });

interface HomeClientProps {
  site: SiteSettings;
  about: AboutData;
  projects: Project[];
  achievements: Achievement[];
  team: TeamMember[];
}

export default function HomeClient(props: HomeClientProps) {
  return <HomeExperience {...props} />;
}
