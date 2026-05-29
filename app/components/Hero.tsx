"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TEXT            = "to my dearest thomas...";
const TOTAL           = 365;
const SCROLL_DURATION = 1800;

function charDelay(char: string, prev: string): number {
  if (prev === "." || prev === ",") return 180 + Math.random() * 120;
  if (char === ".")                  return 140 + Math.random() * 80;
  return 75 + Math.random() * 95;
}

const PARTICLES = [
  { dx:  -15, dy: -170, size: 16, delay: 0.00 },
  { dx:   60, dy: -155, size: 12, delay: 0.02 },
  { dx:  -90, dy: -140, size: 14, delay: 0.01 },
  { dx:   20, dy: -205, size:  9, delay: 0.03 },
  { dx: -150, dy: -105, size: 10, delay: 0.05 },
  { dx:  105, dy: -178, size: 13, delay: 0.04 },
  { dx:  -45, dy: -220, size:  8, delay: 0.02 },
  { dx:  145, dy: -128, size: 11, delay: 0.03 },
  { dx: -185, dy:  -82, size:  9, delay: 0.07 },
  { dx:   38, dy: -230, size:  8, delay: 0.01 },
  { dx:  -28, dy: -188, size: 12, delay: 0.04 },
  { dx:  178, dy:  -92, size:  8, delay: 0.06 },
  { dx: -118, dy: -162, size: 11, delay: 0.03 },
  { dx:   88, dy: -210, size: 10, delay: 0.05 },
  { dx:   68, dy: -132, size:  7, delay: 0.06 },
  { dx: -205, dy:  -58, size:  7, delay: 0.08 },
  { dx:  -72, dy: -235, size:  9, delay: 0.02 },
  { dx:  118, dy: -148, size:  8, delay: 0.04 },
];

function HeartBurst() {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            fontSize: p.size,
            color: "#E31837",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.dx, y: p.dy, opacity: [1, 1, 0], scale: [0, 1.4, 1] }}
          transition={{ duration: 1.0, delay: p.delay, ease: "easeOut" }}
        >
          ♥
        </motion.span>
      ))}
    </>
  );
}

interface Props {
  onDismiss: () => void;
}

export default function Hero({ onDismiss }: Props) {
  const [displayed, setDisplayed] = useState("");
  const [done,      setDone]      = useState(false);
  const [cursorOn,  setCursorOn]  = useState(true);
  const [showDays,  setShowDays]  = useState(false);
  const [flipNum,   setFlipNum]   = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (displayed.length >= TEXT.length) { setDone(true); return; }
    const char = TEXT[displayed.length];
    const prev = TEXT[displayed.length - 1] ?? "";
    const t = setTimeout(
      () => setDisplayed(TEXT.slice(0, displayed.length + 1)),
      charDelay(char, prev)
    );
    return () => clearTimeout(t);
  }, [displayed]);

  useEffect(() => {
    if (!done) return;
    const blinkId = setInterval(() => setCursorOn((v) => !v), 530);
    const showId  = setTimeout(() => setShowDays(true), 900);
    return () => { clearInterval(blinkId); clearTimeout(showId); };
  }, [done]);

  useEffect(() => {
    if (!showDays) return;
    const start = performance.now();
    const tick  = (now: number) => {
      const t     = Math.min((now - start) / SCROLL_DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setFlipNum(Math.round(eased * TOTAL));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else        setCelebrate(true);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [showDays]);

  const cursorVisible = done && !showDays && cursorOn;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 300, delay: 0.05 }}
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 20,
          padding: "4rem 4.5rem 3.8rem",
          width: "min(600px, 90vw)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.6rem",
          zIndex: 1,
          boxShadow: "0 24px 80px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Typewriter */}
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-great-vibes)",
            fontSize: "1.4rem",
            fontWeight: 400,
            color: "#888",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          {displayed}
          <span style={{ opacity: cursorVisible ? 1 : 0 }}>|</span>
        </p>

        {/* HAPPY 365 DAYS counter */}
        <motion.div
          initial={false}
          animate={showDays
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 28, scale: 0.88 }
          }
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            style={{
              fontSize: "clamp(3rem, 10vw, 5rem)",
              display: "flex",
              alignItems: "center",
              gap: "0.25em",
              fontFamily: "var(--font-montserrat)",
              fontWeight: 800,
              color: "#000",
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: "0.48em", lineHeight: 1 }}>HAPPY</span>
            <div style={{ position: "relative", minWidth: "1.65em", textAlign: "center" }}>
              <div style={{ overflow: "hidden", height: "1em", lineHeight: 1 }}>
                <span
                  key={flipNum}
                  style={{
                    display: "block",
                    fontSize: "inherit",
                    fontWeight: "inherit",
                    color: "inherit",
                    lineHeight: 1,
                    animation: "slot-up 0.085s ease-out both",
                  }}
                >
                  {flipNum}
                </span>
              </div>
              {celebrate && <HeartBurst />}
            </div>
            <span style={{ fontSize: "0.48em", lineHeight: 1 }}>DAYS!</span>
          </div>
        </motion.div>

        {/* Nav hint + button — fade in after celebrate */}
        <motion.div
          initial={false}
          animate={celebrate ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.1rem",
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "0.57rem",
              color: "#bbb",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            drag or press ↑ ↓ to navigate timeline
          </div>

          <button
            onClick={onDismiss}
            style={{
              padding: "0.75rem 2.2rem",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontFamily: "var(--font-montserrat)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.2s",
              width: "100%",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#333")}
            onMouseLeave={e => (e.currentTarget.style.background = "#111")}
          >
            let&apos;s go!
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
