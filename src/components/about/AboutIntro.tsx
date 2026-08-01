"use client";

import SplitText from "../ui/SplitText";

interface AboutIntroProps {
  heading: string;
}

export default function AboutIntro({ heading }: AboutIntroProps) {
  return (
    <section className="about-intro">
      {heading && (
        <SplitText
          text={heading}
          tag="h1"
          className="about-intro__heading"
          splitType="words"
          from={{ opacity: 0, y: 50 }}
          to={{ opacity: 1, y: 0 }}
          duration={1}
          delay={60}
          ease="power3.out"
          threshold={0.2}
          rootMargin="-80px"
          textAlign="center"
        />
      )}
    </section>
  );
}
