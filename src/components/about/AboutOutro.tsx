"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AboutOutroProps {
  heading: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function AboutOutro({ heading, ctaLabel, ctaHref }: AboutOutroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !headingRef.current || !ctaRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      tl.fromTo(headingRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }).fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    },
    { dependencies: [heading, ctaLabel, ctaHref], revertOnUpdate: true }
  );

  if (!heading) return null;

  return (
    <section ref={sectionRef} className="about-outro">
      <h1 ref={headingRef}>{heading}</h1>
      <a ref={ctaRef} href={ctaHref} className="about-cta">
        {ctaLabel}
      </a>
    </section>
  );
}
