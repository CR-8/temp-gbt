"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import Preloader from "../layout/Preloader";
import Navbar from "../layout/Navbar";
import Hero from "./Hero";
import About from "../about/About";
import Projects from "../projects/Projects";
import Achievements from "../achievements/Achievements";
import TeamPreview from "./TeamPreview";
import Footer from "../layout/Footer";
import type { SiteSettings, AboutData, Project, Achievement, TeamMember } from "@/lib/strapi";

gsap.registerPlugin(useGSAP, SplitText, CustomEase, ScrollTrigger);

interface HomeExperienceProps {
  site: SiteSettings;
  about: AboutData;
  projects: Project[];
  achievements: Achievement[];
  team: TeamMember[];
}

export default function HomeExperience({ site, about, projects, achievements, team }: HomeExperienceProps) {
  const counterRef = useRef<HTMLHeadingElement>(null);
  const counterContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lenis smooth scroll — integrates with GSAP ticker
  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const fallback = setTimeout(() => {
      document.body.style.overflow = "";
      ScrollTrigger.refresh();
    }, 5000);

    return () => {
      clearTimeout(fallback);
      lenis.destroy();
    };
  }, []);

  useGSAP(() => {
    CustomEase.create("hop", "0.9, 0, 0.1, 1");

    SplitText.create(".header h1", { type: "chars", charsClass: "char", mask: "chars" });
    SplitText.create(".navbar a", { type: "words", wordsClass: "word", mask: "words" });
    SplitText.create(".hero-footer p", { type: "words", wordsClass: "word", mask: "words" });

    const tl = gsap.timeline();
    const counter = { value: 0 };

    tl.to(
      counter,
      {
        value: 100,
        duration: 3,
        ease: "power3.out",
        onUpdate() {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.floor(counter.value));
          }
        },
        onComplete() {
          if (!counterRef.current || !counterContainerRef.current) return;
          const split = SplitText.create(counterRef.current, {
            type: "chars",
            charsClass: "digit",
            mask: "chars",
          });
          gsap.to(split.chars, {
            x: "-100%",
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.1,
            delay: 1,
            onComplete() {
              counterContainerRef.current?.remove();
            },
          });
        },
      },
      0
    );

    tl.to(counterContainerRef.current, { scale: 1, duration: 3, ease: "power3.out" }, "<");
    tl.to(progressBarRef.current, { scaleX: 1, duration: 3, ease: "power3.out" }, "<");
    tl.to(overlayRef.current, { opacity: 0, duration: 0.6, ease: "power2.out" }, 3.8);
    tl.to(bgRef.current, { clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)", duration: 1.5, ease: "hop" }, 4.5);
    tl.to(bgRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 2, ease: "hop" }, 6);
    tl.to(progressRef.current, { scaleX: 1, duration: 2, ease: "hop" }, 6);
    tl.to(".header h1 .char", { x: "0%", duration: 1, ease: "power4.out", stagger: 0.075 }, 7);
    tl.to(".navbar a .word", { y: "0%", duration: 1, ease: "power4.out", stagger: 0.075 }, 7.5);
    tl.to(".hero-footer p .word", { y: "0%", duration: 1, ease: "power4.out", stagger: 0.075 }, 7.5);

    tl.call(
      () => {
        overlayRef.current?.remove();
        document.body.style.overflow = "";
        ScrollTrigger.refresh();

        ScrollTrigger.create({
          trigger: ".hero",
          start: "bottom bottom",
          end: "bottom top",
          onLeave: () => gsap.to(progressBarRef.current, { opacity: 0, duration: 0.3 }),
          onEnterBack: () => gsap.to(progressBarRef.current, { opacity: 1, duration: 0.3 }),
        });
      },
      [],
      8.5
    );
  });

  return (
    <main style={{ position: "relative", width: "100%" }}>
      <Preloader
        counterRef={counterRef}
        counterContainerRef={counterContainerRef}
        overlayRef={overlayRef}
        progressBarRef={progressBarRef}
        progressRef={progressRef}
      />
      <Navbar brandName={site.brandName} links={site.navbarLinks} />
      <Hero
        bgRef={bgRef}
        title={site.heroTitle}
        tagline={site.brandTagline}
        footerItems={site.heroFooterItems}
        unicornProjectId={site.heroUnicornProjectId}
        unicornSdkUrl={site.heroUnicornSdkUrl}
      />
      <div id="about">
        <About about={about} />
      </div>
      <div id="projects">
        <Projects projects={projects} />
      </div>
      <div id="achievements">
        <Achievements achievements={achievements} label={site.achievementsLabel} />
      </div>
      <TeamPreview site={site} members={team} />
      <Footer site={site} />
    </main>
  );
}
