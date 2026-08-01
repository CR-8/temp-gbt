"use client";

import AboutIntro from "./AboutIntro";
import AboutGallery from "./AboutGallery";
import type { AboutData } from "@/lib/strapi";

interface AboutProps {
  about: AboutData;
}

export default function About({ about }: AboutProps) {
  return (
    <div className="about">
      <AboutIntro heading={about.introHeading} />
      <AboutGallery headings={about.galleryHeadings} images={about.galleryImages} />
    </div>
  );
}
