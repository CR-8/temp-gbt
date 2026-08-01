"use client";

import { type RefObject } from "react";

interface PreloaderProps {
  counterRef: RefObject<HTMLHeadingElement | null>;
  counterContainerRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  progressBarRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLDivElement | null>;
}

export default function Preloader({
  counterRef,
  counterContainerRef,
  overlayRef,
  progressBarRef,
  progressRef,
}: PreloaderProps) {
  return (
    <>
      <div ref={overlayRef} className="preloader-overlay" />
      <div ref={counterContainerRef} className="preloader-counter">
        <h1 ref={counterRef}>0</h1>
      </div>
      <div ref={progressBarRef} className="progress-bar">
        <div ref={progressRef} className="progress" />
      </div>
    </>
  );
}
