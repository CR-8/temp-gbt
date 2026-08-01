"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/strapi";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const CARD_Y_OFFSET = 5;
const CARD_SCALE_STEP = 0.075;

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      // Scroll-jacking a pinned, scrubbed animation is exactly the kind of
      // motion prefers-reduced-motion is meant to suppress — fall back to
      // the plain static stack rendered below instead.
      if (reducedMotion) return;

      const section = sectionRef.current;
      if (!section) return;

      const cards = section.querySelectorAll<HTMLElement>(".project-card");
      const total = cards.length;
      if (total === 0) return;

      const segmentSize = 1 / total;

      cards.forEach((card, i) => {
        gsap.set(card, { xPercent: -50, yPercent: -50 + i * CARD_Y_OFFSET, scale: 1 - i * CARD_SCALE_STEP });
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * total}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate(self) {
          const progress = self.progress;
          const activeIndex = Math.min(Math.floor(progress / segmentSize), total - 1);
          const segProgress = (progress - activeIndex * segmentSize) / segmentSize;

          cards.forEach((card, i) => {
            if (i < activeIndex) {
              gsap.set(card, { yPercent: -250, rotationX: 35 });
            } else if (i === activeIndex) {
              // The last card has no next card to reveal underneath it, so it
              // stays put instead of flying away — otherwise the pin holds an
              // empty frame for the final stretch of scroll before unpinning.
              const isLast = i === total - 1;
              gsap.set(card, {
                yPercent: isLast ? -50 : gsap.utils.interpolate(-50, -250, segProgress),
                rotationX: isLast ? 0 : gsap.utils.interpolate(0, 35, segProgress),
                scale: 1,
              });
            } else {
              const behindIndex = i - activeIndex;
              const currentYOffset = (behindIndex - segProgress) * CARD_Y_OFFSET;
              const currentScale = 1 - (behindIndex - segProgress) * CARD_SCALE_STEP;
              gsap.set(card, { yPercent: -50 + currentYOffset, rotationX: 0, scale: currentScale });
            }
          });
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: sectionRef, dependencies: [projects.length, reducedMotion], revertOnUpdate: true }
  );

  return (
    <section ref={sectionRef} className={`projects ${reducedMotion ? "projects--static" : ""}`}>
      {projects.map((project, i) => (
        <ProjectCard
          key={project.id}
          project={{
            id: project.id,
            tag: project.tag,
            title: project.title,
            description: project.description,
            image: project.image,
            color: project.color,
          }}
          index={i}
          total={projects.length}
        />
      ))}
    </section>
  );
}
