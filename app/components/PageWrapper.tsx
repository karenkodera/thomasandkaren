"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import Hero from "./Hero";
import WheelSection from "./WheelSection";

export default function PageWrapper() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide1Y = useMotionValue(0);
  const animating = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWheel = useRef(0);

  const transitionTo = useCallback(
    (target: 0 | 1) => {
      if (animating.current) return;
      animating.current = true;

      const h = containerRef.current?.offsetHeight ?? window.innerHeight;
      const targetY = target === 1 ? h : 0;

      animate(slide1Y, targetY, {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      }).then(() => {
        setCurrentSlide(target);
        animating.current = false;
      });
    },
    [slide1Y]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheel.current < 900) return;
      if (e.deltaY > 0 && currentSlide === 0) {
        lastWheel.current = now;
        transitionTo(1);
      }
    },
    [currentSlide, transitionTo]
  );

  return (
    <div
      ref={containerRef}
      style={{ height: "100vh", overflow: "hidden", position: "relative" }}
      onWheel={handleWheel}
    >
      {/* Slide 2 — always underneath */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <WheelSection
          isActive={currentSlide === 1}
          onScrollUp={() => transitionTo(0)}
        />
      </div>

      {/* Slide 1 — on top, slides down to reveal slide 2 */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: slide1Y,
          zIndex: 1,
          background: "#fff",
        }}
      >
        <Hero />
      </motion.div>
    </div>
  );
}
