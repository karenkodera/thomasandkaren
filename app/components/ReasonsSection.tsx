"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REASONS = [
  "the way you still make my heart skip a beat, even after 365 days",
  "how you always know when i need you, without me saying a word",
  "the way you turn every ordinary moment into a memory",
  "how genuinely excited you get about the things you love",
  "the way you make me feel completely safe",
  "how you're always up for an adventure — japan, lolla, northcoast, wherever",
  "the way you care so deeply about the people in your life",
  "how you make me laugh harder than anyone ever has",
  "the way you show up for me, every single day",
  "how patient and kind you are, even when things are hard",
  "the way you look at me like i'm everything",
  "how making gyoza with you is one of my favorite memories",
  "the way you hold my hand and make everything feel okay",
  "how you push me to be braver than i ever thought i could be",
  "the way you find joy in everything — even knitting",
  "how thoughtful you are in the smallest, most meaningful ways",
  "the way your laugh fills up the whole room",
  "how you make home feel like wherever you are",
  "the way you love bea like she's part of the family",
  "how proud i am to be yours, every single day",
];

interface Props {
  isActive: boolean;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export default function ReasonsSection({ isActive, onScrollUp, onScrollDown }: Props) {
  const [idx, setIdx] = useState(-1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const accumRef = useRef(0);
  const lastFireRef = useRef(0);

  const isActiveRef = useRef(isActive);
  const onScrollUpRef = useRef(onScrollUp);
  const onScrollDownRef = useRef(onScrollDown);
  isActiveRef.current = isActive;
  onScrollUpRef.current = onScrollUp;
  onScrollDownRef.current = onScrollDown;

  const handleGenerate = () => {
    setIdx(prev => (prev + 1) % REASONS.length);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!isActiveRef.current) return;
      e.preventDefault();

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      if (e.deltaMode === 2) delta *= 800;
      accumRef.current += delta;

      const now = Date.now();
      if (Math.abs(accumRef.current) < 40 || now - lastFireRef.current < 600) return;
      lastFireRef.current = now;
      const dir = accumRef.current > 0 ? 1 : -1;
      accumRef.current = 0;

      if (dir < 0) {
        lastFireRef.current = now + 700;
        onScrollUpRef.current();
      } else {
        lastFireRef.current = now + 700;
        onScrollDownRef.current();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "min(580px, 88vw)", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-great-vibes)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            color: "#888",
            lineHeight: 1,
          }}
        >
          reasons why i love you:
        </div>

        {/* Field + button */}
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
          {/* Display field — single line */}
          <div
            style={{
              flex: 1,
              height: "3rem",
              border: "1.5px solid #e8e8e8",
              borderRadius: 10,
              padding: "0 1.1rem",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="wait">
              {idx >= 0 ? (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontSize: "clamp(0.78rem, 1.2vw, 1rem)",
                    fontWeight: 500,
                    color: "#111",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {REASONS[idx]}
                </motion.span>
              ) : (
                <motion.span
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontSize: "0.8rem",
                    color: "#ccc",
                    letterSpacing: "0.06em",
                  }}
                >
                  press generate...
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            style={{
              padding: "0.75rem 1.4rem",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontFamily: "var(--font-montserrat)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              cursor: "pointer",
              flexShrink: 0,
              marginTop: 2,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#333")}
            onMouseLeave={e => (e.currentTarget.style.background = "#111")}
          >
            generate
          </button>
        </div>

      </div>
    </section>
  );
}
