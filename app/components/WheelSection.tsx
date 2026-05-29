"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MAP_LINK = "https://maps.app.goo.gl/";

const MILESTONES: { date: string; label: string; body: string; video?: string; images?: string[]; stickers?: string[]; link?: string }[] = [
  { date: "6/8/25",  label: "meeting on the red line", body: "the day my smiski got beheaded and i decided to go to the library to print a carrot to replace him and saw you on the train and immediately texted jimmy \"omg i have tea\" and then tried to wave you down 10 times", video: "/IMG_7882.MOV" },
  { date: "6/15/25", label: "june 15",                 body: "the very first picture i took of you lol", images: ["/june%2015.jpeg"], stickers: ["tangy bbq sauce"] },
  { date: "6/19/25", label: "june 19",                 body: "when you tricked me to go to dinner with you and i made you try okra. you clearly hated it but i thought it was cute that you were trying it anyways", images: ["/june%2019%20okra.jpeg"] },
  { date: "7/11/25", label: "july 11",                 body: "a very important day!", images: ["/july%2011%20carrot%20cake.jpeg", "/july%2011%20egg.jpeg"] },
  { date: "7/17/25", label: "pizza",                   body: "back when you used to come over and smoke weed with me and then eat so much candy and pizza", images: ["/july%2017%20pizza.jpeg"] },
  { date: "7/30/25", label: "july 30",                 body: "when we moved into our home, PT, the lotus hotel ❤️", images: ["/IMG_1158.jpeg", "/IMG_9636.jpeg", "/IMG_9669.jpeg", "/IMG_9683.jpeg"] },
  { date: "8/1/25",  label: "lolla",                   body: "when you met chloe at lolla and was so nervous and puked. also it was gf day :)", images: ["/aug1_1.jpeg", "/aug1_3.jpeg"], stickers: ["🍎", "i frew up"] },
  { date: "8/15/25", label: "aug 15",                  body: "can you believe you met my parents only one month into dating?", images: ["/aug%2015.jpeg"] },
  { date: "8/30/25", label: "aug 30",                  body: "when i cried bc i loved you so much and did too many substances", images: ["/aug30_1.jpeg", "/aug30_2.jpeg", "/aug30_3.jpeg"] },
  { date: "9/20/25", label: "sept 20",                 body: "one of my fav pics :) from wisconsin", images: ["/sept%2020.jpeg"] },
  { date: "10/10/25",label: "oct 10",                  body: "nyc trip! the trip where you started stealing my swag.. just kiddinggg the trip where you took me to places off my beli and took a million photos of me and impressed all my friends", images: ["/oct10_1.jpeg", "/oct10_2.jpeg", "/oct10_3.jpeg", "/oct10_4.jpeg"] },
  { date: "10/18/25",label: "oct 18",                  body: "i thought this was sooo cute", images: ["/oct%2018.jpeg"] },
  { date: "10/19/25",label: "oct 19",                  body: "and this too!! 😍 i love you!", images: ["/oct%2019.jpeg"] },
  { date: "10/25/25",label: "oct 25",                  body: "when we went apple picking and then had to get really creative with apple dishes", images: ["/oct25_1.jpeg", "/oct25_2.jpeg", "/oct25_3.jpeg", "/oct25_4.jpeg"] },
  { date: "10/31/25",label: "oct 31",                  body: "i told you you'd lose the cat toy and then you did :( its ok tho", images: ["/oct31_1.jpeg", "/oct31_2.jpeg"] },
  { date: "11/1/25", label: "nov 1",                   body: "your fav restaurant obvi. i remember really liking this date", images: ["/nov1_1.jpeg", "/nov1_2.jpeg"] },
  { date: "11/24/25",label: "nov 24",                  body: "when i slaved away on the sewing machine and bea ate thread and threw up", images: ["/nov24_1.jpeg", "/nov24_2.jpeg", "/nov24_3.jpeg", "/nov24_4.jpeg"] },
  { date: "11/27/25",label: "nov 27",                  body: "remember we ate this in like 2 sittings", images: ["/nov%2027.jpeg"] },
  { date: "11/28/25",label: "nov 28",                  body: "the one time i made you sit in the booth bc it was super uncomfy and then i took this photo of you looking really uncomfy", images: ["/nov%2028.jpeg"] },
  { date: "11/30/25",label: "nov 30",                  body: "when you watched me play in the snow on YOUR birthday. you really let me get away with so much 😛", images: ["/nov%2030.jpeg"] },
  { date: "12/14/25",label: "dec 14",                  body: "", images: ["/dec14_1.jpeg", "/dec14_2.jpeg"] },
  { date: "12/25/25",label: "dec 25",                  body: "", images: ["/dec25_1.jpeg", "/dec25_2.jpeg"] },
  { date: "1/2/26",  label: "jan 2",                   body: "", images: ["/jan2_1.jpeg", "/jan2_2.jpeg"] },
  { date: "1/8/26",  label: "jan 8",                   body: "", video: "/jan%208.MOV" },
  { date: "1/11/26", label: "jan 11",                  body: "", images: ["/jan11_1.jpeg", "/jan11_2.jpeg"] },
  { date: "2/12/26", label: "feb 12",                  body: "", images: ["/feb%2012.jpeg"] },
  { date: "3/8/26",  label: "mar 8",                   body: "", images: ["/mar%208.jpeg"] },
  { date: "5/18/26", label: "may 18",                  body: "", images: ["/may18_1.jpeg", "/may18_2.jpeg"] },
];

const N    = MILESTONES.length;
const STEP = 15; // fixed 15° spacing — same as original 24-item wheel

const S        = 2200;
const CX       = S / 2;      // 1100
const CY       = S / 2;      // 1100

const ITEM_R   = 920;
const DOT_R    = ITEM_R + 30;  // 950 — dots sit here

const GEAR_R  = 855;
const TOOTH_H = 22;
const N_TEETH = 48;

function buildGear(): string {
  const pts = N_TEETH * 24;
  let d = "";
  for (let i = 0; i <= pts; i++) {
    const θ = (i / pts) * Math.PI * 2;
    const r = GEAR_R + TOOTH_H * Math.cos(N_TEETH * θ);
    const x = CX + r * Math.cos(θ);
    const y = CY + r * Math.sin(θ);
    d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d + " Z";
}
const GEAR_PATH = buildGear();

function idxFromRot(rot: number): number {
  return ((Math.round((90 - rot) / STEP) % N) + N) % N;
}

function formatDate(raw: string): string {
  const [m, d, y] = raw.split("/");
  return `${m.padStart(2, "0")}/${d.padStart(2, "0")}/20${y}`;
}


export default function WheelSection() {
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

  const getAngle = useCallback((cx: number, cy: number) => {
    const el = wheelRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return (
      Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2)) *
      (180 / Math.PI)
    );
  }, []);

  // RAF-driven snap so text counter-rotation stays in sync with CSS position.
  // Pass forceIdx to animate to a specific item (e.g. arrow keys); omit to snap to nearest.
  const snap = useCallback((forceIdx?: number) => {
    const idx    = forceIdx !== undefined ? forceIdx : idxFromRot(rotRef.current);
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
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 40;
      if (e.deltaMode === 2) d *= 800;
      accumRef.current += d;
      const now = Date.now();
      if (Math.abs(accumRef.current) < 40 || now - lastFire.current < 550) return;
      if (rafRef.current !== null) { accumRef.current = 0; return; }
      lastFire.current = now + 550;
      const dir = accumRef.current > 0 ? 1 : -1;
      accumRef.current = 0;
      const curIdx = idxFromRot(rotRef.current);
      const nextIdx = dir > 0 ? (curIdx + 1) % N : (curIdx - 1 + N) % N;
      snap(nextIdx);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [snap]);

  // Arrow key navigation through timeline items
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const curIdx = idxFromRot(rotRef.current);
      const nextIdx = e.key === "ArrowDown"
        ? (curIdx + 1) % N
        : (curIdx - 1 + N) % N;
      snap(nextIdx);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [snap]);

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
      {/* Volvelle wheel — only east arc visible.
          Container positioned so the outer date ring edge (OUTER_R) lands at ~22vw. */}
      <div
        style={{
          position: "absolute",
          left: `calc(22vw - ${CX + DOT_R}px)`,
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
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: "block", overflow: "visible" }}>
            {/* Sinusoidal gear — shallow rounded teeth */}
            <path d={GEAR_PATH} fill="#d8d4ce" />
            {/* Center decoration */}
            <circle cx={CX} cy={CY} r={52} fill="#e8e6e3" stroke="#d8d5d1" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={14} fill="#c4c1bd" />
            {/* Date ring aligned with dots */}
            <circle cx={CX} cy={CY} r={DOT_R} fill="none" stroke="#dcdad8" strokeWidth="1.5" />

            {/* Items — dot at cx=30 (screen-east = ITEM_R+30), date right of dot.
                Active item gets full dark color; others are dimmed. */}
            {MILESTONES.map((item, i) => {
              const deg      = i * STEP;
              const rad      = (deg - 90) * (Math.PI / 180);
              const tx       = CX + ITEM_R * Math.cos(rad);
              const ty       = CY + ITEM_R * Math.sin(rad);
              const isActive = i === activeIdx;
              const dotFill  = isActive ? "#1a1a1a" : "#c8c6c4";
              const textFill = isActive ? "#1a1a1a" : "#c5c3c1";
              const fontSize = isActive ? 26 : 17;
              const dotR     = isActive ? 6 : 4;
              return (
                <g
                  key={i}
                  transform={`translate(${tx},${ty}) rotate(${-rotation})`}
                  style={{ pointerEvents: "none" }}
                >
                  <circle cx="30" cy="0" r={dotR} fill={dotFill} />
                  <text
                    x="44"
                    y={isActive ? 9 : 6}
                    textAnchor="start"
                    style={{
                      fontFamily: "var(--font-code)",
                      fontSize: `${fontSize}px`,
                      fontWeight: isActive ? 700 : 500,
                      fill: textFill,
                      fontVariantNumeric: "slashed-zero",
                    }}
                  >
                    {formatDate(item.date)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

      </div>

      {/* Right panel — active memory detail, positioned past the wheel arc */}
      <div
        style={{
          position: "absolute",
          left: "calc(22vw + 380px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(300px, 38vw, 460px)",
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
            {/* Media */}
            {(() => {
              const m = MILESTONES[activeIdx];
              const STICKER_POSITIONS = [
                { bottom: "0.9rem", right: "0.9rem", rotate:  "5deg",  bg: "#e8420a" },
                { bottom: "0.9rem", left:  "0.9rem", rotate: "-6deg",  bg: "#2d7d46" },
                { top:    "0.9rem", right: "0.9rem", rotate:  "3deg",  bg: "#1a6eb5" },
              ];
              const StickerBadge = ({ text, pos }: { text: string; pos: typeof STICKER_POSITIONS[0] }) => (
                <div style={{ position: "absolute", bottom: pos.bottom, top: pos.top, left: pos.left, right: pos.right, transform: `rotate(${pos.rotate})`, zIndex: 2 }}>
                  <div style={{ background: pos.bg, borderRadius: 10, padding: "0.45rem 0.85rem", boxShadow: "0 4px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.22)" }}>
                    <div style={{ fontFamily: "var(--font-montserrat)", fontWeight: 900, fontSize: "0.7rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{text}</div>
                  </div>
                </div>
              );

              if (m.video) {
                return (
                  <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, overflow: "hidden", marginBottom: "1.1rem", willChange: "transform" }}>
                    <video key={m.video} src={m.video} autoPlay muted loop playsInline
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 10, transform: "translateY(15px)" }} />
                  </div>
                );
              }
              if (m.images && m.images.length >= 2) {
                return (
                  <div style={{ position: "relative", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: "1.1rem" }}>
                    {m.images.slice(0, 4).map((src, i) => (
                      <div key={i} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden" }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    ))}
                    {m.stickers?.map((s, i) => <StickerBadge key={i} text={s} pos={STICKER_POSITIONS[i % STICKER_POSITIONS.length]} />)}
                  </div>
                );
              }
              if (m.images?.length === 1) {
                return (
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1", borderRadius: 10, overflow: "hidden", marginBottom: "1.1rem" }}>
                    <img src={m.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    {m.stickers?.map((s, i) => <StickerBadge key={i} text={s} pos={STICKER_POSITIONS[i % STICKER_POSITIONS.length]} />)}
                  </div>
                );
              }
              if (m.stickers?.length) {
                return (
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1", borderRadius: 10, background: "#f5f4f2", border: "1.5px dashed #ddd", marginBottom: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.2rem", flexWrap: "wrap", padding: "1.5rem" }}>
                    {m.stickers.map((s, i) => {
                      const rotations = ["-5deg", "4deg", "-3deg"];
                      const colors    = ["#e8420a", "#2d7d46", "#1a6eb5"];
                      return (
                        <div key={i} style={{ transform: `rotate(${rotations[i % rotations.length]})` }}>
                          <div style={{ background: colors[i % colors.length], borderRadius: 14, padding: "0.75rem 1.3rem", boxShadow: "0 6px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.22)" }}>
                            <div style={{ fontFamily: "var(--font-montserrat)", fontWeight: 900, fontSize: "1rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{s}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              return (
                <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, background: "#ececea", border: "1.5px dashed #ccc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "1.1rem" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "0.58rem", color: "#c0c0c0", letterSpacing: "0.12em", textTransform: "uppercase" }}>photo</span>
                </div>
              );
            })()}

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

            {/* Map link — only on last milestone */}
            {MILESTONES[activeIdx].link && (
              <a
                href={MILESTONES[activeIdx].link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "var(--font-montserrat)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#111",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderBottom: "1.5px solid #111",
                  paddingBottom: "0.1rem",
                  width: "fit-content",
                }}
              >
                open in google maps
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 10L10 2M10 2H5M10 2V7" />
                </svg>
              </a>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}
