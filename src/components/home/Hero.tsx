"use client";

import { type RefObject } from "react";
import dynamic from "next/dynamic";
import HeroFooter from "./HeroFooter";

// unicornstudio-react renders a WebGL canvas driven by `window`/`document` —
// keep it out of the server render entirely.
const UnicornScene = dynamic(() => import("unicornstudio-react"), { ssr: false });

interface HeroProps {
  bgRef: RefObject<HTMLDivElement | null>;
  title: string;
  tagline: string;
  footerItems: string[];
  unicornProjectId: string;
  unicornSdkUrl: string;
}

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export default function Hero({ bgRef, title, tagline, footerItems, unicornProjectId, unicornSdkUrl }: HeroProps) {
  const projectId = unicornProjectId || "gK3lOic9aLAOUfbUjBXK";
  // Route through our own Redis-cached proxy so the SDK is only ever fetched
  // from jsdelivr once, instead of on every visitor's cold load.
  const sdkUrl = `/api/unicorn-sdk${unicornSdkUrl ? `?src=${encodeURIComponent(unicornSdkUrl)}` : ""}`;

  return (
    <section className="hero">
      <div ref={bgRef} className="hero-bg">
        <UnicornScene
          projectId={projectId}
          sdkUrl={sdkUrl}
          width="100%"
          height="100%"
          lazyLoad={true}
          dpi={isMobile ? 1 : 1.5}
          fps={isMobile ? 30 : 60}
          scale={1}
        />
      </div>
      <div className="header">
        <h1>
          {(title || "Grobots").split("").map((char, i) => (
            <span key={i} className="overflow-hidden" style={{ display: "inline-block" }}>
              <span className="char">{char}</span>
            </span>
          ))}
        </h1>
        {tagline && <p className="hero-tagline">{tagline}</p>}
      </div>
      <HeroFooter items={footerItems} />
    </section>
  );
}
