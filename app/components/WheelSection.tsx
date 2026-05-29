"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MILESTONES = [
  { date: "5/7/25",   label: "meeting on the red line", body: "you sat down next to me on the train and the whole world shifted. i didn't know it yet, but everything was about to change." },
  { date: "5/15/25",  label: "pickleball",              body: "our first hangout, pretending to play pickleball while really just falling for each other. you let me win." },
  { date: "5/22/25",  label: "first date",              body: "dinner that stretched into hours. i didn't want the night to end. i knew then that i was in trouble." },
  { date: "6/14/25",  label: "making it official",      body: "you asked, i said yes, and i think i floated home that night. officially yours, finally." },
  { date: "7/1/25",   label: "moving into pt",          body: "watching you build a life in our neighborhood made everything feel permanent in the best way." },
  { date: "7/18/25",  label: "lolla",                   body: "dancing in the crowd with you, music everywhere, and still the only thing i could focus on was you." },
  { date: "8/9/25",   label: "seattle",                 body: "rainy days, good coffee, and wandering with nowhere to be. every city feels like home when you're there." },
  { date: "9/6/25",   label: "northcoast",              body: "a weekend in the sun with all our favorite people. you always make the group better just by being there." },
  { date: "10/11/25", label: "apples",                  body: "apple picking in the fall, you being impossibly charming about everything. me falling a little more." },
  { date: "10/31/25", label: "halloween",               body: "your commitment to the bit is one of my favorite things. whatever we dressed up as, you made it iconic." },
  { date: "11/8/25",  label: "cooking gyoza",           body: "flour on the counter, music on, folding dumplings together. still one of my all-time favorite nights." },
  { date: "11/22/25", label: "nyc visit",               body: "the city felt electric. but honestly it always does when i'm with you. we could go anywhere." },
  { date: "12/6/25",  label: "bea",                     body: "watching you with bea — how gentle and patient you are. she chose you, and she has great taste." },
  { date: "12/13/25", label: "bowling",                 body: "you are annoyingly good at bowling. i'm choosing to find it charming instead of competitive." },
  { date: "12/31/25", label: "nye",                     body: "kissing you at midnight, surrounded by people we love. the best way to start a year." },
  { date: "1/4/26",   label: "ice skating",             body: "you held my hand on the ice and i pretended i needed the help. i didn't. i just wanted to hold your hand." },
  { date: "1/15/26",  label: "your bday",               body: "celebrating you is one of my favorite things. you deserve every good thing, on your birthday and always." },
  { date: "1/18/26",  label: "seahawks game",           body: "stadium noise, cold air, and you in that jersey. a perfect sunday." },
  { date: "2/14/26",  label: "mammoth",                 body: "snow and mountains and you. you make even the cold feel warm somehow." },
  { date: "3/8/26",   label: "knitting",                body: "watching you figure out knitting with complete seriousness and dedication is one of the most endearing things i've ever seen." },
  { date: "4/2/26",   label: "japan",                   body: "cherry blossoms and street food and getting lost with you. best trip of my life, no contest." },
  { date: "4/25/26",  label: "bakeries",                body: "finding the best pastries, walking for miles, talking about everything and nothing. an ordinary day made extraordinary." },
  { date: "5/17/26",  label: "edc",                     body: "dancing until sunrise with you. i'll follow you to any dance floor, anywhere, anytime." },
  { date: "7/11/26",  label: "365 days",                body: "a whole year of you. of us. i would choose this every single day, a thousand times over." },
];

const N    = MILESTONES.length;
const STEP = 360 / N;

const S       = 2200;
const CX      = S / 2;
const CY      = S / 2;
const GEAR_R  = 970;
const TOOTH_H = 72;
const GEAR_O  = GEAR_R + TOOTH_H;
const N_TEETH = 36;
const ITEM_R  = 912;
const RING_R  = ITEM_R + 30;

// Landscape aperture at east (clock-3)
// Wider window to fit dates like "10/31/25"
const WIN_W = 310;
const WIN_H = 88;
const WIN_X = CX + ITEM_R - WIN_W / 2;
const WIN_Y = CY - WIN_H / 2;

function buildGear(): string {
  const step = (2 * Math.PI) / N_TEETH;
  const hw   = step * 0.19;
  let d = "";
  for (let i = 0; i < N_TEETH; i++) {
    const a  = -Math.PI / 2 + i * step;
    const a0 = a - step / 2 + hw * 1.06;
    const a1 = a - hw;
    const a2 = a + hw;
    const a3 = a + step / 2 - hw * 1.06;
    const p  = (r: number, ang: number) =>
      `${CX + r * Math.cos(ang)},${CY + r * Math.sin(ang)}`;
    d += (i === 0 ? "M" : " L") + p(GEAR_R, a0);
    d += ` L${p(GEAR_O, a1)} L${p(GEAR_O, a2)} L${p(GEAR_R, a3)}`;
  }
  return d + " Z";
}
const GEAR_PATH = buildGear();

function idxFromRot(rot: number): number {
  return ((Math.round((90 - rot) / STEP) % N) + N) % N;
}

interface Props {
  isActive: boolean;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export default function WheelSection({ isActive, onScrollUp, onScrollDown }: Props) {
  const [rotation,  setRotation]  = useState(90);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragging,  setDragging]  = useState(false);

  const rotRef     = useRef(90);
  const dragRef    = useRef(false);
  const startAng   = useRef(0);
  const startRot   = useRef(0);
  const rafRef     = useRef<number | null>(null);
  const wheelRef   = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const accumRef   = useRef(0);
  const lastFire   = useRef(0);

  const isActiveRef = useRef(isActive);
  const onUpRef     = useRef(onScrollUp);
  const onDownRef   = useRef(onScrollDown);
  isActiveRef.current = isActive;
  onUpRef.current     = onScrollUp;
  onDownRef.current   = onScrollDown;

  const getAngle = useCallback((cx: number, cy: number) => {
    const el = wheelRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return (
      Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2)) *
      (180 / Math.PI)
    );
  }, []);

  // RAF-driven snap so text counter-rotation stays in sync with CSS position
  const snap = useCallback(() => {
    const idx    = idxFromRot(rotRef.current);
    const target = 90 - idx * STEP;
    const from   = rotRef.current;
    const start  = performance.now();

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t     = Math.min((now - start) / 480, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const r     = from + (target - from) * eased;
      setRotation(r);
      rotRef.current = r;
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    setActiveIdx(idx);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isActiveRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      dragRef.current = true;
      setDragging(true);
      startAng.current = getAngle(e.clientX, e.clientY);
      startRot.current = rotRef.current;
    },
    [getAngle]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      let delta = getAngle(e.clientX, e.clientY) - startAng.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      const newRot = startRot.current + delta;
      setRotation(newRot);
      rotRef.current = newRot;
      setActiveIdx(idxFromRot(newRot));
    },
    [getAngle]
  );

  const onPointerUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = false;
    setDragging(false);
    snap();
  }, [snap]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 40;
      if (e.deltaMode === 2) d *= 800;
      accumRef.current += d;
      const now = Date.now();
      if (Math.abs(accumRef.current) < 40 || now - lastFire.current < 700) return;
      lastFire.current = now + 700;
      const dir = accumRef.current > 0 ? 1 : -1;
      accumRef.current = 0;
      if (dir < 0) onUpRef.current(); else onDownRef.current();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
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
      {/* Volvelle wheel — only east arc visible */}
      <div
        style={{
          position: "absolute",
          left: `calc(22vw - ${CX + GEAR_O}px)`,
          top: "50%",
          transform: "translateY(-50%)",
          width: S,
          height: S,
          userSelect: "none",
        }}
      >
        {/* Rotating disk */}
        <div
          ref={wheelRef}
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotate(${rotation}deg)`,
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: "block" }}>
            {/* Gear teeth — same fill as wheel face, no stroke */}
            <path d={GEAR_PATH} fill="#f4f3f1" />
            {/* Wheel face on top of gear path (same color, seamless) */}
            <circle cx={CX} cy={CY} r={GEAR_R} fill="#f4f3f1" />
            {/* Outer ring */}
            <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#dcdad8" strokeWidth="1.5" />
            {/* Inner decorative ring */}
            <circle cx={CX} cy={CY} r={80} fill="none" stroke="#dcdad8" strokeWidth="1" />
            {/* Center pivot */}
            <circle cx={CX} cy={CY} r={52} fill="#e2e0de" stroke="#c4c2c0" strokeWidth="1.2" />
            <circle cx={CX} cy={CY} r={38} fill="#eeeceb" />
            <circle cx={CX} cy={CY} r={10} fill="#b0aeac" />

            {/* Items — dot + date text, both in counter-rotated frame so they stay upright.
                cx="30" in this frame = screen-east by 30px = RING_R distance from center.
                x="44" textAnchor="start" = date starts 14px to the right of the dot. */}
            {MILESTONES.map((item, i) => {
              const deg = i * STEP;
              const rad = (deg - 90) * (Math.PI / 180);
              const tx  = CX + ITEM_R * Math.cos(rad);
              const ty  = CY + ITEM_R * Math.sin(rad);
              return (
                <g
                  key={i}
                  transform={`translate(${tx},${ty}) rotate(${-rotation})`}
                  style={{ pointerEvents: "none" }}
                >
                  <circle cx="30" cy="0" r="5" fill="#1a1a1a" />
                  <text
                    x="44"
                    y="7"
                    textAnchor="start"
                    style={{
                      fontFamily: "var(--font-montserrat)",
                      fontSize: "18px",
                      fontWeight: 700,
                      fill: "#2a2828",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {item.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Fixed aperture overlay — does not rotate */}
        <svg
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}
          width={S}
          height={S}
          viewBox={`0 0 ${S} ${S}`}
        >
          <defs>
            <mask id="aperture-mask">
              <circle cx={CX} cy={CY} r={GEAR_R} fill="white" />
              {/* Landscape cutout at east */}
              <rect x={WIN_X} y={WIN_Y} width={WIN_W} height={WIN_H} rx={6} fill="black" />
            </mask>
          </defs>

          {/* Frosted overlay with clear window */}
          <rect width={S} height={S} fill="rgba(242,241,239,0.78)" mask="url(#aperture-mask)" />

          {/* Window frame */}
          <rect
            x={WIN_X} y={WIN_Y} width={WIN_W} height={WIN_H}
            rx={6} fill="none" stroke="#3a3836" strokeWidth="1.8"
          />

          {/* Arrow pointing left toward wheel center */}
          <polygon
            points={`${WIN_X - 2},${CY - 6} ${WIN_X - 2},${CY + 6} ${WIN_X - 12},${CY}`}
            fill="#3a3836"
          />
        </svg>
      </div>

      {/* Right panel — active memory detail */}
      <div
        style={{
          position: "absolute",
          left: "28vw",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(220px, 32vw, 340px)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22 }}
          >
            {/* Placeholder image */}
            <div
              style={{
                width: "100%",
                aspectRatio: "4/3",
                background: "#ececea",
                border: "1.5px dashed #ccc",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.1rem",
                gap: 8,
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "0.58rem", color: "#c0c0c0", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                photo
              </span>
            </div>

            {/* Date */}
            <div style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "#aaa",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: "0.3rem",
            }}>
              {MILESTONES[activeIdx].date}
            </div>

            {/* Label */}
            <div style={{
              fontFamily: "var(--font-great-vibes)",
              fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)",
              color: "#111",
              lineHeight: 1.25,
              marginBottom: "0.9rem",
            }}>
              {MILESTONES[activeIdx].label}
            </div>

            {/* Body text */}
            <div style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "0.78rem",
              color: "#777",
              lineHeight: 1.75,
              letterSpacing: "0.01em",
            }}>
              {MILESTONES[activeIdx].body}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          bottom: "1.6rem",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-montserrat)",
          fontSize: "0.58rem",
          color: "#ccc",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        drag wheel · scroll to navigate slides
      </div>
    </section>
  );
}
