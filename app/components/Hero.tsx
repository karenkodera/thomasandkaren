"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RED = "#E31837";
const PI  = Math.PI;

// They got together July 11 2025; anniversary is July 11 2026 (365:00:00)
const START_DATE = new Date("2025-07-11T00:00:00");
const ANNIV_DATE = new Date("2026-07-11T00:00:00");

// ─── Analog clock ─────────────────────────────────────────────────────────────

const S = 320; // SVG internal coordinate size
const CX = S / 2;
const CY = S / 2;
const R  = S / 2 - 8; // face radius

function handEnd(deg: number, len: number) {
  const rad = (deg - 90) * (PI / 180);
  return { x: CX + len * Math.cos(rad), y: CY + len * Math.sin(rad) };
}

function AnalogClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div style={{ width: "100%", paddingBottom: "100%" }} />;

  const ms  = now.getMilliseconds();
  const sec = now.getSeconds() + ms / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr  = (now.getHours() % 12) + min / 60;

  const sDeg = sec * 6;
  const mDeg = min * 6;
  const hDeg = hr  * 30;

  const sTip  = handEnd(sDeg, R * 0.83);
  const sTail = handEnd(sDeg + 180, R * 0.22);
  const mTip  = handEnd(mDeg, R * 0.73);
  const hTip  = handEnd(hDeg, R * 0.52);

  // 60 tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6 - 90) * (PI / 180);
    const isHour = i % 5 === 0;
    const inner  = CX + (R - (isHour ? 18 : 9)) * Math.cos(angle);
    const innerY = CY + (R - (isHour ? 18 : 9)) * Math.sin(angle);
    const outer  = CX + R * Math.cos(angle);
    const outerY = CY + R * Math.sin(angle);
    return { x1: inner, y1: innerY, x2: outer, y2: outerY, isHour };
  });

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      {/* Drop shadow filter */}
      <defs>
        <filter id="clock-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor={RED} floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Face */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="white"
        stroke={RED}
        strokeWidth="4"
        filter="url(#clock-shadow)"
      />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={RED}
          strokeWidth={t.isHour ? 3 : 1.2}
          strokeLinecap="round"
          opacity={t.isHour ? 1 : 0.35}
        />
      ))}

      {/* Hour hand */}
      <line
        x1={CX} y1={CY} x2={hTip.x} y2={hTip.y}
        stroke={RED} strokeWidth="10" strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={CX} y1={CY} x2={mTip.x} y2={mTip.y}
        stroke={RED} strokeWidth="6" strokeLinecap="round"
      />

      {/* Second hand + counterbalance */}
      <line
        x1={sTail.x} y1={sTail.y} x2={sTip.x} y2={sTip.y}
        stroke={RED} strokeWidth="2" strokeLinecap="round"
      />

      {/* Center cap */}
      <circle cx={CX} cy={CY} r={9}  fill={RED} />
      <circle cx={CX} cy={CY} r={4}  fill="white" />
    </svg>
  );
}

// ─── Elapsed counter ──────────────────────────────────────────────────────────

function pad(n: number, digits = 2) {
  return n.toString().padStart(digits, "0");
}

function useElapsed() {
  const [state, setState] = useState({ days: 0, hrs: 0, mins: 0, reached: false });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      if (now >= ANNIV_DATE.getTime()) {
        setState({ days: 365, hrs: 0, mins: 0, reached: true });
        return;
      }
      const diff = now - START_DATE.getTime();
      setState({
        days:    Math.floor(diff / 86_400_000),
        hrs:     Math.floor((diff % 86_400_000) / 3_600_000),
        mins:    Math.floor((diff % 3_600_000)  / 60_000),
        reached: false,
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}

// ─── Sticker shapes ──────────────────────────────────────────────────────────

function StarSvg({ size, fill = RED }: { size: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" overflow="visible">
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z"
        fill={fill}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartSvg({ size, fill = RED }: { size: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" overflow="visible">
      <path
        d="M12 21.6C6.37 16.06 1 11.3 1 7.19 1 3.4 4.07 2 6.28 2c1.31 0 4.15.5 5.72 4.46C13.59 2.49 16.46 2 17.72 2 20.26 2 23 3.62 23 7.19c0 4.07-5.14 8.62-11 14.4z"
        fill={fill}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" overflow="visible">
      <path
        d="M16 2L18.5 12.5L29 16L18.5 19.5L16 30L13.5 19.5L3 16L13.5 12.5Z"
        fill={RED} stroke="white" strokeWidth="2" strokeLinejoin="round"
      />
      <path
        d="M26 4L27.3 8.7L32 10L27.3 11.3L26 16L24.7 11.3L20 10L24.7 8.7Z"
        fill={RED} stroke="white" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function XoxoPill() {
  return (
    <div style={{
      background: "white",
      border: `3px solid ${RED}`,
      borderRadius: 999,
      padding: "7px 18px",
      fontFamily: "var(--font-nunito)",
      fontSize: "1rem",
      fontWeight: 800,
      color: RED,
      whiteSpace: "nowrap",
      lineHeight: 1.2,
    }}>
      xoxo ♥
    </div>
  );
}

function LovePill() {
  return (
    <div style={{
      background: RED,
      border: "3px solid white",
      borderRadius: 999,
      padding: "7px 18px",
      fontFamily: "var(--font-nunito)",
      fontSize: "0.95rem",
      fontWeight: 800,
      color: "white",
      whiteSpace: "nowrap",
      lineHeight: 1.2,
    }}>
      love ★
    </div>
  );
}

function StickerEl({ type }: { type: string }) {
  switch (type) {
    case "star-lg":    return <StarSvg size={62} />;
    case "star-sm":    return <StarSvg size={38} />;
    case "heart-lg":   return <HeartSvg size={56} />;
    case "heart-sm":   return <HeartSvg size={34} />;
    case "sparkle":    return <SparkleSvg size={54} />;
    case "xoxo":       return <XoxoPill />;
    case "love":       return <LovePill />;
    default:           return null;
  }
}

// Positions: top / bottom rows framing the clock; avoid the center zone
const STICKERS = [
  // — top row —
  { id: 1,  left: "4%",  top: "4%",  rotate: -18, type: "star-lg",  delay: 0.10 },
  { id: 2,  left: "79%", top: "3%",  rotate:  13, type: "heart-lg", delay: 0.18 },
  { id: 3,  left: "40%", top: "2%",  rotate:   6, type: "sparkle",  delay: 0.26 },
  { id: 4,  left: "62%", top: "7%",  rotate: -10, type: "star-sm",  delay: 0.32 },
  { id: 5,  left: "19%", top: "8%",  rotate:  20, type: "heart-sm", delay: 0.22 },
  // — sides —
  { id: 6,  left: "88%", top: "42%", rotate: -14, type: "star-sm",  delay: 0.40 },
  { id: 7,  left: "1%",  top: "46%", rotate:  16, type: "heart-sm", delay: 0.44 },
  // — bottom row —
  { id: 8,  left: "5%",  top: "82%", rotate:  15, type: "xoxo",     delay: 0.52 },
  { id: 9,  left: "70%", top: "84%", rotate:  -9, type: "love",     delay: 0.58 },
  { id: 10, left: "18%", top: "85%", rotate: -22, type: "star-lg",  delay: 0.48 },
  { id: 11, left: "82%", top: "80%", rotate:  11, type: "heart-lg", delay: 0.56 },
  { id: 12, left: "46%", top: "90%", rotate:  -5, type: "sparkle",  delay: 0.64 },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { days, hrs, mins, reached } = useElapsed();

  return (
    <main
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center gap-8"
      style={{ background: "#ffffff", fontFamily: "var(--font-nunito)" }}
    >
      {/* Sticker decorations */}
      {STICKERS.map((s) => (
        <motion.div
          key={s.id}
          aria-hidden
          className="absolute pointer-events-none z-0"
          style={{
            left: s.left,
            top: s.top,
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.18))",
          }}
          initial={{ opacity: 0, scale: 0, rotate: s.rotate - 25 }}
          animate={{ opacity: 1, scale: 1, rotate: s.rotate }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: s.delay }}
        >
          <StickerEl type={s.type} />
        </motion.div>
      ))}

      {/* Analog clock */}
      <motion.div
        className="relative z-10"
        style={{ width: "min(320px, 74vw)", aspectRatio: "1" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnalogClock />
      </motion.div>

      {/* Counter / celebration */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <AnimatePresence mode="wait">
          {!reached ? (
            <motion.div
              key="counter"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              <p
                style={{
                  fontSize: "clamp(2.2rem, 8vw, 3.6rem)",
                  fontWeight: 900,
                  color: RED,
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}
              >
                {pad(days, 3)}&nbsp;:&nbsp;{pad(hrs)}&nbsp;:&nbsp;{pad(mins)}
              </p>
              <div
                className="flex gap-8 sm:gap-10"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#bbb",
                }}
              >
                <span>days</span>
                <span>hrs</span>
                <span>min</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                style={{
                  fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
                  fontWeight: 900,
                  color: RED,
                  textAlign: "center",
                  lineHeight: 1.25,
                }}
              >
                Happy 1 Year<br />Anniversary!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
