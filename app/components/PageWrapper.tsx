"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Hero from "./Hero";
import WheelSection from "./WheelSection";

export default function PageWrapper() {
  const [showHero, setShowHero] = useState(true);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <WheelSection />
      <AnimatePresence>
        {showHero && (
          <Hero key="hero" onDismiss={() => setShowHero(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
