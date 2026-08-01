"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SPRING = { damping: 25, stiffness: 200, mass: 0.5 };

export function useAchievementHover() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  function onContainerMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  return { springX, springY, activeImage, setActiveImage, onContainerMouseMove };
}

interface AchievementFloatingImageProps {
  src: string | null;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function AchievementFloatingImage({ src, x, y }: AchievementFloatingImageProps) {
  // Purely decorative and driven by continuous cursor motion — skip it
  // entirely for users who've asked for reduced motion.
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {src && !reducedMotion && (
        <motion.div
          className="achievement-hover-image"
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <Image src={src} alt="" fill sizes="220px" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
