"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { GalleryImage } from "@/lib/strapi";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  maxCardCount: 16,
  cardWidth: 250,
  cardHeight: 300,
  animationDuration: 0.75,
  animationOverlap: 0.5,
  headingFadeDuration: 0.5,
};

interface CardData {
  element: HTMLDivElement;
  centerX: number;
  centerY: number;
}

interface AboutGalleryProps {
  headings: string[];
  images: GalleryImage[];
}

export default function AboutGallery({ headings, images }: AboutGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const activeCards = useRef<CardData[]>([]);
  const currentSection = useRef(0);
  const isAnimating = useRef(false);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      // This entire section is a continuous scroll-jacked card-swap
      // animation with no non-JS content underneath it — skip it and render
      // the static grid below instead for prefers-reduced-motion.
      if (reducedMotion) return;

      const section = sectionRef.current;
      const heading = headingRef.current;
      if (!section || !heading || images.length === 0) return;

      const numSections = Math.max(1, headings.length);
      const cardCount = Math.max(1, Math.min(CONFIG.maxCardCount, images.length));

      function getViewport() {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const halfDiag = Math.sqrt((W / 2) ** 2 + (H / 2) ** 2);
        const innerRadius = halfDiag * 0.45;
        const outerRadius = halfDiag * 0.9;
        return { centerX: W / 2, centerY: H / 2, W, H, innerRadius, outerRadius };
      }

      function getEdgePosition(cx: number, cy: number) {
        const offsetVariation = () => (Math.random() - 0.5) * 400;
        const hw = CONFIG.cardWidth / 2;
        const hh = CONFIG.cardHeight / 2;
        const distances = {
          left: cx,
          right: window.innerWidth - cx,
          top: cy,
          bottom: window.innerHeight - cy,
        };
        const min = Math.min(...Object.values(distances));
        if (min === distances.left) return { x: -350 - Math.random() * 200, y: cy - hh + offsetVariation() };
        if (min === distances.right) return { x: window.innerWidth + 100 + Math.random() * 200, y: cy - hh + offsetVariation() };
        if (min === distances.top) return { x: cx - hw + offsetVariation(), y: -450 - Math.random() * 200 };
        return { x: cx - hw + offsetVariation(), y: window.innerHeight + 100 + Math.random() * 200 };
      }

      function createCards(setIndex: number): CardData[] {
        const vp = getViewport();
        const cards: CardData[] = [];
        const angleStep = (Math.PI * 2) / cardCount;

        for (let i = 0; i < cardCount; i++) {
          const card = document.createElement("div");
          card.className = "about-card";

          const img = document.createElement("img");
          const imgIdx = (setIndex * cardCount + i) % images.length;
          img.src = images[imgIdx]?.src ?? "";
          img.alt = images[imgIdx]?.alt ?? "";
          img.loading = "lazy";
          card.appendChild(img);

          const jitter = (Math.random() - 0.5) * angleStep * 0.6;
          const angle = i * angleStep + jitter;
          const radius = vp.innerRadius + Math.random() * (vp.outerRadius - vp.innerRadius);
          const cx = vp.centerX + Math.cos(angle) * radius;
          const cy = vp.centerY + Math.sin(angle) * radius;
          const left = cx - CONFIG.cardWidth / 2;
          const top = cy - CONFIG.cardHeight / 2;
          const rotation = Math.random() * 50 - 25;

          card.style.cssText = `position:absolute;left:${left}px;top:${top}px;transform:rotate(${rotation}deg)`;
          section!.appendChild(card);
          gsap.set(card, { left, top, rotation });

          cards.push({ element: card, centerX: cx, centerY: cy });
        }
        return cards;
      }

      function animateHeading(newText: string) {
        return gsap
          .timeline()
          .to(heading!, { opacity: 0, duration: CONFIG.headingFadeDuration, ease: "power2.inOut" })
          .call(() => {
            heading!.textContent = newText;
          })
          .to(heading!, { opacity: 1, duration: CONFIG.headingFadeDuration, ease: "power2.inOut" });
      }

      function animateCards(exiting: CardData[], entering: CardData[]) {
        const tl = gsap.timeline();
        exiting.forEach(({ element, centerX, centerY }) => {
          const edge = getEdgePosition(centerX, centerY);
          tl.to(
            element,
            {
              left: edge.x,
              top: edge.y,
              rotation: Math.random() * 180 - 90,
              ease: "power2.in",
              duration: CONFIG.animationDuration,
              onComplete: () => element.remove(),
            },
            0
          );
        });
        entering.forEach(({ element, centerX, centerY }) => {
          const edge = getEdgePosition(centerX, centerY);
          gsap.set(element, { left: edge.x, top: edge.y, rotation: Math.random() * 180 - 90 });
          tl.to(
            element,
            {
              left: centerX - CONFIG.cardWidth / 2,
              top: centerY - CONFIG.cardHeight / 2,
              rotation: Math.random() * 50 - 25,
              ease: "power2.out",
              duration: CONFIG.animationDuration,
            },
            CONFIG.animationOverlap
          );
        });
        return tl;
      }

      function getSectionIndex(progress: number) {
        return Math.min(numSections - 1, Math.floor(progress * numSections));
      }

      function transitionTo(nextIndex: number) {
        if (isAnimating.current || nextIndex === currentSection.current) return;
        isAnimating.current = true;
        const nextCards = createCards(nextIndex);
        const master = gsap.timeline({
          onComplete: () => {
            isAnimating.current = false;
          },
        });
        master.add(animateCards(activeCards.current, nextCards), 0);
        master.add(animateHeading(headings[nextIndex] ?? headings[0]), 0);
        activeCards.current = nextCards;
        currentSection.current = nextIndex;
      }

      section.querySelectorAll(".about-card").forEach((el) => el.remove());
      activeCards.current = createCards(0);
      currentSection.current = 0;
      heading.textContent = headings[0] ?? "";
      gsap.set(heading, { opacity: 1 });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * numSections * 1.5}`,
        pin: true,
        pinSpacing: true,
        onUpdate(self) {
          transitionTo(getSectionIndex(self.progress));
        },
      });

      ScrollTrigger.refresh();

      function onResize() {
        activeCards.current.forEach(({ element }) => element.remove());
        activeCards.current = createCards(currentSection.current);
      }
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        activeCards.current.forEach(({ element }) => element.remove());
        activeCards.current = [];
        section.querySelectorAll(".about-card").forEach((el) => el.remove());
      };
    },
    {
      dependencies: [JSON.stringify(images), JSON.stringify(headings), reducedMotion],
      revertOnUpdate: true,
    }
  );

  if (reducedMotion) {
    return (
      <section className="about-gallery about-gallery--static">
        {headings.map((h, i) => (
          <h2 key={i} className="about-gallery__static-heading">
            {h}
          </h2>
        ))}
        <div className="about-gallery__static-grid">
          {images.map((img, i) => (
            <div key={i} className="about-gallery__static-item">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 45vw, 200px" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="about-gallery">
      <h1 ref={headingRef} className="about-gallery__heading" />
    </section>
  );
}
