"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import Hero from "./Hero";
import WheelSection from "./WheelSection";
import ReasonsSection from "./ReasonsSection";
import WhatNextSection from "./WhatNextSection";

export default function PageWrapper() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderY = useMotionValue(0);
  const animating = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWheel = useRef(0);

  const transitionTo = useCallback(
    (target: 0 | 1 | 2 | 3) => {
      if (animating.current) return;
      animating.current = true;

      const h = containerRef.current?.offsetHeight ?? window.innerHeight;
      animate(sliderY, -target * h, {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      }).then(() => {
        setCurrentSlide(target);
        animating.current = false;
      });
    },
    [sliderY]
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
      style={{ height: "100vh", overflow: "hidden" }}
      onWheel={handleWheel}
    >
      <motion.div style={{ y: sliderY }}>
        <div style={{ height: "100vh" }}>
          <Hero />
        </div>
        <div style={{ height: "100vh" }}>
          <WheelSection
            isActive={currentSlide === 1}
            onScrollUp={() => transitionTo(0)}
            onScrollDown={() => transitionTo(2)}
          />
        </div>
        <div style={{ height: "100vh" }}>
          <ReasonsSection
            isActive={currentSlide === 2}
            onScrollUp={() => transitionTo(1)}
            onScrollDown={() => transitionTo(3)}
          />
        </div>
        <div style={{ height: "100vh" }}>
          <WhatNextSection
            isActive={currentSlide === 3}
            onScrollUp={() => transitionTo(2)}
          />
        </div>
      </motion.div>
    </div>
  );
}
