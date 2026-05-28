"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MILESTONES = [
  { num: "01", label: "meeting on the red line" },
  { num: "02", label: "pickleball" },
  { num: "03", label: "first date" },
  { num: "04", label: "making it official" },
  { num: "05", label: "moving into pt" },
  { num: "06", label: "lolla" },
  { num: "07", label: "seattle" },
  { num: "08", label: "northcoast" },
  { num: "09", label: "cooking gyoza" },
  { num: "10", label: "nyc visit" },
  { num: "11", label: "bea" },
  { num: "12", label: "apples" },
  { num: "13", label: "halloween" },
  { num: "14", label: "bowling" },
  { num: "15", label: "your bday" },
  { num: "16", label: "ice skating" },
  { num: "17", label: "mammoth" },
  { num: "18", label: "seahawks game" },
  { num: "19", label: "knitting" },
  { num: "20", label: "nye" },
  { num: "21", label: "japan" },
  { num: "22", label: "bakeries" },
  { num: "23", label: "edc" },
  { num: "24", label: "365 days" },
];

const RADIUS = 590;
const CENTER_X = -155;
const ANGLE_STEP = 14;
const VISIBLE_ANGLE = 68;

interface Props {
  isActive: boolean;
  onScrollUp: () => void;
}

export default function WheelSection({ isActive, onScrollUp }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const accumRef = useRef(0);
  const lastFireRef = useRef(0);

  // Sync latest values to refs so the wheel handler never has stale closures
  const activeIdxRef = useRef(activeIdx);
  const isActiveRef = useRef(isActive);
  const onScrollUpRef = useRef(onScrollUp);
  activeIdxRef.current = activeIdx;
  isActiveRef.current = isActive;
  onScrollUpRef.current = onScrollUp;

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

      const current = activeIdxRef.current;

      if (dir > 0 && current < MILESTONES.length - 1) {
        setActiveIdx(current + 1);
      } else if (dir < 0 && current > 0) {
        setActiveIdx(current - 1);
      } else if (dir < 0 && current === 0) {
        lastFireRef.current = now + 700;
        onScrollUpRef.current();
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
        background: "#f8f8f6",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Circle arc */}
      <div
        style={{
          position: "absolute",
          width: RADIUS * 2,
          height: RADIUS * 2,
          borderRadius: "50%",
          border: "1px solid #dedede",
          left: CENTER_X - RADIUS,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Items along the arc */}
      {MILESTONES.map((item, i) => {
        const angleDeg = (i - activeIdx) * ANGLE_STEP;
        if (Math.abs(angleDeg) > VISIBLE_ANGLE + ANGLE_STEP) return null;

        const rad = (angleDeg * Math.PI) / 180;
        const x = CENTER_X + RADIUS * Math.cos(rad);
        const y = RADIUS * Math.sin(rad);
        const isItemActive = i === activeIdx;
        const dist = Math.abs(angleDeg) / VISIBLE_ANGLE;
        const opacity = isItemActive ? 1 : Math.max(0, 1 - dist * 0.88);

        return (
          <motion.button
            key={item.num}
            onClick={() => setActiveIdx(i)}
            animate={{ opacity }}
            transition={{ duration: 0.28 }}
            style={{
              position: "absolute",
              left: x,
              top: "50%",
              transform: `translate(-50%, calc(-50% + ${y}px))`,
              background: "none",
              border: "none",
              cursor: isItemActive ? "default" : "pointer",
              padding: "0.2rem 0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            {isItemActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#111",
                  flexShrink: 0,
                  display: "block",
                }}
              />
            )}
            <span
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: isItemActive ? "clamp(2rem, 3.2vw, 2.8rem)" : "clamp(1rem, 1.8vw, 1.5rem)",
                fontWeight: isItemActive ? 800 : 400,
                color: isItemActive ? "#111" : "#c2c2c2",
                lineHeight: 1,
                letterSpacing: isItemActive ? "-0.02em" : "0.01em",
                transition: "font-size 0.32s ease, color 0.28s ease",
                userSelect: "none",
              }}
            >
              {item.num}
            </span>
          </motion.button>
        );
      })}

      {/* Content — sits to the right of the active arc number */}
      <div
        style={{
          position: "absolute",
          left: CENTER_X + RADIUS + 55,
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "42vw",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#aaa",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: "0.65rem",
              }}
            >
              memory {MILESTONES[activeIdx].num}
            </div>
            <div
              style={{
                fontFamily: "var(--font-great-vibes)",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "#111",
                lineHeight: 1.25,
              }}
            >
              {MILESTONES[activeIdx].label}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation hint */}
      <div
        style={{
          position: "absolute",
          bottom: "1.8rem",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-montserrat)",
          fontSize: "0.6rem",
          color: "#ccc",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        scroll to navigate · scroll up to return
      </div>
    </section>
  );
}
